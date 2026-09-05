import { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { downloadFile } from '~/helpers/files';
import ImageConvert from '../services/ImageConvert';
import ProgressBar from '~/components/ProgressBar';
import { t } from '~/helpers/i18n';
import styles from './ResultCard.module.css';

const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const BlankResult = () => (
<>

    <div className="card-body text-center">
        <div className="text-muted">
            <i className="bi bi-image" style={{ fontSize: '2rem' }}></i>
            <p className="mt-2 fw-semibold">{t('image-convert/result/not_processed')}</p>
            <small className="text-muted">{t('image-convert/result/upload_hint')}</small>
        </div>
    </div>

</>
);

const ResultCard = ({ images = [] as any[], setting, processingKey = 0 }) => {
    const [convertResults, setConvertResults] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleDownloadAll = async () => {
        const zip = new JSZip();

        for (const [index, result] of convertResults.entries()) {
            const response = await fetch(result.url);
            const blob = await response.blob();

            const number = (index + 1).toString().padStart(2, '0');
            const newName = `Converted_${number}_${result.name}`;

            zip.file(newName, blob);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        downloadFile(content, 'converted-images.zip');
    };

    const handleDownloadSingle = async (result, index) => {
        const response = await fetch(result.url);
        const blob = await response.blob();

        const number = (index + 1).toString().padStart(2, '0');
        const newName = `Converted_${number}_${result.name}`;

        downloadFile(blob, newName);
    };

    const handleProcess = async () => {
        if (images.length === 0) return;

        setConvertResults([]);
        setIsProcessing(true);

        const results: any[] = [];
        const totalSteps = images.length;
        let completedSteps = 0;

        try {
            for (const image of images) {
                const converter = new ImageConvert(image, setting);
                const result = await converter.process();
                completedSteps++;
                setProgress(Math.round((completedSteps / totalSteps) * 100));
                results.push(result);
                setConvertResults(results);
            }
        } catch (error) {
            console.error('Error converting image:', error);
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    useEffect(() => {
        if (images.length > 0) {
            handleProcess();
        }
    }, [processingKey]);

    const renderResult = (result, index) => {
        const savedColor = result.sizeChange > 0 ? 'text-success' : 'text-danger';
        const savedIcon = result.sizeChange > 0 ? 'bi-arrow-down' : 'bi-arrow-up';

        return (
<>

            <div className={`card-body ${index % 2 === 0 ? '' : 'bg-light'}`}>
                <div className="row align-items-center">
                    <div className="col-md-6 text-center mb-3 mb-md-0">
                        <img src={result.url} className={`${styles.imageStyle}`} />
                    </div>
                    <div className="col-md-6">
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small">
                                {result.width} x {result.height}px
                            </span>
                            <span className="badge bg-secondary">{result.format.toUpperCase()}</span>
                        </div>
                        <table className="table table-sm table-borderless mb-2">
                            <tbody>
                                <tr>
                                    <td className="text-muted ps-0">{t('image-convert/result/original_size')}</td>
                                    <td className="text-end pe-0">{formatSize(result.originalSize)}</td>
                                </tr>
                                <tr>
                                    <td className="text-muted ps-0">{t('image-convert/result/converted_size')}</td>
                                    <td className="text-end pe-0">{formatSize(result.convertedSize)}</td>
                                </tr>
                            </tbody>
                        </table>
                        <button className="btn btn-sm btn-outline-primary w-100" onClick={() => handleDownloadSingle(result, index)}>
                            <i className="bi bi-download me-1"></i>
                            {t('image-convert/result/download')}
                        </button>
                    </div>
                </div>
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
                    {t('image-convert/result/convert_images')}
                </button>

                <button className="btn btn-outline-success btn-sm" disabled={convertResults.length === 0} onClick={handleDownloadAll}>
                    <i className="bi bi-download me-1"></i>
                    {t('image-convert/result/download_all')}
                </button>
            </div>

            <div className="card-body p-0">
                {isProcessing && (
<>
<ProgressBar value={progress} />
</>
)}
            </div>

            {convertResults.length > 0
                ? convertResults.map(renderResult)
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
