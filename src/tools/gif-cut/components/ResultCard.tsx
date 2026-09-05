import { t } from '~/helpers/i18n';

const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const ResultCard = ({ resultUrl, fileName, fileSize, onDownload, onClear }) => {
    return (
<>

        <div className="card border-success">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <span><i className="bi bi-check-circle me-1"></i>{t('gif-cut/result/title')}</span>
                <div>
                    <button className="btn btn-sm btn-light me-2" onClick={onDownload}>
                        <i className="bi bi-download me-1"></i>{t('gif-cut/button/download')}
                    </button>
                    <button className="btn btn-sm btn-outline-light" onClick={onClear}>
                        {t('gif-cut/button/clear')}
                    </button>
                </div>
            </div>
            <div className="card-body text-center">
                <img src={resultUrl} alt="cut result" className="img-fluid" style={{ maxHeight: '400px' }} />
                <div className="mt-2 text-muted small">
                    {fileName} ({formatSize(fileSize)})
                </div>
            </div>
        </div>
    
</>
);
};

export default ResultCard;
