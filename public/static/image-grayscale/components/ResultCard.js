import { html } from 'htm/preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { css } from 'goober';
import JSZip from 'jszip';
import { downloadFile } from '~/helpers/files.js';
import ImageGrayscale from '@/services/ImageGrayscale.js';
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
            <p class="mt-2 fw-semibold">${getText('image-grayscale/result/not_processed')}</p>
            <small class="text-muted">${getText('image-grayscale/result/upload_hint')}</small>
        </div>
    </div>
`;

const ResultCard = ({ images = [] }) => {
    const [results, setResults] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const prevImagesRef = useRef([]);

    const handleDownloadAll = async () => {
        const zip = new JSZip();

        for (const [index, result] of results.entries()) {
            const response = await fetch(result.url);
            const blob = await response.blob();

            const number = (index + 1).toString().padStart(2, '0');
            const baseName = result.image.name.replace(/\.[^/.]+$/, '');
            const newName = `Grayscale_${number}_${baseName}.png`;

            zip.file(newName, blob);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        downloadFile(content, 'grayscale-images.zip');
    };

    const handleDownloadSingle = async (result, index) => {
        const response = await fetch(result.url);
        const blob = await response.blob();

        const number = (index + 1).toString().padStart(2, '0');
        const baseName = result.image.name.replace(/\.[^/.]+$/, '');
        const newName = `Grayscale_${number}_${baseName}.png`;

        downloadFile(blob, newName);
    };

    useEffect(() => {
        const prevIds = prevImagesRef.current.map(img => img.id).sort().join(',');
        const currIds = images.map(img => img.id).sort().join(',');

        if (prevIds === currIds) return;

        prevImagesRef.current = images;

        if (images.length === 0) {
            setResults([]);
            return;
        }

        let cancelled = false;
        const run = async () => {
            setIsProcessing(true);
            setProgress(0);

            const newResults = [];
            const totalSteps = images.length;
            let completedSteps = 0;

            try {
                for (const image of images) {
                    if (cancelled) return;
                    const grayscale = new ImageGrayscale(image);
                    const result = await grayscale.process();
                    completedSteps++;
                    setProgress(Math.round((completedSteps / totalSteps) * 100));
                    newResults.push(result);
                    setResults([...newResults]);
                }
            } catch (error) {
                console.error('Error processing image:', error);
            } finally {
                if (!cancelled) {
                    setIsProcessing(false);
                    setProgress(0);
                }
            }
        };

        run();

        return () => { cancelled = true; };
    }, [images]);

    const renderResult = (result, index) => {
        return html`
            <div class="card-body text-center ${index % 2 === 0 ? '' : 'bg-light'}">
                <img src=${result.url} class="mb-2 d-inline-block ${imageStyle}" />
                <button
                    class="btn btn-sm btn-outline-primary mt-2"
                    onClick=${() => handleDownloadSingle(result, index)}
                >
                    <i class="bi bi-download me-1"></i>
                    ${getText('image-grayscale/result/download')}
                </button>
            </div>
        `;
    };

    return html`
        <div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
                <ul class="nav nav-tabs card-header-tabs">
                    <li class="nav-item">
                        <a class="nav-link active" href="#">
                            <i class="bi bi-images me-1"></i>
                            ${getText('image-grayscale/result/title')}
                            ${isProcessing ? html`<span class="spinner-border spinner-border-sm ms-1"></span>` : ''}
                        </a>
                    </li>
                </ul>

                <button
                    class="btn btn-outline-success btn-sm"
                    disabled=${results.length === 0}
                    onClick=${handleDownloadAll}
                >
                    <i class="bi bi-download me-1"></i>
                    ${getText('image-grayscale/result/download_all')}
                </button>
            </div>

            <div class="card-body p-0">
                ${isProcessing && html`<${ProgressBar} value=${progress} />`}
            </div>

            ${results.length > 0
                ? results.map(renderResult)
                : html`<${BlankResult} />`
            }
        </div>
    `;
};

export default ResultCard;
