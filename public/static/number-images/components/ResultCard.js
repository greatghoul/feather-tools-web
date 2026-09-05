import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { useStore } from '~/contexts/StoreContext.js';
import { downloadFile } from '~/helpers/files.js';
import { notify } from '~/helpers/messages.js';
import { getText } from '~/helpers/utils.js';
import JSZip from 'jszip';
import NumberImage from '@/services/NumberImage.js';
import SequenceNumber from '@/services/SequenceNumber.js';

const sequenceService = new SequenceNumber();

const ResultCard = ({ 
    images, 
    settings
}) => {
    const [processedImages, setProcessedImages] = useState([]);
    const { isProcessing, setIsProcessing, hasChanges, setHasChanges } = useStore();

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
            notify(getText('number-images/result/process_success'), '', 'success');
        } catch (error) {
            console.error('Failed to process images:', error);
            notify(getText('number-images/result/process_error'), error.toString(), 'error');
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
        } catch (error) {
            console.error('Error creating zip file:', error);
        }
    };
    const renderEmpty = () => html`
        <div class="card-body">
            <div class="text-center text-muted py-5">
                <i class="bi bi-images fs-1"></i>
                <p class="mt-2">${getText('number-images/result/no_images_loaded')}</p>
                <small>${getText('number-images/result/load_images_hint')}</small>
            </div>
        </div>
    `;

    const renderImage = (image, index) => {
        const className = [
            'card-body',
            index % 2 === 0 ? 'bg-light' : ''
        ].join(' ');

        return html`
            <div 
                key=${image.id}
                class=${className}
            >
                <img 
                    src=${image.processedUrl || image.url} 
                    alt=${image.name}
                    class="w-100"
                />
            </div>
        `;
    }

    const renderGenerateButton = () => {
        return html`
            <button 
                class="btn btn-outline-primary btn-sm position-relative me-2"
                disabled=${isProcessing || !hasChanges || images.length === 0}
                onClick=${processImagesWithNumbers}
            >
                <i class="bi bi-caret-right-fill me-1"></i>
                ${isProcessing ? getText('number-images/result/processing') : getText('number-images/result/process_images')}
            </button>
        `;
    }

    return html`
        <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
                ${renderGenerateButton()}

                <button 
                    class="btn btn-outline-success btn-sm"
                    onClick=${handleDownloadAll}
                    disabled=${isProcessing || processedImages.length === 0}
                >
                    <i class="bi bi-download me-1"></i>
                    ${getText('number-images/result/download_all')}
                </button>
            </div>
            ${processedImages.length > 0 ? html`${processedImages.map(renderImage)}` : renderEmpty()}
        </div>
    `;
};

export default ResultCard;
