import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useStore } from '~/contexts/StoreContext';
import { t } from '~/helpers/i18n';

const DEFAULT_URL = 'https://feather-tools.com/rich-qrcode';

// QR code card configuration
const config = {
    width: 860,
    height: 120,
    qrCodeSize: 90,
    padding: 15,
    titleFontSize: 24,
    titleFontFamily: '"Microsoft YaHei", sans-serif',
    titleFontColor: '#A0BDFE', // Light blue color for title
    urlFontSize: 20,
    urlFontFamily: 'Arial, sans-serif',
    urlFontColor: '#E0E0E0',
    textMaxWidth: 720, // Width available for text with QR on right
    backgroundColor: '#445271', // Rich navy blue background
    textColor: '#ffffff',
    accentColor: '#f0f0f0',
    borderRadius: 10
};

// Helper function to draw rounded rectangle
const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
};

// Function to truncate text with ellipsis
const truncateText = (ctx, text, maxWidth, fontSize) => {
    // Set the appropriate font for measurement
    if (fontSize === config.titleFontSize) {
        ctx.font = `bold ${config.titleFontSize}px ${config.titleFontFamily}`;
    } else {
        ctx.font = `${fontSize}px ${config.urlFontFamily}`;
    }
    
    if (ctx.measureText(text).width <= maxWidth) {
        return text;
    }
    
    let truncated = text;
    while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
    }
    
    return truncated + '...';
};

// Function to draw empty card
const drawEmptyCard = (ctx) => {
    // Clear canvas
    ctx.clearRect(0, 0, config.width, config.height);
    
    // Draw rounded rectangle background
    ctx.fillStyle = config.backgroundColor;
    drawRoundedRect(ctx, 0, 0, config.width, config.height, config.borderRadius);
    ctx.fill();
    
    // Calculate QR code position (right side)
    const qrCodeX = config.width - config.padding - config.qrCodeSize;
    
    // Draw QR code area placeholder with rounded corners
    ctx.fillStyle = config.accentColor;
    const qrRadius = 8;
    drawRoundedRect(ctx, qrCodeX, config.padding, config.qrCodeSize, config.qrCodeSize, qrRadius);
    ctx.fill();
    
    // Draw QR code placeholder icon
    ctx.fillStyle = '#bbbbbb';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QR', qrCodeX + config.qrCodeSize/2, config.padding + config.qrCodeSize/2 + 8);
    ctx.textAlign = 'left';
    
    // Draw placeholder text
    ctx.fillStyle = config.titleFontColor;
    ctx.font = `bold ${config.titleFontSize}px ${config.titleFontFamily}`;
    const placeholderText = t('rich-qrcode/preview/placeholder_text');
    const truncatedPlaceholder = truncateText(ctx, placeholderText, config.textMaxWidth, config.titleFontSize);
    ctx.fillText(truncatedPlaceholder, config.padding, 50);
};

