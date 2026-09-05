import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { useStore } from '~/contexts/StoreContext.js';
import { downloadFile } from '~/helpers/files.js';
import { notify } from '~/helpers/messages.js';
import { getText } from '~/helpers/utils.js';
import JSZip from 'jszip';
import WatermarkService from '@/services/WatermarkService.js';

const ResultCard = ({ images, settings }) => {
    const [watermarkedResults, setWatermarkedResults] = useState([]);
    const { isProcessing, setIsProcessing, hasChanges, setHasChanges } = useStore();

    const processImages = async () => {
        if (images.length === 0) {
            setWatermarkedResults([]);
            return;
        }

        setIsProcessing(true);
        try {
            setWatermarkedResults([]);
            
            const service = new WatermarkService();
            const results = await service.applyWatermark(images, settings);
            
            setWatermarkedResults(results);
            setHasChanges(false);
            notify(getText('image-watermark/result/success'), '', 'success');
        } catch (error) {
            console.error('Failed to apply watermark:', error);
            notify(getText('image-watermark/error/process_failed'), error.message, 'error');
            setWatermarkedResults([]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = (result) => {
        try {
            const blob = dataUrlToBlob(result.dataUrl);
            downloadFile(blob, result.filename);
        } catch (error) {
            console.error('Download failed:', error);
            notify('Download failed', error.message, 'error');
        }
    };

    const handleDownloadAll = async () => {
        if (watermarkedResults.length === 0) return;

        try {
            if (watermarkedResults.length === 1) {
                const result = watermarkedResults[0];
                const blob = dataUrlToBlob(result.dataUrl);
                downloadFile(blob, result.filename);
            } else {
                const zip = new JSZip();
                
                for (const result of watermarkedResults) {
                    const blob = dataUrlToBlob(result.dataUrl);
                    zip.file(result.filename, blob);
                }

                const zipBlob = await zip.generateAsync({ type: 'blob' });
                downloadFile(zipBlob, getText('image-watermark/result/download_zip'));
            }
        } catch (error) {
            console.error('Download failed:', error);
            notify('Download failed', error.message, 'error');
        }
    };

    const dataUrlToBlob = (dataUrl) => {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new Blob([u8arr], { type: mime });
    };

    const renderProcessButton = () => {
        return html`
            <button 
                class="btn btn-outline-primary btn-sm"
                disabled=${isProcessing || !hasChanges || images.length === 0}
                onClick=${processImages}
            >
                <i class="bi bi-caret-right-fill me-1"></i>
                ${isProcessing ? getText('image-watermark/result/processing') : getText('image-watermark/result/process_images')}
            </button>
        `;
    };

    const renderWatermarkedResults = () => {
        if (watermarkedResults.length === 0) return null;

        return html`
            <div>
                ${watermarkedResults.map((result, index) => html`
                    <div class="card mb-3">
                        <div class="card-body text-center">
                            <div class="border rounded p-2 mb-3" style="overflow: hidden; background-color: #f8f9fa;">
                                <div class="d-flex justify-content-center align-items-center">
                                    <img 
                                        src=${result.dataUrl} 
                                        class="img-fluid"
                                        style="object-fit: contain; max-width: 100%; min-width: 80%; height: auto;"
                                        alt="Processed image"
                                    />
                                </div>
                            </div>
                            <div>
                                <button 
                                    class="btn btn-outline-success btn-sm"
                                    onClick=${() => handleDownload(result)}
                                >
                                    <i class="bi bi-download me-1"></i>
                                    ${getText('image-watermark/result/download')}
                                </button>
                            </div>
                        </div>
                    </div>
                `)}
            </div>
        `;
    };

    return html`
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                ${renderProcessButton()}
                
                <button 
                    class="btn btn-outline-success btn-sm"
                    disabled=${isProcessing || watermarkedResults.length === 0}
                    onClick=${handleDownloadAll}
                >
                    <i class="bi bi-file-earmark-zip me-1"></i>
                    ${getText('image-watermark/result/download_all')}
                </button>
            </div>
            <div class="card-body p-3">
                ${images.length === 0 ? html`
                    <div class="text-center py-5">
                        <i class="bi bi-images fs-1 text-muted mb-3"></i>
                        <p class="text-muted">${getText('image-watermark/result/no_images')}</p>
                    </div>
                ` : watermarkedResults.length === 0 ? html`
                    <div class="text-center py-5">
                        <i class="bi bi-water fs-1 text-muted mb-3"></i>
                        <p class="text-muted">${getText('image-watermark/result/upload_hint')}</p>
                    </div>
                ` : html`
                    ${renderWatermarkedResults()}
                `}
            </div>
        </div>
    `;
};

export default ResultCard;