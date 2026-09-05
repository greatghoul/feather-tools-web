import { t } from '~/helpers/i18n';
import { formatFileSize } from '../services/GifMakerService';

const ResultCard = ({ result, isGenerating, progress, progressLabel, canGenerate, onGenerate, onDownload }) => {
    return (
<>

        <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <a className="nav-link active" href="#">
                            <i className="bi bi-film me-1"></i>
                            {t('gif-maker/tab/result')}
                        </a>
                    </li>
                </ul>
                <button className="btn btn-success btn-sm" onClick={onGenerate} disabled={!canGenerate}>
                    {isGenerating ? (
<>

                        <span className="spinner-border spinner-border-sm me-1"></span>
                        {t('gif-maker/button/generating')}
                    
</>
) : (
<>

                        <i className="bi bi-magic me-1"></i>
                        {t('gif-maker/button/generate')}
                    
</>
)}
                </button>
            </div>

            <div className="card-body">
                {isGenerating ? (
<>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small text-muted">
                            {progressLabel || t('gif-maker/message/processing')}
                        </span>
                        <span className="small fw-bold">{progress}%</span>
                    </div>
                    <div className="progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                        <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: `${progress}%` }}></div>
                    </div>
                
</>
) : result ? (
<>

                    <div className="text-center mb-3 gif-preview-wrapper">
                        <img src={result.url} alt="Generated GIF" className="img-fluid gif-preview-image" />
                    </div>
                    <div className="row text-center small g-2">
                        <div className="col-6 col-md-3">
                            <div className="text-muted">{t('gif-maker/result/dimensions')}</div>
                            <strong>{result.width}×{result.height}</strong>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="text-muted">{t('gif-maker/result/frames')}</div>
                            <strong>{result.frames}</strong>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="text-muted">{t('gif-maker/result/duration')}</div>
                            <strong>{(result.duration / 1000).toFixed(1)}s</strong>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="text-muted">{t('gif-maker/result/file_size')}</div>
                            <strong>{formatFileSize(result.size)}</strong>
                        </div>
                    </div>
                
</>
) : (
<>

                    <p className="text-muted text-center py-5 mb-0">{t('gif-maker/message/no_images')}</p>
                
</>
)}
            </div>

            {result && !isGenerating ? (
<>

                <div className="card-footer text-center py-3">
                    <button className="btn btn-primary" onClick={onDownload}>
                        <i className="bi bi-download me-1"></i>
                        {t('gif-maker/button/download')}
                    </button>
                </div>
            
</>
) : null}
        </div>
    
</>
);
};

export default ResultCard;
