import { t } from '~/helpers/i18n';

const MIN_SIZE = 16;

const ASPECTS = [
    { value: 0, labelKey: 'video-crop/aspect/free' },
    { value: 1, labelKey: 'video-crop/aspect/square' },
    { value: 4 / 3, labelKey: 'video-crop/aspect/4_3' },
    { value: 16 / 9, labelKey: 'video-crop/aspect/16_9' },
    { value: 9 / 16, labelKey: 'video-crop/aspect/9_16' },
];

const round = (n) => Math.round(n);

const CropControls = ({
    aspect,
    crop,
    videoWidth,
    videoHeight,
    isProcessing,
    onAspectChange,
    onReset,
    onCrop,
}) => {
    const canCrop = crop && crop.width >= MIN_SIZE && crop.height >= MIN_SIZE && !isProcessing;

    return (
<>

        <div className="card">
            <div className="card-header bg-light">
                <span>{t('video-crop/settings/title')}</span>
            </div>
            <div className="card-body">
                <div className="row g-3">
                    <div className="col-12">
                        <label className="form-label small">
                            {t('video-crop/settings/aspect')}
                        </label>
                        <div className="btn-group w-100" role="group">
                            {ASPECTS.map((a) => (
<>

                                <button key={a.value} type="button" className={`btn btn-sm ${aspect === a.value ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => onAspectChange(a.value)} disabled={isProcessing}>
                                    {t(a.labelKey)}
                                </button>
                            
</>
))}
                        </div>
                    </div>

                    {crop ? (
<>

                        <div className="col-12">
                            <label className="form-label small mb-2">
                                {t('video-crop/settings/region')}
                            </label>
                            <div className="row g-2">
                                <div className="col-6 col-md-3">
                                    <label className="form-label text-muted tiny mb-1">{t('video-crop/settings/x')}</label>
                                    <input type="text" className="form-control form-control-sm" value={round(crop.x)} readOnly />
                                </div>
                                <div className="col-6 col-md-3">
                                    <label className="form-label text-muted tiny mb-1">{t('video-crop/settings/y')}</label>
                                    <input type="text" className="form-control form-control-sm" value={round(crop.y)} readOnly />
                                </div>
                                <div className="col-6 col-md-3">
                                    <label className="form-label text-muted tiny mb-1">{t('video-crop/settings/width')}</label>
                                    <input type="text" className="form-control form-control-sm" value={round(crop.width)} readOnly />
                                </div>
                                <div className="col-6 col-md-3">
                                    <label className="form-label text-muted tiny mb-1">{t('video-crop/settings/height')}</label>
                                    <input type="text" className="form-control form-control-sm" value={round(crop.height)} readOnly />
                                </div>
                            </div>
                            <div className="small text-muted mt-1">
                                {t('video-crop/message/select_hint')}
                            </div>
                        </div>
                    
</>
) : null}
                </div>
            </div>
            <div className="card-footer">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={onReset} disabled={isProcessing || !crop}>
                        <i className="bi bi-arrow-counterclockwise me-1"></i>
                        {t('video-crop/button/reset')}
                    </button>
                    <button className="btn btn-success" onClick={onCrop} disabled={!canCrop}>
                        {isProcessing ? (
<>

                            <span className="spinner-border spinner-border-sm me-1"></span>
                            {t('video-crop/message/processing')}
                        
</>
) : (
<>

                            <i className="bi bi-crop me-1"></i>
                            {t('video-crop/button/crop')}
                        
</>
)}
                    </button>
                </div>
            </div>
        </div>
    
</>
);
};

export default CropControls;
