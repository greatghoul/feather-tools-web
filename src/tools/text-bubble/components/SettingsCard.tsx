import { t } from '~/helpers/i18n';

const ARROWS = [
    { value: 'up-left', icon: '\u21d6' },
    { value: 'up', icon: '\u2191' },
    { value: 'up-right', icon: '\u21d7' },
    { value: 'left', icon: '\u2190' },
    { value: 'none', icon: '\u25cb' },
    { value: 'right', icon: '\u2192' },
    { value: 'down-left', icon: '\u21d9' },
    { value: 'down', icon: '\u2193' },
    { value: 'down-right', icon: '\u21d8' },
];

const SettingsCard = ({ arrow, onArrowChange, onGenerate }) => {
    return (
<>

        <div className="card">
            <div className="card-header bg-light">
                <h5 className="mb-0">{t('text-bubble/options/arrow')}</h5>
            </div>
            <div className="card-body">
                <div className="mb-3">
                    <div className="row g-1" style={{ maxWidth: '240px' }}>
                        {ARROWS.map(a => (
                            <div className="col-4 p-1" key={a.value}>
                                <input className="btn-check" type="radio" name="arrowDirection" id={`arrow-${a.value}`} value={a.value} checked={arrow === a.value} onChange={() => onArrowChange(a.value)} />
                                <label className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center" htmlFor={`arrow-${a.value}`} title={a.value} style={{ height: '40px', fontSize: '16px' }}>
                                    {a.icon}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="btn btn-primary" onClick={onGenerate}>{t('text-bubble/button/generate')}</button>
            </div>
        </div>
    
</>
);
};

export default SettingsCard;
