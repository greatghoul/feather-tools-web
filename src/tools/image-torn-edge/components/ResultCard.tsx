import { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { downloadFile } from '~/helpers/files';
import ImageTornEdge from '../services/ImageTornEdge';
import ProgressBar from '~/components/ProgressBar';
import { t } from '~/helpers/i18n';
import styles from './ResultCard.module.css';

const BlankResult = () => (
<>

    <div className="card-body text-center">
        <div className="text-muted">
            <i className="bi bi-image" style={{ fontSize: '2rem' }}></i>
            <p className="mt-2 fw-semibold">{t('image-torn-edge/result/not_processed')}</p>
            <small className="text-muted">{t('image-torn-edge/result/upload_hint')}</small>
        </div>
    </div>

</>
);

const ResultCard = ({ images = [], setting, autoProcess = false, processingKey = 0 }) => {
    const [results, setResults] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleDownloadAll = async () => {
        const zip = new JSZip();

        for (const [index, result] of results.entries()) {
            const response = await fetch(result.url);
            const blob = await response.blob();

            const number = (index + 1).toString().padStart(2, '0');
            const baseName = result.image.name.replace(/\.[^/.]+$/, '');
            const newName = `TornEdge_${number}_${baseName}.png`;

            zip.file(newName, blob);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        downloadFile(content, 'torn-edge-images.zip');
    };

    const handleDownloadSingle = async (result, index) => {
        const response = await fetch(result.url);
        const blob = await response.blob();

        const number = (index + 1).toString().padStart(2, '0');
        const baseName = result.image.name.replace(/\.[^/.]+$/, '');
        const newName = `TornEdge_${number}_${baseName}.png`;

        downloadFile(blob, newName);
    };

    const handleProcess = async () => {
        if (images.length === 0) return;

        setResults([]);
        setIsProcessing(true);

        const newResults: any[] = [];
        const totalSteps = images.length;
        let completedSteps = 0;

        try {
            for (const image of images) {
                const processor = new ImageTornEdge(image, setting);
                const result = await processor.process();
                completedSteps++;
                setProgress(Math.round((completedSteps / totalSteps) * 100));
                newResults.push(result);
                setResults([...newResults]);
            }
        } catch (error) {
            console.error('Error processing torn edge:', error);
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

    const renderResultImage = (result, index) => {
        return (
            <div key={index} className={`card-body text-center ${index % 2 === 0 ? '' : 'bg-light'}`}>
                <img src={result.url} className={`mb-2 d-inline-block ${styles.imageStyle}`} />
                <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => handleDownloadSingle(result, index)}>
                    <i className="bi bi-download me-1"></i>
                    {t('image-torn-edge/result/download')}
                </button>
            </div>
        );
    }

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
                    {t('image-torn-edge/result/process_images')}
                </button>

                <button className="btn btn-outline-success btn-sm" disabled={results.length === 0} onClick={handleDownloadAll}>
                    <i className="bi bi-download me-1"></i>
                    {t('image-torn-edge/result/download_all')}
                </button>
            </div>

            <div className="card-body p-0">
                {isProcessing && (
<>
<ProgressBar value={progress} />
</>
)}
            </div>

            {results.length > 0
                ? results.map(renderResultImage)
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
