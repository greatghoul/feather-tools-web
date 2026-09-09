import { useRef, useState } from 'react';
import { t } from '~/helpers/i18n';
import type { ParsedCsv, FieldRole } from '../services/SheetService';

const ROLE_OPTIONS: { value: FieldRole; key: string }[] = [
    { value: 'name', key: 'sign-in-sheet/role/name' },
    { value: 'phone', key: 'sign-in-sheet/role/phone' },
    { value: 'email', key: 'sign-in-sheet/role/email' },
    { value: 'extra', key: 'sign-in-sheet/role/extra' },
    { value: 'ignore', key: 'sign-in-sheet/role/ignore' },
];

const CsvImportCard = ({
    csvText, onTextChange,
    includeHeader, onIncludeHeaderChange,
    parsed, roles, onRolesChange,
    onLoadExample,
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = (ev) => {
            onTextChange(String(ev.target?.result ?? ''));
            setIsLoading(false);
        };
        reader.onerror = () => setIsLoading(false);
        reader.readAsText(file);

        e.target.value = '';
    };

    const columnCount = Math.max(parsed.headers.length, parsed.rows[0]?.length ?? 0);
    const hasData = columnCount > 0 || parsed.rows.length > 0;
    const samples = parsed.rows[0] ?? [];

    return (
<>

        <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{t('sign-in-sheet/csv/card_title')}</h5>
                <button className="btn btn-sm invisible" tabIndex={-1}>&nbsp;</button>
            </div>
            <div className="card-body">
                <div className="d-flex gap-2 mb-2 flex-wrap">
                    <button className="btn btn-sm btn-outline-info" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                        {isLoading ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="bi bi-upload me-1"></i>}
                        {t('sign-in-sheet/csv/upload')}
                    </button>
                    <button className="btn btn-sm btn-outline-info" onClick={onLoadExample}>
                        <i className="bi bi-filetype-csv me-1"></i>{t('sign-in-sheet/csv/load_example')}
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => onTextChange('')} disabled={!csvText}>
                        {t('sign-in-sheet/csv/clear')}
                    </button>
                    <input ref={fileInputRef} type="file" className="d-none" accept=".csv,.tsv,.txt,text/plain,text/csv" onChange={handleFileChange} aria-label={t('sign-in-sheet/csv/upload')} />
                </div>

                <textarea
                    className="form-control font-monospace"
                    style={{ minHeight: '140px', resize: 'vertical', fontSize: '0.82rem' }}
                    placeholder={t('sign-in-sheet/csv/placeholder')}
                    value={csvText}
                    onInput={(e) => onTextChange((e.target as HTMLTextAreaElement).value)}
                ></textarea>

                <div className="form-check mt-2">
                    <input className="form-check-input" type="checkbox" id="sisIncludeHeader" checked={includeHeader} onChange={(e) => onIncludeHeaderChange(e.target.checked)} />
                    <label className="form-check-label" htmlFor="sisIncludeHeader">{t('sign-in-sheet/csv/include_header')}</label>
                </div>

                {hasData ? (
<>

                    <hr />
                    <h6 className="mb-2">{t('sign-in-sheet/csv/mapping_title')}</h6>
                    <p className="text-muted mb-2" style={{ fontSize: '0.82rem' }}>{t('sign-in-sheet/csv/mapping_hint')}</p>
                    <div>
                        {Array.from({ length: columnCount }, (_, i) => {
                            const header = String(parsed.headers[i] ?? '').trim();
                            const label = header || `#${i + 1}`;
                            const sample = String(samples[i] ?? '').trim();
                            return (
                                <div key={i} className="d-flex align-items-center gap-2 mb-1">
                                    <div className="flex-grow-1 text-truncate" title={label}>
                                        <span className="small fw-bold">{i + 1}. {label}</span>
                                        {sample ? <span className="text-muted ms-2 small">{sample}</span> : null}
                                    </div>
                                    <select
                                        className="form-select form-select-sm"
                                        style={{ width: 'auto', minWidth: '108px' }}
                                        value={roles[i] ?? 'extra'}
                                        onChange={(e) => onRolesChange(i, e.target.value as FieldRole)}
                                        aria-label={`${t('sign-in-sheet/csv/mapping_title')}: ${label}`}
                                    >
                                        {ROLE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{t(opt.key)}</option>
                                        ))}
                                    </select>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-muted mt-2" style={{ fontSize: '0.82rem' }}>
                        {t('sign-in-sheet/csv/rows_count').replace('{count}', String(parsed.rows.length))}
                    </div>
                
</>
) : (
<>

                    <div className="text-muted mt-2" style={{ fontSize: '0.82rem' }}>{t('sign-in-sheet/csv/no_data')}</div>
                
</>
)
                }
            </div>
        </div>

</>
    );
};

export default CsvImportCard;
