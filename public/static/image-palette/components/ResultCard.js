import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { css } from 'goober';
import ColorExtractor from '@/services/ColorExtractor.js';
import { downloadFile } from '~/helpers/files.js';
import { getText } from '~/helpers/utils.js';

const paletteSwatchStyle = css`
    display: inline-block;
    width: 36px;
    height: 36px;
    border-radius: 6px;
    border: 1px solid rgba(0,0,0,0.1);
    cursor: pointer;
    transition: transform 0.15s ease;
    position: relative;

    &:hover {
        transform: scale(1.15);
        z-index: 2;
    }
`;

const paletteRowStyle = css`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
`;

const copyTooltipStyle = css`
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: #fff;
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
`;

const BlankResult = () => html`
    <div class="card-body text-center">
        <div class="text-muted">
            <i class="bi bi-palette" style="font-size: 2rem;"></i>
            <p class="mt-2 fw-semibold">${getText('image-palette/result/not_processed')}</p>
            <small class="text-muted">${getText('image-palette/result/upload_hint')}</small>
        </div>
    </div>
`;

const ResultCard = ({ images = [], setting, processingKey = 0 }) => {
    const [paletteResults, setPaletteResults] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [copiedColor, setCopiedColor] = useState(null);

    const handleCopyColor = (hex) => {
        navigator.clipboard.writeText(hex).then(() => {
            setCopiedColor(hex);
            setTimeout(() => setCopiedColor(null), 1500);
        });
    };

    const handleProcess = async () => {
        if (images.length === 0) return;

        setPaletteResults([]);
        setIsProcessing(true);

        const results = [];
        const totalSteps = images.length;
        let completedSteps = 0;

        try {
            for (const image of images) {
                const extractor = new ColorExtractor(image, setting);
                const result = await extractor.process();
                completedSteps++;
                setProgress(Math.round((completedSteps / totalSteps) * 100));
                results.push(result);
                setPaletteResults(results);
            }
        } catch (error) {
            console.error('Error extracting palette:', error);
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    const handleDownloadPaletteImage = (result, index) => {
        const number = (index + 1).toString().padStart(2, '0');
        const name = result.image.name.replace(/\.[^/.]+$/, '');
        downloadFile(result.palettePreviewBlob, `palette_${number}_${name}.png`);
    };

    useEffect(() => {
        if (images.length > 0) {
            handleProcess();
        }
    }, [processingKey]);

    const renderColorBlocks = (colors) => {
        return html`
            <div class="${paletteRowStyle}">
                ${colors.map(color => html`
                    <div class="d-flex flex-column align-items-center" style="cursor: pointer;" onClick=${() => handleCopyColor(color.hex)} title="${getText('image-palette/result/click_to_copy')}">
                        <span
                            class="${paletteSwatchStyle}"
                            style="background-color: ${color.hex}; position: relative;"
                        >
                            ${copiedColor === color.hex && html`
                                <span class="${copyTooltipStyle}" style="opacity: 1;">Copied!</span>
                            `}
                        </span>
                        <small class="text-muted mt-1" style="font-size: 10px; font-family: monospace;">
                            ${color.hex}
                        </small>
                    </div>
                `)}
            </div>
        `;
    };

    const renderResult = (result, index) => {
        return html`
            <div class="card-body ${index % 2 === 0 ? '' : 'bg-light'}">
                <div class="row align-items-center">
                    <div class="col-md-5 text-center mb-3 mb-md-0">
                        <img
                            src=${result.image.url}
                            class="img-fluid rounded"
                            style="max-height: 160px; object-fit: contain;"
                            alt=${result.image.name}
                        />
                    </div>
                    <div class="col-md-7">
                        ${renderColorBlocks(result.colors)}
                        <button
                            class="btn btn-sm btn-outline-primary mt-3"
                            onClick=${() => handleDownloadPaletteImage(result, index)}
                        >
                            <i class="bi bi-download me-1"></i>
                            ${getText('image-palette/result/download_palette')}
                        </button>
                    </div>
                </div>
            </div>
        `;
    };

    return html`
        <div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
                <button
                    class="btn btn-outline-primary btn-sm me-2"
                    onClick=${handleProcess}
                    disabled=${isProcessing || images.length === 0}
                >
                    ${isProcessing
                        ? html`<span class="spinner-border spinner-border-sm me-1"></span>`
                        : html`<i class="bi bi-palette me-1"></i>`
                    }
                    ${getText('image-palette/result/extract_palette')}
                </button>
            </div>

            ${isProcessing && html`
                <div class="progress rounded-0" style="height: 4px;">
                    <div
                        class="progress-bar"
                        style="width: ${progress}%;"
                        role="progressbar"
                    ></div>
                </div>
            `}

            ${paletteResults.length > 0
                ? paletteResults.map(renderResult)
                : html`<${BlankResult} />`
            }
        </div>
    `;
};

export default ResultCard;
