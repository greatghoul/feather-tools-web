import { useState, useEffect } from 'react';
import ColorExtractor from '../services/ColorExtractor';
import { downloadFile } from '~/helpers/files';
import { t } from '~/helpers/i18n';
import styles from './ResultCard.module.css';

const BlankResult = () => (
<>

    <div className="card-body text-center">
        <div className="text-muted">
            <i className="bi bi-palette" style={{ fontSize: '2rem' }}></i>
            <p className="mt-2 fw-semibold">{t('image-palette/result/not_processed')}</p>
            <small className="text-muted">{t('image-palette/result/upload_hint')}</small>
        </div>
    </div>

</>
);

const ResultCard = ({ images = [], setting, processingKey = 0 }) => {
    const [paletteResults, setPaletteResults] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [copiedColor, setCopiedColor] = useState(null);

    const handleCopyColor = (hex) => {
        navigator.clipboard.writeText(hex).then(() => {
            setCopiedColor(hex);
            setTimeout(() => setCopiedColor(null), 1500);
        });
    };

    const handleProcess = async () => {
        if (images.length === 0) return;

        setPaletteResults([]);
        setIsProcessing(true);

        const results: any[] = [];
        const totalSteps = images.length;
        let completedSteps = 0;

        try {
            for (const image of images) {
                const extractor = new ColorExtractor(image, setting);
                const result = await extractor.process();
                completedSteps++;
                setProgress(Math.round((completedSteps / totalSteps) * 100));
                results.push(result);
                setPaletteResults(results);
            }
        } catch (error) {
            console.error('Error extracting palette:', error);
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    const handleDownloadPaletteImage = (result, index) => {
        const number = (index + 1).toString().padStart(2, '0');
        const name = result.image.name.replace(/\.[^/.]+$/, '');
        downloadFile(result.palettePreviewBlob, `palette_${number}_${name}.png`);
    };

    useEffect(() => {
        if (images.length > 0) {
            handleProcess();
        }
    }, [processingKey]);

    const renderColorBlocks = (colors) => {
        return (
<>

            <div className={`${styles.paletteRowStyle}`}>
                {colors.map(color => (
<>

                    <div className="d-flex flex-column align-items-center" style={{ cursor: 'pointer' }} onClick={() => handleCopyColor(color.hex)} title={`${t('image-palette/result/click_to_copy')}`}>
                        <span className={`${styles.paletteSwatchStyle}`} style={{ backgroundColor: color.hex, position: 'relative' }}>
                            {copiedColor === color.hex && (
<>

                                <span className={`${styles.copyTooltipStyle}`} style={{ opacity: '1' }}>Copied!</span>
                            
</>
)}
                        </span>
                        <small className="text-muted mt-1" style={{ fontSize: '10px', fontFamily: 'monospace' }}>
                            {color.hex}
                        </small>
                    </div>
                
</>
))}
            </div>
        
</>
);
    };

    const renderResult = (result, index) => {
        return (
<>

            <div className={`card-body ${index % 2 === 0 ? '' : 'bg-light'}`}>
                <div className="row align-items-center">
                    <div className="col-md-5 text-center mb-3 mb-md-0">
                        <img src={result.image.url} className="img-fluid rounded" style={{ maxHeight: '160px', objectFit: 'contain' }} alt={result.image.name} />
                    </div>
                    <div className="col-md-7">
                        {renderColorBlocks(result.colors)}
                        <button className="btn btn-sm btn-outline-primary mt-3" onClick={() => handleDownloadPaletteImage(result, index)}>
                            <i className="bi bi-download me-1"></i>
                            {t('image-palette/result/download_palette')}
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
                    {isProcessing
                        ? (
<>
<span className="spinner-border spinner-border-sm me-1"></span>
</>
)
                        : (
<>
<i className="bi bi-palette me-1"></i>
</>
)
                    }
                    {t('image-palette/result/extract_palette')}
                </button>
            </div>

            {isProcessing && (
<>

                <div className="progress rounded-0" style={{ height: '4px' }}>
                    <div className="progress-bar" style={{ width: `${progress}%` }} role="progressbar"></div>
                </div>
            
</>
)}

            {paletteResults.length > 0
                ? paletteResults.map(renderResult)
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
