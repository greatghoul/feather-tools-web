import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { css } from 'goober';
import JSZip from 'jszip';
import { downloadFile } from '~/helpers/files.js';
import ImageAdjust from '@/services/ImageAdjust.js';
import ProgressBar from '~/components/ProgressBar.js';
import { getText } from '~/helpers/utils.js';

const imageStyle = css`
    max-width: 100%;
    background: repeating-conic-gradient(#e5e5e5 0% 25%, #ffffff 0% 50%) 50% / 20px 20px;
`;

const BlankResult = () => html`
    <div class="card-body text-center">
        <div class="text-muted">
            <i class="bi bi-image" style="font-size: 2rem;"></i>
            <p class="mt-2 fw-semibold">${getText('image-adjust/result/not_processed')}</p>
            <small class="text-muted">${getText('image-adjust/result/upload_hint')}</small>
        </div>
    </div>
`;

const ResultCard = ({ images = [], setting, autoProcess = false, processingKey = 0 }) => {
    const [adjustResults, setAdjustResults] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleDownloadAll = async () => {
        const zip = new JSZip();

        for (const [index, result] of adjustResults.entries()) {
            const response = await fetch(result.url);
            const blob = await response.blob();

            const number = (index + 1).toString().padStart(2, '0');
            const baseName = result.image.name.replace(/\.[^/.]+$/, '');
            const newName = `Adjusted_${number}_${baseName}.png`;

            zip.file(newName, blob);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        downloadFile(content, 'adjusted-images.zip');
    };

    const handleDownloadSingle = async (result, index) => {
        const response = await fetch(result.url);
        const blob = await response.blob();

        const number = (index + 1).toString().padStart(2, '0');
        const baseName = result.image.name.replace(/\.[^/.]+$/, '');
        const newName = `Adjusted_${number}_${baseName}.png`;

        downloadFile(blob, newName);
    };

    const handleProcess = async () => {
        if (images.length === 0) return;

        setAdjustResults([]);
        setIsProcessing(true);

        const results = [];
        const totalSteps = images.length;
        let completedSteps = 0;

        try {
            for (const image of images) {
                const adjust = new ImageAdjust(image, setting);
                const result = await adjust.process();
                completedSteps++;
                setProgress(Math.round((completedSteps / totalSteps) * 100));
                results.push(result);
                setAdjustResults(results);
            }
        } catch (error) {
            console.error('Error processing image:', error);
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    useEffect(() => {
        if (autoProcess && images.length > 0) {
            handleProcess();
        }
    }, [processingKey]);

    const renderResult = (result, index) => {
        return html`
            <div class="card-body text-center ${index % 2 === 0 ? '' : 'bg-light'}">
                <img src=${result.url} class="mb-2 d-inline-block ${imageStyle}" />
                <button
                    class="btn btn-sm btn-outline-primary mt-2"
                    onClick=${() => handleDownloadSingle(result, index)}
                >
                    <i class="bi bi-download me-1"></i>
                    ${getText('image-adjust/result/download')}
                </button>
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
                    ${isProcessing ? html`<span class="spinner-border spinner-border-sm me-1"></span>` : ''}
                    ${getText('image-adjust/result/process_images')}
                </button>

                <button
                    class="btn btn-outline-success btn-sm"
                    disabled=${adjustResults.length === 0}
                    onClick=${handleDownloadAll}
                >
                    <i class="bi bi-download me-1"></i>
                    ${getText('image-adjust/result/download_all')}
                </button>
            </div>

            <div class="card-body p-0">
                ${isProcessing && html`<${ProgressBar} value=${progress} />`}
            </div>

            ${adjustResults.length > 0
                ? adjustResults.map(renderResult)
                : html`<${BlankResult} />`
            }
        </div>
    `;
};

export default ResultCard;
