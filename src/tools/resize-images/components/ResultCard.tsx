import { useState } from 'react';
import JSZip from 'jszip';
import { downloadFile } from '~/helpers/files';
import ImageResizer from '../services/ImageResizer';
import ProgressBar from '~/components/ProgressBar';
import { t } from '~/helpers/i18n';
import styles from './ResultCard.module.css';

const BlankResult = () => (
<>

    <div className="card-body text-center">
        <div className="text-muted">
            <i className="bi bi-image" style={{ fontSize: '2rem' }}></i>
            <p className="mt-2 fw-semibold">{t('resize-images/result/not_processed')}</p>
            <small className="text-muted">{t('resize-images/result/upload_hint')}</small>
        </div>
    </div>

</>
);

const ResultCard = ({ images = [] as any[], settings = [] as any[] }) => {
    const [resizeResults, setResizeResults] = useState<any[]>([]);
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
        
        const results: any[] = [];
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
        return (
<>

            <div className={`card-body text-center ${index % 2 === 0 ? '' : 'bg-light'}`}>
                <img src={resized.url} className={`mb-2 d-inline-block ${styles.imageStyle}`} />
                <p className="card-text"><span className="badge bg-primary">{resized.width}x{resized.height}</span></p>
            </div>
        
</>
);
    }

    return (
<>

        <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
                <button className="btn btn-outline-primary btn-sm me-2" onClick={handleResize} disabled={isProcessing || images.length === 0 || settings.length === 0}>
                    {isProcessing ? (
<>
<span className="spinner-border spinner-border-sm me-1"></span>
</>
) : ''}
                    {t('resize-images/result/resize_images')}
                </button>

                <button className="btn btn-outline-success btn-sm" disabled={resizeResults.length === 0} onClick={handleDownloadAll}>
                    <i className="bi bi-download me-1"></i>
                    {t('resize-images/result/download_all')}
                </button>
            </div>

            <div className="card-body p-0">
                {isProcessing && (
<>
<ProgressBar value={progress} />
</>
)}
            </div>
            
            {resizeResults.length > 0
                ? resizeResults.map(renderResizedImage)
                : (
<>
<BlankResult />
</>
)
            }
        </div>
    
</>
);
};

export default ResultCard;
