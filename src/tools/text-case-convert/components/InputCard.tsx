import { t } from '~/helpers/i18n';

const CASE_OPTIONS = [
    { value: 'uppercase', label: t('text-case-convert/options/uppercase') },
    { value: 'lowercase', label: t('text-case-convert/options/lowercase') },
    { value: 'title_case', label: t('text-case-convert/options/title_case') },
    { value: 'capitalize', label: t('text-case-convert/options/capitalize') },
    { value: 'sentence_case', label: t('text-case-convert/options/sentence_case') },
    { value: 'camel_case', label: t('text-case-convert/options/camel_case') },
    { value: 'pascal_case', label: t('text-case-convert/options/pascal_case') },
    { value: 'kebab_case', label: t('text-case-convert/options/kebab_case') },
    { value: 'snake_case', label: t('text-case-convert/options/snake_case') },
    { value: 'invert_case', label: t('text-case-convert/options/invert_case') },
    { value: 'alternating_case', label: t('text-case-convert/options/alternating_case') },
];

const InputCard = ({ text, onTextChange, onClear, onLoadExample, onConvert, caseType, setCaseType }) => {
    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <span>{t('text-case-convert/input/title')}</span>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-info" onClick={onLoadExample}>
                        Example
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={onClear}>
                        {t('text-case-convert/button/clear')}
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                <textarea className="form-control border-0" style={{ minHeight: '200px', resize: 'vertical' }} placeholder={t('text-case-convert/input/placeholder')} value={text} onInput={(e) => onTextChange((e.target as HTMLInputElement).value)}></textarea>
            </div>
            <div className="card-footer bg-light">
                <div className="row g-3 align-items-end">
                    <div className="col-md-6">
                        <label className="form-label small mb-1">{t('text-case-convert/options/convert_to')}</label>
                        <select className="form-select form-select-sm" value={caseType} onChange={(e) => setCaseType(e.target.value)}>
                            {CASE_OPTIONS.map(opt => (
<>

                                <option value={opt.value}>{opt.label}</option>
                            
</>
))}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <button className="btn btn-primary w-100" onClick={onConvert}>
                            {t('text-case-convert/button/convert')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    
</>
);
};

export default InputCard;
