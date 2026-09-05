import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { css } from 'goober';
import JSZip from 'jszip';
import { downloadFile } from '~/helpers/files.js';
import ImageResizer from '@/services/ImageResizer.js';
import ProgressBar from '~/components/ProgressBar.js';
import { getText } from '~/helpers/utils.js';

const imageStyle = css`
    max-width: 100%;
`;

const BlankResult = () => html`
    <div class="card-body text-center">
        <div class="text-muted">
            <i class="bi bi-image" style="font-size: 2rem;"></i>
            <p class="mt-2 fw-semibold">${getText('resize-images/result/not_processed')}</p>
            <small class="text-muted">${getText('resize-images/result/upload_hint')}</small>
        </div>
    </div>
`;

const ResultCard = ({ images = [], settings = [] }) => {
    const [resizeResults, setResizeResults] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleDownloadAll = async () => {
        const zip = new JSZip();
        
        for (const [index, resized] of resizeResults.entries()) {
            const response = await fetch(resized.url);
            const blob = await response.blob();
            
            // Only add index if filename exists
            let newName = resized.name;
            if (zip.files[newName]) {
                const nameParts = resized.name.split('-');
                const lastPart = nameParts.pop();
                newName = [...nameParts, index, lastPart].join('-');
            }
            
            zip.file(newName, blob);
        }
        
        const content = await zip.generateAsync({ type: 'blob' });
        downloadFile(content, 'resized-images.zip');
    };

    const handleResize = async () => {
        if (images.length === 0) return;
        
        setResizeResults([]);
        setIsProcessing(true);
        
        const results = [];
        const totalSteps = images.length * settings.length;
        let completedSteps = 0;
            
            try {
                for (const image of images) {
                    const imgElement = new Image();
                    await new Promise((resolve) => {
                        imgElement.onload = resolve;
                        imgElement.src = image.url;
                    });
                    
                    const resized = await Promise.all(
                        settings.map(async setting => {
                            const resizer = new ImageResizer(imgElement, image, setting);
                            const result = await resizer.process();
                            completedSteps++;
                            setProgress(Math.round((completedSteps / totalSteps) * 100));
                            return result;
                        })
                    );
                    results.push(...resized);
                    setResizeResults(results);
                }                
        } catch (error) {
            console.error('Error resizing images:', error);
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    const renderResizedImage = (resized, index) => {
        return html`
            <div class="card-body text-center ${index % 2 === 0 ? '' : 'bg-light'}">
                <img src=${resized.url} class="mb-2 d-inline-block ${imageStyle}" />
                <p class="card-text"><span class="badge bg-primary">${resized.width}x${resized.height}</span></p>
            </div>
        `;
    }

    return html`
        <div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
                <button 
                    class="btn btn-outline-primary btn-sm me-2"
                    onClick=${handleResize}
                    disabled=${isProcessing || images.length === 0 || settings.length === 0}
                >
                    ${isProcessing ? html`<span class="spinner-border spinner-border-sm me-1"></span>` : ''}
                    ${getText('resize-images/result/resize_images')}
                </button>

                <button 
                    class="btn btn-outline-success btn-sm"
                    disabled=${resizeResults.length === 0}
                    onClick=${handleDownloadAll}
                >
                    <i class="bi bi-download me-1"></i>
                    ${getText('resize-images/result/download_all')}
                </button>
            </div>

            <div class="card-body p-0">
                ${isProcessing && html`<${ProgressBar} value=${progress} />`}
            </div>
            
            ${resizeResults.length > 0
                ? resizeResults.map(renderResizedImage)
                : html`<${BlankResult} />`
            }
        </div>
    `;
};

export default ResultCard;