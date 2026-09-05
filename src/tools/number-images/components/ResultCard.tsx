import { useState } from 'react';
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

    const processImagesWithNumbers = async () => {
        if (images.length === 0) {
            setProcessedImages([]);
            return;
        }

        setIsProcessing(true);
        try {
            const processed = await Promise.all(
                images.map(async (image, index) => {
                    const number = sequenceService.generateNumber(settings.numberType, index + settings.numberStart);
                    const numberImage = new NumberImage(image, number, settings);
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
<>

            <div key={image.id} className={className}>
                <img src={image.processedUrl || image.url} alt={image.name} className="w-100" />
            </div>
        
</>
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
{processedImages.map(renderImage)}
</>
) : renderEmpty()}
        </div>
    
</>
);
};

export default ResultCard;
