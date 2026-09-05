import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import JSZip from 'jszip';
import { downloadFile } from '~/helpers/files.js';
import { getText } from '~/helpers/utils.js';
import ImagePreview from './ImagePreview.js';

const ResultCard = ({ images = [], onImagesChange }) => {
    const [processedImages, setProcessedImages] = useState({});

    const buildDownloadName = (image, index) => {
        const originalName = image.name || `image-${index + 1}`;
        const lastDot = originalName.lastIndexOf('.');
        const base = lastDot !== -1 ? originalName.slice(0, lastDot) : originalName;
        const ext = lastDot !== -1 ? originalName.slice(lastDot + 1) : (image.format || 'png');
        return `${base}-rotated-${index + 1}.${ext}`;
    };

    const handleDownloadAll = async () => {
        if (images.length === 0) return;
        const zip = new JSZip();
        const items = images.map((image, index) => processedImages[index] || { ...image, rotationIndex: index });

        for (const [index, item] of items.entries()) {
            const name = buildDownloadName(item, index);
            if (item.blob) {
                zip.file(name, item.blob);
                continue;
            }
            const response = await fetch(item.url);
            const blob = await response.blob();
            zip.file(name, blob);
        }
        
        const content = await zip.generateAsync({ type: 'blob' });
        downloadFile(content, 'rotated-images.zip');
    };

    const emitRotateAll = (action) => {
        console.log('[image-rotation] emit global action:', action);
        window.dispatchEvent(new CustomEvent('image-rotation:global-action', { detail: { action } }));
    };

    const handleProcessedImage = (index, result) => {
        setProcessedImages((prev) => ({ ...prev, [index]: result }));
    };

    const renderBlankState = () => html`
        <div class="card-body text-center">
            <div class="text-muted">
                <i class="bi bi-image" style="font-size: 2rem;"></i>
                <p class="mt-2 fw-semibold">${getText('image-rotation/result/no_images')}</p>
                <small class="text-muted">${getText('image-rotation/result/upload_hint')}</small>
            </div>
        </div>
    `;

    return html`
        <div class="card mb-3">
            <div class="card-header d-flex align-items-center gap-2">
                <div class="btn-group btn-group-sm" role="group" aria-label="Rotate all">
                    <button
                        class="btn btn-outline-primary"
                        disabled=${images.length === 0}
                        onClick=${() => emitRotateAll('rotateLeft')}
                        title=${getText('image-rotation/result/rotate_left')}
                    >
                        <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                    <button
                        class="btn btn-outline-primary"
                        disabled=${images.length === 0}
                        onClick=${() => emitRotateAll('rotateRight')}
                        title=${getText('image-rotation/result/rotate_right')}
                    >
                        <i class="bi bi-arrow-clockwise"></i>
                    </button>
                </div>
                <div class="btn-group btn-group-sm" role="group" aria-label="Flip all">
                    <button
                        class="btn btn-outline-secondary"
                        disabled=${images.length === 0}
                        onClick=${() => emitRotateAll('flipHorizontal')}
                        title=${getText('image-rotation/result/flip_horizontal')}
                    >
                        <i class="bi bi-arrow-left-right"></i>
                    </button>
                    <button
                        class="btn btn-outline-secondary"
                        disabled=${images.length === 0}
                        onClick=${() => emitRotateAll('flipVertical')}
                        title=${getText('image-rotation/result/flip_vertical')}
                    >
                        <i class="bi bi-arrow-down-up"></i>
                    </button>
                </div>
                <div class="ms-auto">
                <button 
                    class="btn btn-outline-success btn-sm"
                    disabled=${Object.keys(processedImages).length === 0}
                    onClick=${handleDownloadAll}
                >
                    <i class="bi bi-download me-1"></i>
                    ${getText('image-rotation/result/download_all')}
                </button>
                </div>
            </div>
            
            ${images.length > 0
                ? html`
                    <div class="card-body">
                        ${images.map((image, index) => {
                            const namedImage = { ...image, downloadName: buildDownloadName(image, index) };
                            return html`
                            <${ImagePreview} 
                                image=${namedImage} 
                                index=${index}
                                onImageProcessed=${(result) => handleProcessedImage(index, result)}
                            />
                            `;
                        })}
                    </div>
                `
                : renderBlankState()
            }
        </div>
    `;
};

export default ResultCard;
