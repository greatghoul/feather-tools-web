import { useState } from 'react';
import JSZip from 'jszip';
import { downloadFile } from '~/helpers/files';
import { t } from '~/helpers/i18n';
import ImagePreview from './ImagePreview';

const ResultCard = ({ images = [] as any[], onImagesChange }) => {
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

    const renderBlankState = () => (
<>

        <div className="card-body text-center">
            <div className="text-muted">
                <i className="bi bi-image" style={{ fontSize: '2rem' }}></i>
                <p className="mt-2 fw-semibold">{t('image-rotation/result/no_images')}</p>
                <small className="text-muted">{t('image-rotation/result/upload_hint')}</small>
            </div>
        </div>
    
</>
);

    return (
<>

        <div className="card mb-3">
            <div className="card-header d-flex align-items-center gap-2">
                <div className="btn-group btn-group-sm" role="group" aria-label="Rotate all">
                    <button className="btn btn-outline-primary" disabled={images.length === 0} onClick={() => emitRotateAll('rotateLeft')} title={t('image-rotation/result/rotate_left')}>
                        <i className="bi bi-arrow-counterclockwise"></i>
                    </button>
                    <button className="btn btn-outline-primary" disabled={images.length === 0} onClick={() => emitRotateAll('rotateRight')} title={t('image-rotation/result/rotate_right')}>
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>
                </div>
                <div className="btn-group btn-group-sm" role="group" aria-label="Flip all">
                    <button className="btn btn-outline-secondary" disabled={images.length === 0} onClick={() => emitRotateAll('flipHorizontal')} title={t('image-rotation/result/flip_horizontal')}>
                        <i className="bi bi-arrow-left-right"></i>
                    </button>
                    <button className="btn btn-outline-secondary" disabled={images.length === 0} onClick={() => emitRotateAll('flipVertical')} title={t('image-rotation/result/flip_vertical')}>
                        <i className="bi bi-arrow-down-up"></i>
                    </button>
                </div>
                <div className="ms-auto">
                <button className="btn btn-outline-success btn-sm" disabled={Object.keys(processedImages).length === 0} onClick={handleDownloadAll}>
                    <i className="bi bi-download me-1"></i>
                    {t('image-rotation/result/download_all')}
                </button>
                </div>
            </div>
            
            {images.length > 0
                ? (
<>

                    <div className="card-body">
                        {images.map((image, index) => {
                            const namedImage = { ...image, downloadName: buildDownloadName(image, index) };
                            return (
                            <ImagePreview key={index} image={namedImage} index={index} onImageProcessed={(result) => handleProcessedImage(index, result)} />
);
                        })}
                    </div>
                
</>
)
                : renderBlankState()
            }
        </div>
    
</>
);
};

export default ResultCard;