const PreviewCard = ({ linkInfo }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [qrCodeData, setQrCodeData] = useState<{ dataUrl: string; x: number; y: number; size: number } | null>(null);
    const { busy, setBusy } = useStore() as any;

    // Use provided URL or fallback to default
    const url = (linkInfo && linkInfo.url) || DEFAULT_URL;
    // If URL exists, use title (even if empty), otherwise show placeholder text
    const title = (linkInfo && linkInfo.url) ? (linkInfo.title || '') : t('rich-qrcode/preview/placeholder_text');

    // Function to generate QR code card
    const generateQRCodeCard = (ctx) => {
        console.log('Generating QR code card for:', url, 'with title:', title);
        
        // Clear canvas
        ctx.clearRect(0, 0, config.width, config.height);
        
        // Draw rounded rectangle background
        ctx.fillStyle = config.backgroundColor;
        drawRoundedRect(ctx, 0, 0, config.width, config.height, config.borderRadius);
        ctx.fill();
        
        // Generate QR code
        QRCode.toDataURL(url, {
            width: config.qrCodeSize,
            margin: 0,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        })
        .then(qrDataUrl => {
            const qrImage = new Image();
            qrImage.onload = () => {
                // Calculate QR code position (right side)
                const qrCodeX = config.width - config.padding - config.qrCodeSize;
                
                // Create a rounded rectangle for the QR code background
                const qrRadius = 8;
                ctx.fillStyle = '#ffffff';
                drawRoundedRect(ctx, qrCodeX, config.padding, config.qrCodeSize, config.qrCodeSize, qrRadius);
                ctx.fill();
                
                // Draw QR code onto canvas
                ctx.drawImage(qrImage, qrCodeX, config.padding, config.qrCodeSize, config.qrCodeSize);
                
                // Draw title with truncation
                const truncatedTitle = truncateText(ctx, title, config.textMaxWidth, config.titleFontSize);
                ctx.fillStyle = config.titleFontColor;
                ctx.font = `bold ${config.titleFontSize}px ${config.titleFontFamily}`;
                ctx.fillText(truncatedTitle, config.padding, config.padding + 35);
                
                // Draw URL with truncation
                const truncatedUrl = truncateText(ctx, url, config.textMaxWidth, config.urlFontSize);
                ctx.font = `${config.urlFontSize}px ${config.urlFontFamily}`;
                ctx.fillStyle = config.urlFontColor;
                ctx.fillText(truncatedUrl, config.padding, config.padding + 75);
                
                // Store QR code data for downloads
                setQrCodeData({
                    dataUrl: qrDataUrl,
                    x: qrCodeX,
                    y: config.padding,
                    size: config.qrCodeSize
                });
                
                setBusy(false);
            };
            
            qrImage.src = qrDataUrl;
        })
        .catch(error => {
            console.error('Error generating QR code:', error);
            setBusy(false);
        });
    };

    // Initialize canvas and draw
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (linkInfo && linkInfo.url) {
            // Generate QR code when linkInfo has a URL
            generateQRCodeCard(ctx);
        } else {
            // Draw empty card when no URL is provided
            drawEmptyCard(ctx);
            setQrCodeData(null);
        }
    }, [linkInfo]);



    const handleDownloadPng = () => {
        if (!canvasRef.current || !qrCodeData) return;
        
        const link = document.createElement('a');
        link.download = 'rich-qrcode.png';
        link.href = canvasRef.current.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadSvg = () => {
        if (!qrCodeData) return;
        
        // Create SVG document
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", String(config.width));
        svg.setAttribute("height", String(config.height));
        svg.setAttribute("viewBox", `0 0 ${config.width} ${config.height}`);
        svg.setAttribute("xmlns", svgNS);
        
        // Add the card background with rounded corners
        const path = document.createElementNS(svgNS, "path");
        const r = config.borderRadius;
        const w = config.width;
        const h = config.height;
        const d = `M${r},0 H${w-r} C${w-r/2},0 ${w},${r/2} ${w},${r} V${h-r} C${w},${h-r/2} ${w-r/2},${h} ${w-r},${h} H${r} C${r/2},${h} 0,${h-r/2} 0,${h-r} V${r} C0,${r/2} ${r/2},0 ${r},0 Z`;
        path.setAttribute("d", d);
        path.setAttribute("fill", config.backgroundColor);
        svg.appendChild(path);
        
        // Add the title text
        const titleText = document.createElementNS(svgNS, "text");
        titleText.setAttribute("x", String(config.padding));
        titleText.setAttribute("y", String(config.padding + 35));
        titleText.setAttribute("fill", config.titleFontColor);
        titleText.setAttribute("font-family", config.titleFontFamily.replace(/"/g, ''));
        titleText.setAttribute("font-size", String(config.titleFontSize));
        titleText.setAttribute("font-weight", "bold");
        titleText.textContent = title;
        svg.appendChild(titleText);
        
        // Add the URL text
        const urlText = document.createElementNS(svgNS, "text");
        urlText.setAttribute("x", String(config.padding));
        urlText.setAttribute("y", String(config.padding + 75));
        urlText.setAttribute("fill", config.urlFontColor);
        urlText.setAttribute("font-family", config.urlFontFamily.replace(/"/g, ''));
        urlText.setAttribute("font-size", String(config.urlFontSize));
        urlText.textContent = url;
        svg.appendChild(urlText);
        
        // Add QR code background with rounded corners
        const qrBackground = document.createElementNS(svgNS, "rect");
        qrBackground.setAttribute("x", String(qrCodeData.x));
        qrBackground.setAttribute("y", String(qrCodeData.y));
        qrBackground.setAttribute("width", String(qrCodeData.size));
        qrBackground.setAttribute("height", String(qrCodeData.size));
        qrBackground.setAttribute("fill", "#ffffff");
        qrBackground.setAttribute("rx", "8");
        qrBackground.setAttribute("ry", "8");
        svg.appendChild(qrBackground);
        
        // Add QR code image
        const qrImage = document.createElementNS(svgNS, "image");
        qrImage.setAttribute("x", String(qrCodeData.x));
        qrImage.setAttribute("y", String(qrCodeData.y));
        qrImage.setAttribute("width", String(qrCodeData.size));
        qrImage.setAttribute("height", String(qrCodeData.size));
        qrImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", qrCodeData.dataUrl);
        svg.appendChild(qrImage);
        
        // Convert SVG to data URL and download
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        const svgBlob = new Blob([svgString], {type: "image/svg+xml"});
        const svgUrl = URL.createObjectURL(svgBlob);
        
        const link = document.createElement('a');
        link.href = svgUrl;
        link.download = 'rich-qrcode.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(svgUrl);
    };

    return (
<>

        <div className="card h-100">
            <div className="card-header bg-light">
                <h5 className="mb-0">{t('rich-qrcode/preview/title')}</h5>
            </div>
            <div className="card-body text-center">
                <div className="qrcode-card-container mb-3">
                    <canvas ref={canvasRef} width="860" height="120" style={{ maxWidth: '100%', height: 'auto', border: '1px solid #dee2e6', borderRadius: '8px' }} />
                </div>
                <div className="text-muted small mb-3">
                    <i className="bi bi-info-circle me-1"></i>
                    {t('rich-qrcode/preview/info_text')}
                </div>
                
                <div className="d-flex justify-content-center mt-3">
                    <div className="btn-group">
                        <button className="btn btn-outline-success" disabled={busy || !qrCodeData} onClick={handleDownloadPng}>
                            <i className="bi bi-download me-1"></i> {t('rich-qrcode/preview/download_png')}
                        </button>
                        <button className="btn btn-outline-success" disabled={busy || !qrCodeData} onClick={handleDownloadSvg}>
                            <i className="bi bi-download me-1"></i> {t('rich-qrcode/preview/download_svg')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    
</>
);
};

export default PreviewCard;
