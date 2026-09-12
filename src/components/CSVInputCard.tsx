import { useRef, useState } from 'react';
import { t } from '~/helpers/i18n';
import styles from './CSVInputCard.module.css';

const MAX_TABLE_ROWS = 200;

const DELIMITER_OPTIONS = [
    { value: 'auto', key: 'common/csv_input/delimiter/auto' },
    { value: ',', key: 'common/csv_input/delimiter/comma' },
    { value: '\t', key: 'common/csv_input/delimiter/tab' },
    { value: '|', key: 'common/csv_input/delimiter/pipe' },
    { value: ';', key: 'common/csv_input/delimiter/semicolon' },
    { value: 'custom', key: 'common/csv_input/delimiter/custom' },
];

/**
 * Shared CSV input card: upload/paste a CSV list and switch between the raw
 * text and the parsed table view. Parsing stays with the caller — pass the
 * result in via `parsed` ({ headers, rows }) next to the raw `text`.
 */
const CSVInputCard = ({
    text, onTextChange,
    parsed,
    includeHeader, onIncludeHeaderChange,
    delimiter = 'auto', onDelimiterChange,
    customDelimiter = '', onCustomDelimiterChange,
    onLoadExample,
    titleKey = 'common/csv_input/title',
    defaultViewMode = 'table',
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'text' | 'table'>(defaultViewMode as 'text' | 'table');

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
    const displayHeaders = Array.from({ length: columnCount }, (_, i) =>
        String(parsed.headers[i] ?? '').trim() || `#${i + 1}`);
    const tableRows = parsed.rows.slice(0, MAX_TABLE_ROWS);

    return (
<>

        <div className="d-flex gap-2 flex-wrap mb-3">
            <button className="btn btn-sm btn-outline-info" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                {isLoading ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="bi bi-folder2-open me-1"></i>}
                {t('common/csv_input/upload')}
            </button>
            {onLoadExample ? (
                <button className="btn btn-sm btn-outline-info" onClick={onLoadExample}>
                    <i className="bi bi-filetype-csv me-1"></i>{t('common/csv_input/load_example')}
                </button>
            ) : null}
            <button className="btn btn-sm btn-outline-secondary" onClick={() => onTextChange('')} disabled={!text}>
                <i className="bi bi-eraser me-1"></i>{t('common/csv_input/clear')}
            </button>
            <input ref={fileInputRef} type="file" className="d-none" accept=".csv,.tsv,.txt,text/plain,text/csv" onChange={handleFileChange} aria-label={t('common/csv_input/upload')} />
        </div>

        <div className="card overflow-hidden">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{t(titleKey)}</h5>
                {hasData ? (
                    <div className="btn-group btn-group-sm">
                        <button
                            className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setViewMode('table')}
                        >
                            {t('common/csv_input/view/table')}
                        </button>
                        <button
                            className={`btn btn-sm ${viewMode === 'text' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setViewMode('text')}
                        >
                            {t('common/csv_input/view/text')}
                        </button>
                    </div>
                ) : null}
            </div>
            {!hasData || viewMode === 'text' ? (
<>

                <textarea
                    className="form-control border-0 rounded-0 font-monospace"
                    style={{ minHeight: '140px', resize: 'vertical', fontSize: '0.82rem' }}
                    placeholder={t('common/csv_input/placeholder')}
                    value={text}
                    onInput={(e) => onTextChange((e.target as HTMLTextAreaElement).value)}
                ></textarea>

</>
) : (
<>

                <div className={`table-responsive ${styles.scrollArea}`}>
                    <table className="table table-bordered table-striped table-sm mb-0 w-100">
                        <thead className="table-light">
                            <tr>
                                {displayHeaders.map((header, i) => (
                                    <th key={i} className="text-nowrap">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((row, ri) => (
                                <tr key={ri}>
                                    {displayHeaders.map((_, ci) => {
                                        const cell = String(row[ci] ?? '').trim();
                                        return (
                                            <td key={ci} className="font-monospace small">
                                                {cell || <span className="text-muted fst-italic">{t('common/csv_input/view/empty')}</span>}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {parsed.rows.length > MAX_TABLE_ROWS ? (
                    <div className="text-muted px-3 py-2 border-top" style={{ fontSize: '0.82rem' }}>
                        {t('common/csv_input/view/row_limit').replace('{count}', String(MAX_TABLE_ROWS))}
                    </div>
                ) : null}

</>
)
                }
            <div className="card-footer bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                    <label className="mb-0 small" htmlFor="csv-input-delimiter">{t('common/csv_input/delimiter')}</label>
                    <select
                        id="csv-input-delimiter"
                        className="form-select form-select-sm w-auto"
                        value={delimiter}
                        onChange={(e) => onDelimiterChange?.(e.target.value)}
                    >
                        {DELIMITER_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{t(opt.key)}</option>
                        ))}
                    </select>
                    {delimiter === 'custom' ? (
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ width: '72px' }}
                            value={customDelimiter}
                            onInput={(e) => onCustomDelimiterChange?.((e.target as HTMLInputElement).value)}
                            maxLength={5}
                            placeholder="..."
                            aria-label={t('common/csv_input/delimiter/custom')}
                        />
                    ) : null}
                </div>
                <div className="form-check mb-0">
                    <input className="form-check-input" type="checkbox" id="csv-input-include-header" checked={includeHeader} onChange={(e) => onIncludeHeaderChange(e.target.checked)} />
                    <label className="form-check-label" htmlFor="csv-input-include-header">{t('common/csv_input/include_header')}</label>
                </div>
            </div>
        </div>

</>
    );
};

export default CSVInputCard;
