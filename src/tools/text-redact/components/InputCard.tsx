import { t } from '~/helpers/i18n';

const InputCard = ({ text, onTextChange, onClear, onLoadExample, onRedact, options, onOptionChange }) => {
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
                <span>{t('text-redact/input/title')}</span>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-info" onClick={onLoadExample}>
                        {t('text-redact/button/load_example')}
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={onClear}>
                        {t('text-redact/button/clear')}
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                <textarea className="form-control border-0" style={{ minHeight: '200px', resize: 'vertical' }} placeholder={t('text-redact/input/placeholder')} value={text} onInput={(e) => onTextChange((e.target as HTMLTextAreaElement).value)}></textarea>
            </div>
            <div className="card-footer bg-light">
                <div className="row g-3">
                    <div className="col-12">
                        <label className="form-label small mb-2 fw-bold">{t('text-redact/options/replacement')}</label>
                        <div className="d-flex gap-3">
                            <div className="form-check">
                                <input className="form-check-input" type="radio" id="repl-asterisk" checked={options.replacement === 'asterisk'} onChange={() => onOptionChange('replacement', 'asterisk')} />
                                <label className="form-check-label" htmlFor="repl-asterisk">
                                    {t('text-redact/options/replacement_asterisk')}
                                </label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" id="repl-redacted" checked={options.replacement === 'redacted'} onChange={() => onOptionChange('replacement', 'redacted')} />
                                <label className="form-check-label" htmlFor="repl-redacted">
                                    {t('text-redact/options/replacement_redacted')}
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="col-12">
                        <label className="form-label small mb-2 fw-bold">{t('text-redact/options/types')}</label>
                        <div className="row g-2">
                            <div className="col-6 col-md-4 col-lg-3">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="opt-email" checked={options.email} onChange={handleCheckboxChange('email')} />
                                    <label className="form-check-label" htmlFor="opt-email">
                                        {t('text-redact/options/email')}
                                    </label>
                                </div>
                            </div>
                            <div className="col-6 col-md-4 col-lg-3">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="opt-phone" checked={options.phone} onChange={handleCheckboxChange('phone')} />
                                    <label className="form-check-label" htmlFor="opt-phone">
                                        {t('text-redact/options/phone')}
                                    </label>
                                </div>
                            </div>
                            <div className="col-6 col-md-4 col-lg-3">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="opt-idcard" checked={options.idCard} onChange={handleCheckboxChange('idCard')} />
                                    <label className="form-check-label" htmlFor="opt-idcard">
                                        {t('text-redact/options/id_card')}
                                    </label>
                                </div>
                            </div>
                            <div className="col-6 col-md-4 col-lg-3">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="opt-url" checked={options.url} onChange={handleCheckboxChange('url')} />
                                    <label className="form-check-label" htmlFor="opt-url">
                                        {t('text-redact/options/url')}
                                    </label>
                                </div>
                            </div>
                            <div className="col-6 col-md-4 col-lg-3">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="opt-ip" checked={options.ip} onChange={handleCheckboxChange('ip')} />
                                    <label className="form-check-label" htmlFor="opt-ip">
                                        {t('text-redact/options/ip')}
                                    </label>
                                </div>
                            </div>
                            <div className="col-6 col-md-4 col-lg-3">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="opt-custom" checked={options.enableCustom} onChange={handleCustomCheckbox} />
                                    <label className="form-check-label" htmlFor="opt-custom">
                                        {t('text-redact/options/custom')}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    {options.enableCustom ? (
<>

                        <div className="col-12">
                            <input type="text" className="form-control form-control-sm" placeholder={t('text-redact/options/custom_placeholder')} value={options.customPattern} onInput={(e) => onOptionChange('customPattern', (e.target as HTMLInputElement).value)} />
                        </div>
                    
</>
) : ''}
                    <div className="col-12">
                        <button className="btn btn-primary w-100" onClick={onRedact}>
                            {t('text-redact/button/redact')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    
</>
);
};

export default InputCard;
