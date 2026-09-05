import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { css } from 'goober';
import { getText } from '~/helpers/utils.js';

const previewCanvasClass = css`
    max-width: 100%;
    max-height: 400px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const infoClass = css`
    font-size: 0.875rem;
    color: #6c757d;
    margin-top: 0.5rem;
`;

const PreviewCard = ({ settings }) => {
    const [canvasEl, setCanvasEl] = useState(null);
    const [copied, setCopied] = useState(false);
    const [fileSize, setFileSize] = useState('');

    useEffect(() => {
        if (!canvasEl) return;
        generatePlaceholder();
    }, [settings, canvasEl]);

    const setCanvasRef = (el) => {
        if (el) setCanvasEl(el);
    };

    const generatePlaceholder = () => {
        const canvas = canvasEl;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const { width, height, bgColor, textColor, text, fontSize, borderRadius, borderColor, borderWidth, borderStyle } = settings;

        canvas.width = width;
        canvas.height = height;

        const radius = Math.min(borderRadius, width / 2, height / 2);

        // Draw content with rounded clip if needed
        if (radius > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(0, 0, width, height, radius);
            ctx.clip();
        }

        // Draw background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // Draw text
        const displayText = text || `${width} \u00d7 ${height}`;
        const calculatedFontSize = fontSize
            ? parseInt(fontSize, 10)
            : Math.max(16, Math.min(width, height) * 0.1);

        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const maxWidth = width * 0.8;
        let finalFontSize = calculatedFontSize;

        do {
            ctx.font = `bold ${finalFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
            const textWidth = ctx.measureText(displayText).width;
            if (textWidth <= maxWidth || finalFontSize <= 12) break;
            finalFontSize = Math.floor(finalFontSize * 0.9);
        } while (finalFontSize > 12);

        ctx.fillText(displayText, width / 2, height / 2);

        // Restore context after clip
        if (radius > 0) {
            ctx.restore();
        }

        // Draw border
        if (borderWidth > 0) {
            const innerRadius = Math.max(radius * 0.2, radius - borderWidth);

            if (borderStyle === 'solid') {
                // Use filled ring for clean inner and outer corner radii
                ctx.beginPath();
                ctx.roundRect(0, 0, width, height, radius);
                ctx.roundRect(borderWidth, borderWidth, width - 2 * borderWidth, height - 2 * borderWidth, innerRadius);
                ctx.fillStyle = borderColor;
                ctx.fill('evenodd');
            } else {
                // Use stroke for dashed/dotted (less noticeable corner artifact)
                ctx.beginPath();
                ctx.roundRect(
                    borderWidth / 2,
                    borderWidth / 2,
                    width - borderWidth,
                    height - borderWidth,
                    Math.max(radius * 0.2, radius - borderWidth / 2)
                );
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = borderWidth;

                if (borderStyle === 'dashed') {
                    ctx.setLineDash([8, 6]);
                } else if (borderStyle === 'dotted') {
                    ctx.setLineDash([2, 4]);
                }

                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        // Estimate file size from current export
        const mimeType = settings.format === 'jpeg' ? 'image/jpeg' : settings.format === 'webp' ? 'image/webp' : 'image/png';
        canvas.toBlob((blob) => {
            if (blob) {
                setFileSize(formatBytes(blob.size));
            }
        }, mimeType, settings.format === 'png' ? undefined : 0.92);

    };

    const formatBytes = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleDownload = () => {
        const canvas = canvasEl;
        if (!canvas) return;

        const mimeType = settings.format === 'jpeg' ? 'image/jpeg' : settings.format === 'webp' ? 'image/webp' : 'image/png';
        const ext = settings.format === 'jpeg' ? 'jpg' : settings.format;

        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `placeholder_${settings.width}x${settings.height}.${ext}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, mimeType, settings.format === 'png' ? undefined : 0.92);
    };

    const handleCopyImage = async () => {
        const canvas = canvasEl;
        if (!canvas) return;

        try {
            const blob = await new Promise((resolve) => {
                const mimeType = settings.format === 'jpeg' ? 'image/jpeg' : settings.format === 'webp' ? 'image/webp' : 'image/png';
                canvas.toBlob(resolve, mimeType, settings.format === 'png' ? undefined : 0.92);
            });
            if (!blob) return;
            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob })
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard not available
        }
    };

    return html`
        <div class="card h-100">
            <div class="card-header">
                <h5 class="mb-0">${getText('image-placeholder/preview/title')}</h5>
            </div>
            <div class="card-body text-center">
                ${html`
                    <canvas
                        ref=${setCanvasRef}
                        class=${previewCanvasClass}
                    ></canvas>
                    <div class=${infoClass}>
                        ${getText('image-placeholder/preview/dimensions')}: ${settings.width} \u00d7 ${settings.height}
                        ${' \u00a0|\u00a0 '}
                        ${getText('image-placeholder/preview/file_size')}: ${fileSize}
                    </div>
                `}

                <div class="d-flex gap-2 mt-3 justify-content-center">
                    <button
                        class="btn btn-outline-success"
                        onClick=${handleDownload}
                    >
                        <i class="bi bi-download me-1"></i>
                        ${getText('image-placeholder/preview/download')}
                    </button>
                    <button
                        class="btn btn-outline-info"
                        onClick=${handleCopyImage}
                    >
                        <i class="bi ${copied ? 'bi-check-lg' : 'bi-clipboard'} me-1"></i>
                        ${copied
                            ? getText('image-placeholder/preview/copied')
                            : getText('image-placeholder/preview/copy_url')}
                    </button>
                </div>
            </div>
        </div>
    `;
};

export default PreviewCard;
