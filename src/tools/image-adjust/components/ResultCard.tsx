import { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { downloadFile } from '~/helpers/files';
import ImageAdjust from '../services/ImageAdjust';
import ProgressBar from '~/components/ProgressBar';
import { t } from '~/helpers/i18n';
import styles from './ResultCard.module.css';

const BlankResult = () => (
<>

    <div className="card-body text-center">
        <div className="text-muted">
            <i className="bi bi-image" style={{ fontSize: '2rem' }}></i>
            <p className="mt-2 fw-semibold">{t('image-adjust/result/not_processed')}</p>
            <small className="text-muted">{t('image-adjust/result/upload_hint')}</small>
        </div>
    </div>

</>
);

const ResultCard = ({ images = [], setting, autoProcess = false, processingKey = 0 }) => {
    const [adjustResults, setAdjustResults] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleDownloadAll = async () => {
        const zip = new JSZip();

        for (const [index, result] of adjustResults.entries()) {
            const response = await fetch(result.url);
            const blob = await response.blob();

            const number = (index + 1).toString().padStart(2, '0');
            const baseName = result.image.name.replace(/\.[^/.]+$/, '');
            const newName = `Adjusted_${number}_${baseName}.png`;

            zip.file(newName, blob);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        downloadFile(content, 'adjusted-images.zip');
    };

    const handleDownloadSingle = async (result, index) => {
        const response = await fetch(result.url);
        const blob = await response.blob();

        const number = (index + 1).toString().padStart(2, '0');
        const baseName = result.image.name.replace(/\.[^/.]+$/, '');
        const newName = `Adjusted_${number}_${baseName}.png`;

        downloadFile(blob, newName);
    };

    const handleProcess = async () => {
        if (images.length === 0) return;

        setAdjustResults([]);
        setIsProcessing(true);

        const results: any[] = [];
        const totalSteps = images.length;
        let completedSteps = 0;

        try {
            for (const image of images) {
                const adjust = new ImageAdjust(image, setting);
                const result = await adjust.process();
                completedSteps++;
                setProgress(Math.round((completedSteps / totalSteps) * 100));
                results.push(result);
                setAdjustResults(results);
            }
        } catch (error) {
            console.error('Error processing image:', error);
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    useEffect(() => {
        if (autoProcess && images.length > 0) {
            handleProcess();
        }
    }, [processingKey]);

    const renderResult = (result, index) => {
        return (
<>

            <div className={`card-body text-center ${index % 2 === 0 ? '' : 'bg-light'}`}>
                <img src={result.url} className={`mb-2 d-inline-block ${styles.imageStyle}`} />
                <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => handleDownloadSingle(result, index)}>
                    <i className="bi bi-download me-1"></i>
                    {t('image-adjust/result/download')}
                </button>
            </div>
        
</>
);
    };

    return (
<>

        <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
                <button className="btn btn-outline-primary btn-sm me-2" onClick={handleProcess} disabled={isProcessing || images.length === 0}>
                    {isProcessing ? (
<>
<span className="spinner-border spinner-border-sm me-1"></span>
</>
) : ''}
                    {t('image-adjust/result/process_images')}
                </button>

                <button className="btn btn-outline-success btn-sm" disabled={adjustResults.length === 0} onClick={handleDownloadAll}>
                    <i className="bi bi-download me-1"></i>
                    {t('image-adjust/result/download_all')}
                </button>
            </div>

            <div className="card-body p-0">
                {isProcessing && (
<>
<ProgressBar value={progress} />
</>
)}
            </div>

            {adjustResults.length > 0
                ? adjustResults.map(renderResult)
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
