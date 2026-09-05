import { t } from '~/helpers/i18n';

const InputCard = ({ text, onTextChange, onClear, onLoadExample, onTruncate, maxLength, setMaxLength, ellipsis, setEllipsis }) => {
    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <span>{t('text-truncate/input/title')}</span>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-info" onClick={onLoadExample}>
                        {t('text-truncate/button/load_example')}
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={onClear}>
                        {t('text-truncate/button/clear')}
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                <textarea className="form-control border-0" style={{ minHeight: '200px', resize: 'vertical' }} placeholder={t('text-truncate/input/placeholder')} value={text} onInput={(e) => onTextChange((e.target as HTMLInputElement).value)}></textarea>
            </div>
            <div className="card-footer bg-light">
                <div className="row g-3 align-items-end">
                    <div className="col-md-4">
                        <label className="form-label small mb-1">{t('text-truncate/options/max_length')}</label>
                        <input type="number" className="form-control form-control-sm" value={maxLength} min="1" max="9999" onInput={(e) => setMaxLength(parseInt((e.target as HTMLInputElement).value) || 1)} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small mb-1">{t('text-truncate/options/ellipsis')}</label>
                        <input type="text" className="form-control form-control-sm" value={ellipsis} maxLength={10} onInput={(e) => setEllipsis((e.target as HTMLInputElement).value)} />
                    </div>
                    <div className="col-md-4">
                        <button className="btn btn-primary w-100" onClick={onTruncate}>
                            {t('text-truncate/button/truncate')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    
</>
);
};

export default InputCard;
