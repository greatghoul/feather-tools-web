import { t } from '~/helpers/i18n';

const InputCard = ({ text, onTextChange, onClear, onLoadExample, onAnalyze, options, updateOption }) => {
    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <span>{t('text-frequency/input/title')}</span>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-info" onClick={onLoadExample}>
                        <i className="bi bi-file-earmark-text"></i> {t('text-frequency/button/load_example')}
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={onClear}>
                        {t('text-frequency/button/clear')}
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                <textarea className="form-control border-0" style={{ minHeight: '200px', resize: 'vertical' }} placeholder={t('text-frequency/input/placeholder')} value={text} onInput={(e) => onTextChange((e.target as HTMLInputElement).value)}></textarea>
            </div>
            <div className="card-footer bg-light">
                <div className="row g-3 align-items-end">
                    <div className="col-md-2">
                        <label className="form-label small mb-1">{t('text-frequency/options/min_length')}</label>
                        <input type="number" className="form-control form-control-sm" value={options.minLength} onInput={(e) => updateOption('minLength', parseInt((e.target as HTMLInputElement).value) || 1)} min="1" />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small mb-1">{t('text-frequency/options/sort_by')}</label>
                        <select className="form-select form-select-sm" value={options.sortBy} onChange={(e) => updateOption('sortBy', e.target.value)}>
                            <option value="frequency">{t('text-frequency/options/sort_by_frequency')}</option>
                            <option value="alphabetical">{t('text-frequency/options/sort_by_alphabetical')}</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small mb-1">{t('text-frequency/options/sort_order')}</label>
                        <select className="form-select form-select-sm" value={options.sortOrder} onChange={(e) => updateOption('sortOrder', e.target.value)}>
                            <option value="descending">{t('text-frequency/options/descending')}</option>
                            <option value="ascending">{t('text-frequency/options/ascending')}</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small mb-1">{t('text-frequency/options/limit')}</label>
                        <select className="form-select form-select-sm" value={options.limit} onChange={(e) => updateOption('limit', parseInt(e.target.value))}>
                            <option value="0">{t('text-frequency/options/all_words')}</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <button className="btn btn-primary w-100" onClick={onAnalyze}>
                            <i className="bi bi-graph-up"></i> {t('text-frequency/button/analyze')}
                        </button>
                    </div>
                </div>
                <div className="row g-3 mt-2">
                    <div className="col-auto">
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" role="switch" id="case-sensitive-switch" checked={options.caseSensitive} onChange={(e) => updateOption('caseSensitive', e.target.checked)} />
                            <label className="form-check-label small" htmlFor="case-sensitive-switch">
                                {t('text-frequency/options/case_sensitive')}
                            </label>
                        </div>
                    </div>
                    <div className="col-auto">
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" role="switch" id="ignore-numbers-switch" checked={options.ignoreNumbers} onChange={(e) => updateOption('ignoreNumbers', e.target.checked)} />
                            <label className="form-check-label small" htmlFor="ignore-numbers-switch">
                                {t('text-frequency/options/ignore_numbers')}
                            </label>
                        </div>
                    </div>
                    <div className="col-auto">
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" role="switch" id="ignore-stopwords-switch" checked={options.ignoreStopwords} onChange={(e) => updateOption('ignoreStopwords', e.target.checked)} />
                            <label className="form-check-label small" htmlFor="ignore-stopwords-switch">
                                {t('text-frequency/options/ignore_stopwords')}
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    
</>
);
};

export default InputCard;
