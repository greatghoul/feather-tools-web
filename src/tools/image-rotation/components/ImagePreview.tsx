import { useEffect, useRef, useState } from 'react';
import { downloadFile } from '~/helpers/files';
import { t } from '~/helpers/i18n';
import ImageRotator from '../services/ImageRotator';

const ImagePreview = ({ image, index, onImageProcessed }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedImage, setProcessedImage] = useState<any>(null);
    const baseRotation = { angle: 0, flipH: false, flipV: false };
    const processedRef = useRef<any>(null);

    const handleRotateLeft = () => {
        const nextRotation = { ...baseRotation, angle: 270 };
        processImage(nextRotation);
    };

    const handleRotateRight = () => {
        const nextRotation = { ...baseRotation, angle: 90 };
        processImage(nextRotation);
    };

    const handleFlipHorizontal = () => {
        const nextRotation = { ...baseRotation, flipH: true };
        processImage(nextRotation);
    };

    const handleFlipVertical = () => {
        const nextRotation = { ...baseRotation, flipV: true };
        processImage(nextRotation);
    };

    const processImage = async (nextRotation = baseRotation) => {
        console.log('[image-rotation] start processing image with rotation:', nextRotation);
        setIsProcessing(true);
        try {
            const imgElement = new Image();
            const sourceImage = processedRef.current || image;
            const sourceUrl = sourceImage.url;
            await new Promise((resolve, reject) => {
                imgElement.onload = resolve;
                imgElement.onerror = reject;
                imgElement.src = sourceUrl;
            });

            const rotator = new ImageRotator(imgElement, sourceImage, nextRotation);
            const result = await rotator.process();
            processedRef.current = result;
            setProcessedImage(result);
            onImageProcessed(result);
        } catch (error) {
            console.error('Error processing image:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        const handleGlobalAction = (event) => {
            const { action } = event.detail || {};
            console.log('[image-rotation] receive global action:', action, 'for index', index);
            switch (action) {
                case 'rotateLeft':
                    handleRotateLeft();
                    break;
                case 'rotateRight':
                    handleRotateRight();
                    break;
                case 'flipHorizontal':
                    handleFlipHorizontal();
                    break;
                case 'flipVertical':
                    handleFlipVertical();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('image-rotation:global-action', handleGlobalAction);
        return () => window.removeEventListener('image-rotation:global-action', handleGlobalAction);
    }, []);

    const displayUrl = processedImage?.url || image.url;
    return (
<>

        <div className="mb-4 border-bottom pb-4">
            <div className="text-center bg-light rounded p-3 mb-3">
                <img src={displayUrl} className="img-fluid" style={{ maxHeight: '400px' }} />
            </div>
            <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex gap-1 align-items-center">
                    <button className={`btn btn-sm btn-outline-primary ${isProcessing ? 'disabled' : ''}`} onClick={handleRotateLeft} title={t('image-rotation/result/rotate_left')}>
                        <i className="bi bi-arrow-counterclockwise"></i>
                    </button>
                    <button className={`btn btn-sm btn-outline-primary ${isProcessing ? 'disabled' : ''}`} onClick={handleRotateRight} title={t('image-rotation/result/rotate_right')}>
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>
                    <button className={`btn btn-sm btn-outline-secondary ${isProcessing ? 'disabled' : ''}`} onClick={handleFlipHorizontal} title={t('image-rotation/result/flip_horizontal')}>
                        <i className="bi bi-arrow-left-right"></i>
                    </button>
                    <button className={`btn btn-sm btn-outline-secondary ${isProcessing ? 'disabled' : ''}`} onClick={handleFlipVertical} title={t('image-rotation/result/flip_vertical')}>
                        <i className="bi bi-arrow-down-up"></i>
                    </button>
                </div>
                {processedImage ? (
<>

                    <button className="btn btn-sm btn-success" onClick={async () => {
                            if (processedImage.blob) {
                                downloadFile(processedImage.blob, processedImage.downloadName);
                            } else if (processedImage.url) {
                                const resp = await fetch(processedImage.url);
                                const blob = await resp.blob();
                                downloadFile(blob, processedImage.downloadName);
                            }
                        }}>
                        <i className="bi bi-download"></i>
                    </button>
                
</>
) : (
<>

                    <span className="text-muted small">{isProcessing ? t('image-rotation/result/processing') : ''}</span>
                
</>
)}
            </div>
        </div>
    
</>
);
};

export default ImagePreview;
