import { t } from '~/helpers/i18n';

const InputCard = ({ text, onTextChange, onClear, onLoadExample, onExtract, options, onOptionChange }) => {
    const handleCheckboxChange = (key) => (e) => {
        onOptionChange(key, e.target.checked);
    };

    const handleCustomCheckbox = (e) => {
        onOptionChange('enableCustom', e.target.checked);
        if (!e.target.checked) {
            onOptionChange('customPattern', '');
        }
    };

    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <span>{t('text-extract/input/title')}</span>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-info" onClick={onLoadExample}>
                        {t('text-extract/button/load_example')}
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={onClear}>
                        {t('text-extract/button/clear')}
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                <textarea className="form-control border-0" style={{ minHeight: '200px', resize: 'vertical' }} placeholder={t('text-extract/input/placeholder')} value={text} onInput={(e) => onTextChange((e.target as HTMLInputElement).value)}></textarea>
            </div>
            <div className="card-footer bg-light">
                <div className="row g-3">
                    <div className="col-12">
                        <label className="form-label small mb-2 fw-bold">{t('text-extract/options/types')}</label>
                        <div className="row g-2">
                            <div className="col-6 col-md-4 col-lg-3">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="opt-email" checked={options.email} onChange={handleCheckboxChange('email')} />
                                    <label className="form-check-label" htmlFor="opt-email">
                                        {t('text-extract/options/email')}
                                    </label>
                                </div>
                            </div>
                            <div className="col-6 col-md-4 col-lg-3">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="opt-phone" checked={options.phone} onChange={handleCheckboxChange('phone')} />
                                    <label className="form-check-label" htmlFor="opt-phone">
                                        {t('text-extract/options/phone')}
                                    </label>
                                </div>
                            </div>
                            <div className="col-6 col-md-4 col-lg-3">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="opt-idcard" checked={options.idCard} onChange={handleCheckboxChange('idCard')} />
                                    <label className="form-check-label" htmlFor="opt-idcard">
                                        {t('text-extract/options/id_card')}
                                    </label>
                                </div>
                            </div>
                            <div className="col-6 col-md-4 col-lg-3">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="opt-url" checked={options.url} onChange={handleCheckboxChange('url')} />
                                    <label className="form-check-label" htmlFor="opt-url">
                                        {t('text-extract/options/url')}
                                    </label>
                                </div>
                            </div>
                            <div className="col-6 col-md-4 col-lg-3">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="opt-ip" checked={options.ip} onChange={handleCheckboxChange('ip')} />
                                    <label className="form-check-label" htmlFor="opt-ip">
                                        {t('text-extract/options/ip')}
                                    </label>
                                </div>
                            </div>
                            <div className="col-6 col-md-4 col-lg-3">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="opt-custom" checked={options.enableCustom} onChange={handleCustomCheckbox} />
                                    <label className="form-check-label" htmlFor="opt-custom">
                                        {t('text-extract/options/custom')}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    {options.enableCustom ? (
<>

                        <div className="col-12">
                            <input type="text" className="form-control form-control-sm" placeholder={t('text-extract/options/custom_placeholder')} value={options.customPattern} onInput={(e) => onOptionChange('customPattern', (e.target as HTMLInputElement).value)} />
                        </div>
                    
</>
) : ''}
                    <div className="col-12">
                        <button className="btn btn-primary w-100" onClick={onExtract}>
                            {t('text-extract/button/extract')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    
</>
);
};

export default InputCard;
