import { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { downloadFile } from '~/helpers/files';
import ImageShadow from '../services/ImageShadow';
import ProgressBar from '~/components/ProgressBar';
import { t } from '~/helpers/i18n';
import styles from './ResultCard.module.css';

const BlankResult = () => (
<>

    <div className="card-body text-center">
        <div className="text-muted">
            <i className="bi bi-image" style={{ fontSize: '2rem' }}></i>
            <p className="mt-2 fw-semibold">{t('image-shadow/result/not_processed')}</p>
            <small className="text-muted">{t('image-shadow/result/upload_hint')}</small>
        </div>
    </div>

</>
);

const ResultCard = ({ images = [], setting, autoProcess = false, processingKey = 0 }) => {
    const [shadowResults, setShadowResults] = useState<any[]>([]);
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
        
        const results: any[] = [];
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
        return (
            <div key={index} className={`card-body text-center ${index % 2 === 0 ? '' : 'bg-light'}`}>
                <img src={shadowed.url} className={`mb-2 d-inline-block ${styles.imageStyle}`} />
                <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => handleDownloadSingle(shadowed, index)}>
                    <i className="bi bi-download me-1"></i>
                    {t('image-shadow/result/download')}
                </button>
            </div>
        );
    }

    return (
<>

        <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
                <button className="btn btn-outline-primary btn-sm me-2" onClick={handleAddShadow} disabled={isProcessing || images.length === 0}>
                    {isProcessing ? (
<>
<span className="spinner-border spinner-border-sm me-1"></span>
</>
) : ''}
                    {t('image-shadow/result/process_images')}
                </button>

                <button className="btn btn-outline-success btn-sm" disabled={shadowResults.length === 0} onClick={handleDownloadAll}>
                    <i className="bi bi-download me-1"></i>
                    {t('image-shadow/result/download_all')}
                </button>
            </div>

            <div className="card-body p-0">
                {isProcessing && (
<>
<ProgressBar value={progress} />
</>
)}
            </div>
            
            {shadowResults.length > 0
                ? shadowResults.map(renderShadowedImage)
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
