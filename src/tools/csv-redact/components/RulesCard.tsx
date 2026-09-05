import { t } from '~/helpers/i18n';

const SCHEMES = [
    { value: 'full', key: 'csv-redact/scheme/full' },
    { value: 'keep_first', key: 'csv-redact/scheme/keep_first' },
    { value: 'keep_last', key: 'csv-redact/scheme/keep_last' },
    { value: 'middle', key: 'csv-redact/scheme/middle' },
    { value: 'email', key: 'csv-redact/scheme/email' },
    { value: 'phone', key: 'csv-redact/scheme/phone' },
    { value: 'id_card', key: 'csv-redact/scheme/id_card' },
];

const DEFAULT_PARAMS = {
    keep_first: 1,
    keep_last: 1,
    middle: 2,
};

const needsParam = (scheme) => scheme === 'keep_first' || scheme === 'keep_last' || scheme === 'middle';

const RulesCard = ({ rules, setRules, columns, headers, nextRuleId, onRedact, isLarge, isRedacting }) => {
    const columnOptions: any[] = [];
    for (let i = 1; i <= columns; i++) {
        const label = headers[i - 1]
            ? `${t('csv-redact/rules/column')} ${i} (${headers[i - 1]})`
            : `${t('csv-redact/rules/column')} ${i}`;
        columnOptions.push({ value: i, label });
    }

    const addRule = () => {
        const defaultColumn = columns > 0 ? 1 : 1;
        setRules([...rules, {
            id: nextRuleId(),
            column: defaultColumn,
            scheme: 'full',
            param: 0,
        }]);
    };

    const updateRule = (id, patch) => {
        setRules(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    };

    const handleSchemeChange = (id, scheme) => {
        const patch: any = { scheme };
        if (needsParam(scheme)) {
            patch.param = DEFAULT_PARAMS[scheme];
        } else {
            patch.param = 0;
        }
        updateRule(id, patch);
    };

    const removeRule = (id) => {
        setRules(rules.filter((r) => r.id !== id));
    };

    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <span>{t('csv-redact/rules/title')}</span>
                <button className="btn btn-sm btn-primary" onClick={addRule} disabled={columns === 0}>
                    + {t('csv-redact/rules/add')}
                </button>
            </div>
            <div className="card-body">
                {rules.length === 0
                    ? (
<>

                        <div className="text-muted text-center py-3">
                            {columns === 0
                                ? t('csv-redact/output/no_data')
                                : t('csv-redact/rules/empty')}
                        </div>
                    
</>
)
                    : (
<>

                        <div className="row g-2 align-items-end mb-2 d-none d-md-flex">
                            <div className="col-md-4">
                                <label className="form-label small mb-0 fw-bold">{t('csv-redact/rules/column')}</label>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small mb-0 fw-bold">{t('csv-redact/rules/scheme')}</label>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small mb-0 fw-bold">{t('csv-redact/rules/param')}</label>
                            </div>
                            <div className="col-md-1"></div>
                        </div>
                        {rules.map((rule) => (
                            <div key={rule.id} className="row g-2 align-items-end mb-2">
                                <div className="col-md-4">
                                    <select className="form-select form-select-sm" value={rule.column} onChange={(e) => updateRule(rule.id, { column: Number(e.target.value) })}>
                                        {columnOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <select className="form-select form-select-sm" value={rule.scheme} onChange={(e) => handleSchemeChange(rule.id, e.target.value)}>
                                        {SCHEMES.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{t(opt.key)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    {needsParam(rule.scheme) ? (
<>

                                        <input type="number" className="form-control form-control-sm" min={0} max={99} value={rule.param} onInput={(e) => updateRule(rule.id, { param: Number((e.target as HTMLInputElement).value) })} />
                                    
</>
) : (
<>
<div className="form-control form-control-sm bg-light text-muted text-center" {...({ disabled: true } as any)}>-</div>
</>
)}
                                </div>
                                <div className="col-md-1">
                                    <button className="btn btn-sm btn-outline-danger w-100" title={t('csv-redact/rules/remove')} onClick={() => removeRule(rule.id)}>\u00D7</button>
                                </div>
                            </div>
                        ))}
                    
</>
)
                }
            </div>
            <div className="card-footer bg-light">
                {isLarge ? (
<>

                    <div className="alert alert-info small py-2 px-3 mb-2">
                        {t('csv-redact/message/large_data_hint')}
                    </div>
                
</>
) : null}
                <button className="btn btn-primary w-100" onClick={onRedact} disabled={columns === 0 || isRedacting}>
                    {isRedacting ? (
<>
<span className="spinner-border spinner-border-sm me-2"></span>
</>
) : null}
                    {t('csv-redact/button/redact')}
                </button>
            </div>
        </div>
    
</>
);
};

export default RulesCard;
