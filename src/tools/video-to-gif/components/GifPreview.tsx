import { t } from '~/helpers/i18n';
import { downloadFile } from '~/helpers/files';
import { formatFileSize } from '../services/VideoGifService';

const GifPreview = ({ result, baseName, onDownload }) => {
    if (!result) return null;

    const fileName = `${baseName}.gif`;

    const handleDownload = () => {
        downloadFile(result.blob, fileName);
        onDownload();
    };

    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <span>{t('video-to-gif/result/title')}</span>
                <button className="btn btn-sm btn-primary" onClick={handleDownload}>
                    <i className="bi bi-download me-1"></i>
                    {t('video-to-gif/button/download')}
                </button>
            </div>
            <div className="card-body">
                <div className="text-center mb-3 gif-preview-wrapper">
                    <img src={result.url} alt={fileName} className="img-fluid gif-preview-image" />
                </div>
                <div className="row text-center small g-2">
                    <div className="col-4">
                        <div className="text-muted">{t('video-to-gif/result/dimensions')}</div>
                        <strong>{result.width}×{result.height}</strong>
                    </div>
                    <div className="col-4">
                        <div className="text-muted">{t('video-to-gif/result/frames')}</div>
                        <strong>{result.frames}</strong>
                    </div>
                    <div className="col-4">
                        <div className="text-muted">{t('video-to-gif/result/file_size')}</div>
                        <strong>{formatFileSize(result.size)}</strong>
                    </div>
                </div>
            </div>
        </div>
    
</>
);
};

export default GifPreview;
