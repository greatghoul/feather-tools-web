import { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { downloadFile } from '~/helpers/files';
import ImageGrayscale from '../services/ImageGrayscale';
import ProgressBar from '~/components/ProgressBar';
import { t } from '~/helpers/i18n';
import styles from './ResultCard.module.css';

const BlankResult = () => (
<>

    <div className="card-body text-center">
        <div className="text-muted">
            <i className="bi bi-image" style={{ fontSize: '2rem' }}></i>
            <p className="mt-2 fw-semibold">{t('image-grayscale/result/not_processed')}</p>
            <small className="text-muted">{t('image-grayscale/result/upload_hint')}</small>
        </div>
    </div>

</>
);

const ResultCard = ({ images = [] as any[] }) => {
    const [results, setResults] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const prevImagesRef = useRef<any[]>([]);

    const handleDownloadAll = async () => {
        const zip = new JSZip();

        for (const [index, result] of results.entries()) {
            const response = await fetch(result.url);
            const blob = await response.blob();

            const number = (index + 1).toString().padStart(2, '0');
            const baseName = result.image.name.replace(/\.[^/.]+$/, '');
            const newName = `Grayscale_${number}_${baseName}.png`;

            zip.file(newName, blob);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        downloadFile(content, 'grayscale-images.zip');
    };

    const handleDownloadSingle = async (result, index) => {
        const response = await fetch(result.url);
        const blob = await response.blob();

        const number = (index + 1).toString().padStart(2, '0');
        const baseName = result.image.name.replace(/\.[^/.]+$/, '');
        const newName = `Grayscale_${number}_${baseName}.png`;

        downloadFile(blob, newName);
    };

    useEffect(() => {
        const prevIds = prevImagesRef.current.map(img => img.id).sort().join(',');
        const currIds = images.map(img => img.id).sort().join(',');

        if (prevIds === currIds) return;

        prevImagesRef.current = images;

        if (images.length === 0) {
            setResults([]);
            return;
        }

        let cancelled = false;
        const run = async () => {
            setIsProcessing(true);
            setProgress(0);

            const newResults: any[] = [];
            const totalSteps = images.length;
            let completedSteps = 0;

            try {
                for (const image of images) {
                    if (cancelled) return;
                    const grayscale = new ImageGrayscale(image);
                    const result = await grayscale.process();
                    completedSteps++;
                    setProgress(Math.round((completedSteps / totalSteps) * 100));
                    newResults.push(result);
                    setResults([...newResults]);
                }
            } catch (error) {
                console.error('Error processing image:', error);
            } finally {
                if (!cancelled) {
                    setIsProcessing(false);
                    setProgress(0);
                }
            }
        };

        run();

        return () => { cancelled = true; };
    }, [images]);

    const renderResult = (result, index) => {
        return (
            <div key={index} className={`card-body text-center ${index % 2 === 0 ? '' : 'bg-light'}`}>
                <img src={result.url} className={`mb-2 d-inline-block ${styles.imageStyle}`} />
                <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => handleDownloadSingle(result, index)}>
                    <i className="bi bi-download me-1"></i>
                    {t('image-grayscale/result/download')}
                </button>
            </div>
        );
    };

    return (
<>

        <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <a className="nav-link active" href="#">
                            <i className="bi bi-images me-1"></i>
                            {t('image-grayscale/result/title')}
                            {isProcessing ? (
<>
<span className="spinner-border spinner-border-sm ms-1"></span>
</>
) : ''}
                        </a>
                    </li>
                </ul>

                <button className="btn btn-outline-success btn-sm" disabled={results.length === 0} onClick={handleDownloadAll}>
                    <i className="bi bi-download me-1"></i>
                    {t('image-grayscale/result/download_all')}
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
                ? results.map(renderResult)
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
