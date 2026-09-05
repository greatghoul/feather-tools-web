import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { css } from 'goober';
import JSZip from 'jszip';
import { downloadFile } from '~/helpers/files.js';
import ImageCompress from '@/services/ImageCompress.js';
import ProgressBar from '~/components/ProgressBar.js';
import { getText } from '~/helpers/utils.js';

const imageStyle = css`
    max-width: 100%;
    background: repeating-conic-gradient(#e5e5e5 0% 25%, #ffffff 0% 50%) 50% / 20px 20px;
`;

const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const BlankResult = () => html`
    <div class="card-body text-center">
        <div class="text-muted">
            <i class="bi bi-image" style="font-size: 2rem;"></i>
            <p class="mt-2 fw-semibold">${getText('image-compress/result/not_processed')}</p>
            <small class="text-muted">${getText('image-compress/result/upload_hint')}</small>
        </div>
    </div>
`;

const ResultCard = ({ images = [], setting, processingKey = 0 }) => {
    const [compressResults, setCompressResults] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleDownloadAll = async () => {
        const zip = new JSZip();

        for (const [index, result] of compressResults.entries()) {
            const response = await fetch(result.url);
            const blob = await response.blob();

            const number = (index + 1).toString().padStart(2, '0');
            const newName = `Compressed_${number}_${result.name}`;

            zip.file(newName, blob);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        downloadFile(content, 'compressed-images.zip');
    };

    const handleDownloadSingle = async (result, index) => {
        const response = await fetch(result.url);
        const blob = await response.blob();

        const number = (index + 1).toString().padStart(2, '0');
        const newName = `Compressed_${number}_${result.name}`;

        downloadFile(blob, newName);
    };

    const handleProcess = async () => {
        if (images.length === 0) return;

        setCompressResults([]);
        setIsProcessing(true);

        const results = [];
        const totalSteps = images.length;
        let completedSteps = 0;

        try {
            for (const image of images) {
                const compressor = new ImageCompress(image, setting);
                const result = await compressor.process();
                completedSteps++;
                setProgress(Math.round((completedSteps / totalSteps) * 100));
                results.push(result);
                setCompressResults(results);
            }
        } catch (error) {
            console.error('Error compressing image:', error);
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    useEffect(() => {
        if (images.length > 0) {
            handleProcess();
        }
    }, [processingKey]);

    const renderResult = (result, index) => {
        const savedColor = result.compressionRatio > 0 ? 'text-success' : 'text-danger';
        const savedIcon = result.compressionRatio > 0 ? 'bi-arrow-down' : 'bi-arrow-up';

        return html`
            <div class="card-body ${index % 2 === 0 ? '' : 'bg-light'}">
                <div class="row align-items-center">
                    <div class="col-md-6 text-center mb-3 mb-md-0">
                        <img src=${result.url} class="${imageStyle}" />
                    </div>
                    <div class="col-md-6">
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-muted small">
                                ${result.width} x ${result.height}px
                            </span>
                            <span class="badge bg-secondary">${result.format.toUpperCase()}</span>
                        </div>
                        <table class="table table-sm table-borderless mb-2">
                            <tbody>
                                <tr>
                                    <td class="text-muted ps-0">${getText('image-compress/result/original_size')}</td>
                                    <td class="text-end pe-0">${formatSize(result.originalSize)}</td>
                                </tr>
                                <tr>
                                    <td class="text-muted ps-0">${getText('image-compress/result/compressed_size')}</td>
                                    <td class="text-end pe-0">${formatSize(result.compressedSize)}</td>
                                </tr>
                                <tr>
                                    <td class="text-muted ps-0">${getText('image-compress/result/compression_ratio')}</td>
                                    <td class="text-end pe-0 ${savedColor}">
                                        <i class="bi ${savedIcon} me-1"></i>
                                        ${Math.abs(result.compressionRatio)}%
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <button
                            class="btn btn-sm btn-outline-primary w-100"
                            onClick=${() => handleDownloadSingle(result, index)}
                        >
                            <i class="bi bi-download me-1"></i>
                            ${getText('image-compress/result/download')}
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
                    ${isProcessing ? html`<span class="spinner-border spinner-border-sm me-1"></span>` : ''}
                    ${getText('image-compress/result/compress_images')}
                </button>

                <button
                    class="btn btn-outline-success btn-sm"
                    disabled=${compressResults.length === 0}
                    onClick=${handleDownloadAll}
                >
                    <i class="bi bi-download me-1"></i>
                    ${getText('image-compress/result/download_all')}
                </button>
            </div>

            <div class="card-body p-0">
                ${isProcessing && html`<${ProgressBar} value=${progress} />`}
            </div>

            ${compressResults.length > 0
                ? compressResults.map(renderResult)
                : html`<${BlankResult} />`
            }
        </div>
    `;
};

export default ResultCard;
