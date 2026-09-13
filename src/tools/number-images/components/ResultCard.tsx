import { useState, useLayoutEffect, useRef } from 'react';
import { useStore } from '~/contexts/StoreContext';
import { downloadFile } from '~/helpers/files';
import { notify } from '~/helpers/messages';
import { t } from '~/helpers/i18n';
import JSZip from 'jszip';
import NumberImage from '../services/NumberImage';
import SequenceNumber from '../services/SequenceNumber';

const sequenceService = new SequenceNumber();

const ResultCard = ({
    images,
    settings
}) => {
    const [processedImages, setProcessedImages] = useState<any[]>([]);
    const { isProcessing, setIsProcessing, hasChanges, setHasChanges } = useStore() as any;
    const previewRef: any = useRef(null);
    const [previewWidth, setPreviewWidth] = useState(0);

    // Track the preview area width so uniform-scale batches can be displayed
    // at one common height (keeps the drawn numbers visually identical).
    // Measured synchronously (not via ResizeObserver, whose callbacks depend
    // on rendering frames) and refreshed on window resize.
    useLayoutEffect(() => {
        const el = previewRef.current;
        if (!el) return;
        const update = () => setPreviewWidth(el.clientWidth);
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [processedImages.length > 0]);

    const uniformBatch = processedImages.length > 0 && processedImages.every(img => img.uniformMode);
    const uniformMode = uniformBatch ? processedImages[0].uniformMode : null;
    let displayHeight: any = null;
    let displayWidth: any = null;
    if (uniformBatch && previewWidth > 0) {
        // card-body 左右各有 1rem 内边距
        const usableWidth = Math.max(0, previewWidth - 32);
        if (uniformMode === 'same-height') {
            const commonHeight = processedImages[0].height;
            const maxScaledWidth = Math.max(...processedImages.map(img => img.width));
            if (usableWidth > 0 && commonHeight > 0 && maxScaledWidth > 0) {
                // 最宽的图恰好占满可用宽度，其余图保持相同显示高度；
                // 不超过原始高度，避免预览被放大
                displayHeight = Math.min(commonHeight, Math.floor(usableWidth * commonHeight / maxScaledWidth));
            }
        } else if (uniformMode === 'same-width') {
            const commonWidth = processedImages[0].width;
            if (usableWidth > 0 && commonWidth > 0) {
                // 所有图保持相同显示宽度；不超过可用宽度
                displayWidth = Math.min(commonWidth, usableWidth);
            }
        }
    }

    // Target size for uniform scaling, computed from the whole image list
    // (max/min baselines) or the custom value; null means no scaling.
    const getScaleTargetSize = () => {
        if (settings.scaleMode !== 'same-height' && settings.scaleMode !== 'same-width') {
            return null;
        }
        if (settings.scaleBaseline === 'max' || settings.scaleBaseline === 'min') {
            const dims = images.map((image) => settings.scaleMode === 'same-height' ? image.height : image.width);
            return settings.scaleBaseline === 'max' ? Math.max(...dims) : Math.min(...dims);
        }
        const customSize = parseInt(settings.scaleSize);
        return customSize > 0 ? customSize : null;
    };

    const processImagesWithNumbers = async () => {
        if (images.length === 0) {
            setProcessedImages([]);
            return;
        }

        setIsProcessing(true);
        try {
            const scaleTargetSize = getScaleTargetSize();
            const processed = await Promise.all(
                images.map(async (image, index) => {
                    const number = sequenceService.generateNumber(settings.numberType, index + settings.numberStart);
                    const numberImage = new NumberImage(image, number, settings, scaleTargetSize);
                    try {
                        const processedImage = await numberImage.process();
                        return processedImage;
                    } finally {
                        numberImage.destroy();
                    }
                })
            );
            setProcessedImages(processed);
            setHasChanges(false);
            notify(t('number-images/result/process_success'), '', 'success');
        } catch (error: any) {
            console.error('Failed to process images:', error);
            notify(t('number-images/result/process_error'), error.toString(), 'error');
            setProcessedImages([]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownloadAll = async () => {
        if (processedImages.length === 0) return;
        
        const zip = new JSZip();
        
        try {
            // Add each image to the zip
            for (let i = 0; i < processedImages.length; i++) {
                const image = processedImages[i];
                zip.file(`image_${i + 1}_${image.name}`, image.processedBlob);
            }
            
            // Generate the zip file and trigger download
            const content = await zip.generateAsync({ type: 'blob' });
            downloadFile(content, 'processed_images.zip');
        } catch (error: any) {
            console.error('Error creating zip file:', error);
        }
    };
    const renderEmpty = () => (
<>

        <div className="card-body">
            <div className="text-center text-muted py-5">
                <i className="bi bi-images fs-1"></i>
                <p className="mt-2">{t('number-images/result/no_images_loaded')}</p>
                <small>{t('number-images/result/load_images_hint')}</small>
            </div>
        </div>
    
</>
);

    const renderImage = (image, index) => {
        const className = [
            'card-body',
            index % 2 === 0 ? 'bg-light' : ''
        ].join(' ');

        return (
            <div key={image.id} className={className}>
                <img
                    src={image.processedUrl || image.url}
                    alt={image.name}
                    className={(displayHeight || displayWidth) ? 'd-block mx-auto' : 'w-100'}
                    style={displayHeight
                        ? { height: `${displayHeight}px`, width: 'auto', maxWidth: '100%' }
                        : displayWidth
                            ? { width: `${displayWidth}px`, height: 'auto', maxWidth: '100%' }
                            : undefined}
                />
            </div>
        );
    }

    const renderGenerateButton = () => {
        return (
<>

            <button className="btn btn-outline-primary btn-sm position-relative me-2" disabled={isProcessing || !hasChanges || images.length === 0} onClick={processImagesWithNumbers}>
                <i className="bi bi-caret-right-fill me-1"></i>
                {isProcessing ? t('number-images/result/processing') : t('number-images/result/process_images')}
            </button>
        
</>
);
    }

    return (
<>

        <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
                {renderGenerateButton()}

                <button className="btn btn-outline-success btn-sm" onClick={handleDownloadAll} disabled={isProcessing || processedImages.length === 0}>
                    <i className="bi bi-download me-1"></i>
                    {t('number-images/result/download_all')}
                </button>
            </div>
            {processedImages.length > 0 ? (
<>
<div ref={previewRef}>
{processedImages.map(renderImage)}
</div>
</>
) : renderEmpty()}
        </div>
    
</>
);
};

export default ResultCard;
