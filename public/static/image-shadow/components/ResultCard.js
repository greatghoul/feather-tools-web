import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { css } from 'goober';
import JSZip from 'jszip';
import { downloadFile } from '~/helpers/files.js';
import ImageShadow from '@/services/ImageShadow.js';
import ProgressBar from '~/components/ProgressBar.js';
import { getText } from '~/helpers/utils.js';

const imageStyle = css`
    max-width: 100%;
    background: repeating-conic-gradient(#e5e5e5 0% 25%, #ffffff 0% 50%) 50% / 20px 20px;
`;

const BlankResult = () => html`
    <div class="card-body text-center">
        <div class="text-muted">
            <i class="bi bi-image" style="font-size: 2rem;"></i>
            <p class="mt-2 fw-semibold">${getText('image-shadow/result/not_processed')}</p>
            <small class="text-muted">${getText('image-shadow/result/upload_hint')}</small>
        </div>
    </div>
`;

const ResultCard = ({ images = [], setting, autoProcess = false, processingKey = 0 }) => {
    const [shadowResults, setShadowResults] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleDownloadAll = async () => {
        const zip = new JSZip();
        
        for (const [index, shadowed] of shadowResults.entries()) {
            const response = await fetch(shadowed.url);
            const blob = await response.blob();
            
            const number = (index + 1).toString().padStart(2, '0');
            const baseName = shadowed.image.name.replace(/\.[^/.]+$/, '');
            const newName = `Shadow_${number}_${baseName}.png`;
            
            zip.file(newName, blob);
        }
        
        const content = await zip.generateAsync({ type: 'blob' });
        downloadFile(content, 'shadow-images.zip');
    };

    const handleDownloadSingle = async (shadowed, index) => {
        const response = await fetch(shadowed.url);
        const blob = await response.blob();
        
        const number = (index + 1).toString().padStart(2, '0');
        const baseName = shadowed.image.name.replace(/\.[^/.]+$/, '');
        const newName = `Shadow_${number}_${baseName}.png`;
        
        downloadFile(blob, newName);
    };

    const handleAddShadow = async () => {
        if (images.length === 0) return;
        
        setShadowResults([]);
        setIsProcessing(true);
        
        const results = [];
        const totalSteps = images.length;
        let completedSteps = 0;
            
            try {
                for (const image of images) {
                    const shadow = new ImageShadow(image, setting);
                    const result = await shadow.process();
                    completedSteps++;
                    setProgress(Math.round((completedSteps / totalSteps) * 100));
                    results.push(result);
                    setShadowResults(results);
                }                
        } catch (error) {
            console.error('Error adding shadow:', error);
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    useEffect(() => {
        if (autoProcess && images.length > 0) {
            handleAddShadow();
        }
    }, [processingKey]);

    const renderShadowedImage = (shadowed, index) => {
        return html`
            <div class="card-body text-center ${index % 2 === 0 ? '' : 'bg-light'}">
                <img src=${shadowed.url} class="mb-2 d-inline-block ${imageStyle}" />
                <button 
                    class="btn btn-sm btn-outline-primary mt-2"
                    onClick=${() => handleDownloadSingle(shadowed, index)}
                >
                    <i class="bi bi-download me-1"></i>
                    ${getText('image-shadow/result/download')}
                </button>
            </div>
        `;
    }

    return html`
        <div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
                <button 
                    class="btn btn-outline-primary btn-sm me-2"
                    onClick=${handleAddShadow}
                    disabled=${isProcessing || images.length === 0}
                >
                    ${isProcessing ? html`<span class="spinner-border spinner-border-sm me-1"></span>` : ''}
                    ${getText('image-shadow/result/process_images')}
                </button>

                <button 
                    class="btn btn-outline-success btn-sm"
                    disabled=${shadowResults.length === 0}
                    onClick=${handleDownloadAll}
                >
                    <i class="bi bi-download me-1"></i>
                    ${getText('image-shadow/result/download_all')}
                </button>
            </div>

            <div class="card-body p-0">
                ${isProcessing && html`<${ProgressBar} value=${progress} />`}
            </div>
            
            ${shadowResults.length > 0
                ? shadowResults.map(renderShadowedImage)
                : html`<${BlankResult} />`
            }
        </div>
    `;
};

export default ResultCard;
