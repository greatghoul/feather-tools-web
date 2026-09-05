import { useState, useEffect } from 'react';
import { useStore } from '~/contexts/StoreContext';
import { downloadFile } from '~/helpers/files';
import { notify } from '~/helpers/messages';
import { t } from '~/helpers/i18n';
import JSZip from 'jszip';
import WatermarkService from '../services/WatermarkService';

const ResultCard = ({ images, settings }) => {
    const [watermarkedResults, setWatermarkedResults] = useState<any[]>([]);
    const { isProcessing, setIsProcessing, hasChanges, setHasChanges } = useStore() as any;

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
            notify(t('image-watermark/result/success'), '', 'success');
        } catch (error: any) {
            console.error('Failed to apply watermark:', error);
            notify(t('image-watermark/error/process_failed'), error.message, 'error');
            setWatermarkedResults([]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = (result) => {
        try {
            const blob = dataUrlToBlob(result.dataUrl);
            downloadFile(blob, result.filename);
        } catch (error: any) {
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
                downloadFile(zipBlob, t('image-watermark/result/download_zip'));
            }
        } catch (error: any) {
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
        return (
<>

            <button className="btn btn-outline-primary btn-sm" disabled={isProcessing || !hasChanges || images.length === 0} onClick={processImages}>
                <i className="bi bi-caret-right-fill me-1"></i>
                {isProcessing ? t('image-watermark/result/processing') : t('image-watermark/result/process_images')}
            </button>
        
</>
);
    };

    const renderWatermarkedResults = () => {
        if (watermarkedResults.length === 0) return null;

        return (
<>

            <div>
                {watermarkedResults.map((result, index) => (
                    <div key={index} className="card mb-3">
                        <div className="card-body text-center">
                            <div className="border rounded p-2 mb-3" style={{ overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
                                <div className="d-flex justify-content-center align-items-center">
                                    <img src={result.dataUrl} className="img-fluid" style={{ objectFit: 'contain', maxWidth: '100%', minWidth: '80%', height: 'auto' }} alt="Processed image" />
                                </div>
                            </div>
                            <div>
                                <button className="btn btn-outline-success btn-sm" onClick={() => handleDownload(result)}>
                                    <i className="bi bi-download me-1"></i>
                                    {t('image-watermark/result/download')}
                                </button>
                            </div>
                        </div>
                    </div>
))}
            </div>
        
</>
);
    };

    return (
<>

        <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                {renderProcessButton()}
                
                <button className="btn btn-outline-success btn-sm" disabled={isProcessing || watermarkedResults.length === 0} onClick={handleDownloadAll}>
                    <i className="bi bi-file-earmark-zip me-1"></i>
                    {t('image-watermark/result/download_all')}
                </button>
            </div>
            <div className="card-body p-3">
                {images.length === 0 ? (
<>

                    <div className="text-center py-5">
                        <i className="bi bi-images fs-1 text-muted mb-3"></i>
                        <p className="text-muted">{t('image-watermark/result/no_images')}</p>
                    </div>
                
</>
) : watermarkedResults.length === 0 ? (
<>

                    <div className="text-center py-5">
                        <i className="bi bi-water fs-1 text-muted mb-3"></i>
                        <p className="text-muted">{t('image-watermark/result/upload_hint')}</p>
                    </div>
                
</>
) : (
<>

                    {renderWatermarkedResults()}
                
</>
)}
            </div>
        </div>
    
</>
);
};

export default ResultCard;
