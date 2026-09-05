import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { css } from 'goober';
import JSZip from 'jszip';
import { downloadFile } from '~/helpers/files.js';
import ImageRoundCorner from '@/services/ImageRoundCorner.js';
import ProgressBar from '~/components/ProgressBar.js';
import { getText } from '~/helpers/utils.js';

const imageStyle = css`
    max-width: 100%;
`;

const BlankResult = () => html`
    <div class="card-body text-center">
        <div class="text-muted">
            <i class="bi bi-image" style="font-size: 2rem;"></i>
            <p class="mt-2 fw-semibold">${getText('image-round-corner/result/not_processed')}</p>
            <small class="text-muted">${getText('image-round-corner/result/upload_hint')}</small>
        </div>
    </div>
`;

const ResultCard = ({ images = [], setting, autoProcess = false, processingKey = 0 }) => {
    const [roundResults, setRoundResults] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleDownloadAll = async () => {
        const zip = new JSZip();
        
        for (const [index, rounded] of roundResults.entries()) {
            const response = await fetch(rounded.url);
            const blob = await response.blob();
            
            const number = (index + 1).toString().padStart(2, '0');
            const baseName = rounded.image.name.replace(/\.[^/.]+$/, '');
            const newName = `Rounded_${number}_${baseName}.png`;
            
            zip.file(newName, blob);
        }
        
        const content = await zip.generateAsync({ type: 'blob' });
        downloadFile(content, 'round-corner-images.zip');
    };

    const handleDownloadSingle = async (rounded, index) => {
        const response = await fetch(rounded.url);
        const blob = await response.blob();
        
        const number = (index + 1).toString().padStart(2, '0');
        const baseName = rounded.image.name.replace(/\.[^/.]+$/, '');
        const newName = `Rounded_${number}_${baseName}.png`;
        
        downloadFile(blob, newName);
    };

    const handleRoundCorner = async () => {
        if (images.length === 0) return;
        
        setRoundResults([]);
        setIsProcessing(true);
        
        const results = [];
        const totalSteps = images.length;
        let completedSteps = 0;
            
            try {
                for (const image of images) {
                    const imgElement = new Image();
                    await new Promise((resolve) => {
                        imgElement.onload = resolve;
                        imgElement.src = image.url;
                    });
                    
                    const roundCorner = new ImageRoundCorner(imgElement, image, setting);
                    const result = await roundCorner.process();
                    completedSteps++;
                    setProgress(Math.round((completedSteps / totalSteps) * 100));
                    results.push(result);
                    setRoundResults(results);
                }                
        } catch (error) {
            console.error('Error rounding corners:', error);
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    useEffect(() => {
        if (autoProcess && images.length > 0) {
            handleRoundCorner();
        }
    }, [processingKey]);

    const renderRoundedImage = (rounded, index) => {
        const corners = rounded.corners;
        const borderRadiusStyle = corners 
            ? `${corners.topLeft}px ${corners.topRight}px ${corners.bottomRight}px ${corners.bottomLeft}px`
            : `${rounded.radius}px`;
        
        return html`
            <div class="card-body text-center ${index % 2 === 0 ? '' : 'bg-light'}">
                <img src=${rounded.url} class="mb-2 d-inline-block ${imageStyle}" style="border-radius: ${borderRadiusStyle};" />
                <button 
                    class="btn btn-sm btn-outline-primary"
                    onClick=${() => handleDownloadSingle(rounded, index)}
                >
                    <i class="bi bi-download me-1"></i>
                    ${getText('image-round-corner/result/download')}
                </button>
            </div>
        `;
    }

    return html`
        <div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
                <button 
                    class="btn btn-outline-primary btn-sm me-2"
                    onClick=${handleRoundCorner}
                    disabled=${isProcessing || images.length === 0}
                >
                    ${isProcessing ? html`<span class="spinner-border spinner-border-sm me-1"></span>` : ''}
                    ${getText('image-round-corner/result/process_images')}
                </button>

                <button 
                    class="btn btn-outline-success btn-sm"
                    disabled=${roundResults.length === 0}
                    onClick=${handleDownloadAll}
                >
                    <i class="bi bi-download me-1"></i>
                    ${getText('image-round-corner/result/download_all')}
                </button>
            </div>

            <div class="card-body p-0">
                ${isProcessing && html`<${ProgressBar} value=${progress} />`}
            </div>
            
            ${roundResults.length > 0
                ? roundResults.map(renderRoundedImage)
                : html`<${BlankResult} />`
            }
        </div>
    `;
};

export default ResultCard;
