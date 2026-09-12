import { t } from '~/helpers/i18n';
import type { ParsedCsv, FieldRole } from '../services/SheetService';

const ROLE_OPTIONS: { value: FieldRole; key: string }[] = [
    { value: 'name', key: 'sign-in-sheet/role/name' },
    { value: 'phone', key: 'sign-in-sheet/role/phone' },
    { value: 'email', key: 'sign-in-sheet/role/email' },
    { value: 'extra', key: 'sign-in-sheet/role/extra' },
    { value: 'ignore', key: 'sign-in-sheet/role/ignore' },
];

const FieldMappingCard = ({ parsed, roles, onRolesChange }) => {
    const columnCount = Math.max(parsed.headers.length, parsed.rows[0]?.length ?? 0);
    const samples = parsed.rows[0] ?? [];

    return (
<>

        <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{t('sign-in-sheet/csv/mapping_title')}</h5>
                <button className="btn btn-sm invisible" tabIndex={-1}>&nbsp;</button>
            </div>
            <div className="card-body">
                <p className="text-muted mb-2" style={{ fontSize: '0.82rem' }}>{t('sign-in-sheet/csv/mapping_hint')}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', columnGap: '1.5rem', rowGap: '0.5rem' }}>
                    {Array.from({ length: columnCount }, (_, i) => {
                        const header = String(parsed.headers[i] ?? '').trim();
                        const label = header || `#${i + 1}`;
                        const sample = String(samples[i] ?? '').trim();
                        return (
                            <div key={i} className="d-flex align-items-center gap-2">
                                <div className="flex-grow-1 text-truncate" title={label}>
                                    <span className="small fw-bold">{i + 1}. {label}</span>
                                    {sample ? <span className="text-muted ms-2 small">{sample}</span> : null}
                                </div>
                                <select
                                    className="form-select form-select-sm"
                                    style={{ flex: '0 0 128px' }}
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
            </div>
        </div>

</>
    );
};

export default FieldMappingCard;
