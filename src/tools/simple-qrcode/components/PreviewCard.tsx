import { useState, useEffect } from 'react';
import { t } from '~/helpers/i18n';
import QRCode from 'qrcode';
import styles from './PreviewCard.module.css';

const DEFAULT_URL = 'https://feather-tools.com/simple-qrcode';

const PreviewCard = ({ settings, creating, onCreated }) => {
    const [image, setImage] = useState<string | null>(null);

    const url = settings.url || DEFAULT_URL;
    const options = {
        width: 256,
        margin: 0,
        color: {
            dark: settings.foreground,
            light: settings.background
        }
    };

    useEffect(() => {
        QRCode.toCanvas(url, options).then(canvas => {
            setImage(canvas.toDataURL());
            onCreated();
        });
    }, [settings]);

    const handleDownload = (filename, url) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleDownloadPng = () => {
        handleDownload('qrcode.png', image);
    }

    const handleDownloadSvg = () => {
        QRCode.toString(url, { ...options, type: 'svg' }).then(svgString => {
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            handleDownload('qrcode.svg', URL.createObjectURL(blob));
        });
    }

    return (
<>

        <div className="card h-100">
            <div className="card-header">
                <h5 className="mb-0">{t('simple-qrcode/preview/title')}</h5>
            </div>
            <div className="card-body text-center">
                <div className="d-flex justify-content-center mb-4">
                    <div id="qrcode-preview" className={styles.previewStyle}>
                        {image && (
<>
<img src={image} />
</>
)}
                    </div>
                </div>
                <div className="btn-group">
                    <button className="btn btn-outline-success" disabled={creating} onClick={handleDownloadPng}>
                        <i className="bi bi-download me-1"></i> {t('simple-qrcode/preview/download-png')}
                    </button>
                    <button className="btn btn-outline-success" disabled={creating} onClick={handleDownloadSvg}>
                        <i className="bi bi-download me-1"></i> {t('simple-qrcode/preview/download-svg')}
                    </button>
                </div>
            </div>
        </div>
    
</>
);
};

export default PreviewCard;
