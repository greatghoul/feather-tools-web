import { useState, useRef, useEffect } from 'preact/hooks';
import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const ProcessCard = ({ images, settings, sizes, onDownload }) => {
    const [isProcessed, setIsProcessed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [mergeSettings, setMergeSettings] = useState(null); // Store settings snapshot when merging
    const canvasRef = useRef(null);
    
    const mergeImages = () => {
        if (!images || images.length === 0) return;
        
        setIsProcessing(true);
        
        // Save current settings snapshot for consistent merging
        const currentSettings = {...settings};
        setMergeSettings(currentSettings);
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { direction, width, height, bgColor, margin, padding } = currentSettings;
        
        // Clear the canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate merged canvas dimensions
        let canvasWidth, canvasHeight;
        let imageElements = [];
        
        // Ensure all images are valid HTMLImageElement
        const promises = images.map(img => {
            return new Promise((resolve, reject) => {
                let imageElement;
                
                // If already an Image element, use it directly
                if (img instanceof HTMLImageElement) {
                    imageElement = img;
                    if (imageElement.complete) {
                        resolve(imageElement);
                    } else {
                        imageElement.onload = () => resolve(imageElement);
                        imageElement.onerror = reject;
                    }
                } else if (img.url || img.src) {
                    // If object contains url or src property, create new Image element
                    imageElement = new Image();
                    imageElement.src = img.url || img.src;
                    imageElement.onload = () => resolve(imageElement);
                    imageElement.onerror = reject;
                } else {
                    reject(new Error('Invalid image format'));
                }
            });
        });
        
        Promise.all(promises)
            .then(loadedImages => {
                imageElements = loadedImages;
                
                // Calculate image dimensions based on direction:
                // Vertical: width can be max/min/number, height is auto
                // Horizontal: width is auto, height can be max/min/number
                const finalImageWidths = [];
                const finalImageHeights = [];
                
                if (direction === 'horizontal') {
                    // Horizontal direction: width is auto, height can be max/min/number
                    if (height === 'max') {
                        // Find maximum height
                        const maxHeight = sizes.maxHeight;
                        
                        // All images use maximum height, calculate width proportionally
                        imageElements.forEach(img => {
                            const aspectRatio = img.width / img.height;
                            finalImageWidths.push(maxHeight * aspectRatio);
                            finalImageHeights.push(maxHeight);
                        });
                    } else if (height === 'min') {
                        // Find minimum height
                        const minHeight = sizes.minHeight;
                        
                        // All images use minimum height, calculate width proportionally
                        imageElements.forEach(img => {
                            const aspectRatio = img.width / img.height;
                            finalImageWidths.push(minHeight * aspectRatio);
                            finalImageHeights.push(minHeight);
                        });
                    } else if (typeof height === 'number' && height > 0) {
                        // Use fixed height, calculate width proportionally
                        imageElements.forEach(img => {
                            const aspectRatio = img.width / img.height;
                            finalImageWidths.push(height * aspectRatio);
                            finalImageHeights.push(height);
                        });
                    } else {
                        // Default to original dimensions
                        imageElements.forEach(img => {
                            finalImageWidths.push(img.width);
                            finalImageHeights.push(img.height);
                        });
                    }
                } else { // vertical
                    // Vertical direction: width can be max/min/number, height is auto
                    if (width === 'max') {
                        // Find maximum width
                        const maxWidth = sizes.maxWidth;
                        
                        // All images use maximum width, calculate height proportionally
                        imageElements.forEach(img => {
                            const aspectRatio = img.height / img.width;
                            finalImageWidths.push(maxWidth);
                            finalImageHeights.push(maxWidth * aspectRatio);
                        });
                    } else if (width === 'min') {
                        // Find minimum width
                        const minWidth = sizes.minWidth;
                        
                        // All images use minimum width, calculate height proportionally
                        imageElements.forEach(img => {
                            const aspectRatio = img.height / img.width;
                            finalImageWidths.push(minWidth);
                            finalImageHeights.push(minWidth * aspectRatio);
                        });
                    } else if (typeof width === 'number' && width > 0) {
                        // Use fixed width, calculate height proportionally
                        imageElements.forEach(img => {
                            const aspectRatio = img.height / img.width;
                            finalImageWidths.push(width);
                            finalImageHeights.push(width * aspectRatio);
                        });
                    } else {
                        // Default to original dimensions
                        imageElements.forEach(img => {
                            finalImageWidths.push(img.width);
                            finalImageHeights.push(img.height);
                        });
                    }
                }
                
                const numImages = imageElements.length;
                // Calculate merged canvas dimensions
                let canvasWidth = 0;
                let canvasHeight = 0;
                
                if (direction === 'horizontal') {
                    // Horizontal direction: canvas width is sum of all image widths, height is maximum image height
                    canvasWidth = finalImageWidths.reduce((sum, width) => sum + width, 0);
                    canvasHeight = Math.max(...finalImageHeights);
                } else {
                    // Vertical direction: canvas width is maximum image width, height is sum of all image heights
                    canvasWidth = Math.max(...finalImageWidths);
                    canvasHeight = finalImageHeights.reduce((sum, height) => sum + height, 0);
                }
                
                // Add padding and margin
                if (direction === 'horizontal') {
                    canvasWidth += (numImages > 1 ? padding * (numImages - 1) : 0) + margin * 2;
                    canvasHeight += margin * 2;
                } else { // vertical
                    canvasWidth += margin * 2;
                    canvasHeight += (numImages > 1 ? padding * (numImages - 1) : 0) + margin * 2;
                }
                
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                
                // 绘制边框背景
                ctx.fillStyle = bgColor || '#ffffff';
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                
                // 绘制图片
                let x = margin;
                let y = margin;
                
                for (let i = 0; i < imageElements.length; i++) {
                    const img = imageElements[i];
                    // 使用调整后的尺寸
                    const imgWidth = finalImageWidths[i];
                    const imgHeight = finalImageHeights[i];
                    
                    ctx.drawImage(img, x, y, imgWidth, imgHeight);
                    
                    if (direction === 'horizontal') {
                        x += imgWidth + padding;
                    } else {
                        y += imgHeight + padding;
                    }
                }
                
                setIsProcessed(true);
                setIsProcessing(false);
            })
            .catch(error => {
                console.error('Error loading images:', error);
                alert(getText('merge-images/error/process_failed'));
                setIsProcessing(false);
            });
    };
    
    const downloadImage = () => {
        if (canvasRef.current && onDownload) {
            const dataURL = canvasRef.current.toDataURL();
            onDownload(dataURL);
        }
    };

    const renderNavItem = (label, icon) => {
        return html`
            <li class="nav-item">
                <a 
                    class="nav-link active" 
                    href="#"
                >
                    <i class="bi bi-${icon} me-1"></i>
                    ${label}
                </a>
            </li>
        `;
    };

    const renderTabContent = () => {
        const isHorizontal = (mergeSettings || settings).direction === 'horizontal';
        const cardBodyStyle = isHorizontal ? { overflowX: 'auto' } : {};
        const canvasClass = `border ${!isProcessed || isProcessing ? 'd-none' : ''} ${!isHorizontal ? 'img-fluid' : ''}`;
        const canvasStyle = isHorizontal ? { maxHeight: '300px' } : {};

        return html`
            <div class="card-body" style=${cardBodyStyle}>
                <div class="text-center">
                    <canvas 
                        ref=${canvasRef} 
                        class=${canvasClass}
                        style=${canvasStyle}
                        alt="Merged Result"
                    ></canvas>
                    ${isProcessing ? html`
                        <div class="d-flex justify-content-center align-items-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Processing...</span>
                            </div>
                            <span class="ms-2">${getText('merge-images/status/processing')}</span>
                        </div>
                    ` : !isProcessed && html`
                        <p class="text-muted text-center py-5">${getText('merge-images/status/click_to_process')}</p>
                    `}
                </div>
            </div>
        `;
    };

    const renderSettingsInfo = () => {
        const currentSettings = mergeSettings || settings;
        const { direction, width, height } = currentSettings;
        
        // Calculate final dimensions
        let finalWidth = 0;
        let finalHeight = 0;
        
        if (images && images.length > 0) {
            const numImages = images.length;
            const { margin, padding } = currentSettings;
            
            if (direction === 'horizontal') {
                // Horizontal direction: width is sum of all image widths, height is maximum image height
                const imageWidths = images.map(img => {
                    if (height === 'max') return sizes.maxWidth;
                    if (height === 'min') return sizes.minWidth;
                    if (typeof height === 'number') return Math.round(height * (img.width / img.height));
                    return img.width;
                });
                const imageHeights = images.map(img => {
                    if (height === 'max') return sizes.maxHeight;
                    if (height === 'min') return sizes.minHeight;
                    if (typeof height === 'number') return height;
                    return img.height;
                });
                
                finalWidth = Math.round(imageWidths.reduce((sum, w) => sum + w, 0) + (numImages > 1 ? padding * (numImages - 1) : 0) + margin * 2);
                finalHeight = Math.round(Math.max(...imageHeights) + margin * 2);
            } else {
                // Vertical direction: width is maximum image width, height is sum of all image heights
                const imageWidths = images.map(img => {
                    if (width === 'max') return sizes.maxWidth;
                    if (width === 'min') return sizes.minWidth;
                    if (typeof width === 'number') return width;
                    return img.width;
                });
                const imageHeights = images.map(img => {
                    if (width === 'max') return sizes.maxHeight;
                    if (width === 'min') return sizes.minHeight;
                    if (typeof width === 'number') return Math.round(width * (img.height / img.width));
                    return img.height;
                });
                
                finalWidth = Math.round(Math.max(...imageWidths) + margin * 2);
                finalHeight = Math.round(imageHeights.reduce((sum, h) => sum + h, 0) + (numImages > 1 ? padding * (numImages - 1) : 0) + margin * 2);
            }
        }
        
        return html`
            <div class="card-body border-bottom">
                <div class="row">
                    <div class="col-6">
                        <small class="text-muted">${getText('merge-images/label/direction')}</small>
                        <div class="fw-bold">${direction === 'horizontal' ? getText('merge-images/direction/horizontal') : getText('merge-images/direction/vertical')}</div>
                    </div>
                    <div class="col-6">
                        <small class="text-muted">${getText('merge-images/label/final_dimensions')}</small>
                        <div class="fw-bold">${finalWidth}px × ${finalHeight}px</div>
                    </div>
                </div>
            </div>
        `;
    };

    return html`
        <div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
                <ul class="nav nav-tabs card-header-tabs">
                    ${renderNavItem(getText('merge-images/tab/result'), 'grid-1x2-fill')}
                </ul>
                <button 
                    class="btn btn-primary btn-sm" 
                    onClick=${mergeImages}
                    disabled=${!images || images.length === 0}
                >
                    ${getText('merge-images/button/merge')}
                </button>
            </div>
            ${renderSettingsInfo()}
            ${renderTabContent()}
            ${isProcessed && html`
                <div class="card-footer text-center py-3">
                    <button 
                        class="btn btn-success" 
                        onClick=${downloadImage}
                    >
                        <i class="bi bi-download me-1"></i>
                        ${getText('merge-images/button/download')}
                    </button>
                </div>
            `}
        </div>
    `;
};

export default ProcessCard;