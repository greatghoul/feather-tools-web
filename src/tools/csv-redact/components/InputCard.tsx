import { useState, useRef } from 'react';
import { t } from '~/helpers/i18n';
import MaskService from '../services/MaskService';

const DELIMITER_OPTIONS = [
    { value: ',', key: 'csv-redact/options/comma' },
    { value: '\t', key: 'csv-redact/options/tab' },
    { value: '|', key: 'csv-redact/options/pipe' },
    { value: ';', key: 'csv-redact/options/semicolon' },
    { value: 'custom', key: 'csv-redact/options/custom' },
];

const InputCard = ({
    text, onTextChange, onClear, onLoadExample,
    delimiter, setDelimiter, customDelimiter, setCustomDelimiter,
    includeHeader, setIncludeHeader,
    inputViewMode, setInputViewMode,
    parsedData, maskedColumnIndices,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const loadingRef = useRef(false);

    const handleOpenFileClick = () => {
        if (loadingRef.current) return;
        document.getElementById('csv-redact-file-upload')!.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        loadingRef.current = true;
        setIsLoading(true);

        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = (ev.target as FileReader).result;
            onTextChange(content);
            const detected = MaskService.detectDelimiter(content);
            setDelimiter(detected);
            loadingRef.current = false;
            setIsLoading(false);
        };
        reader.onerror = () => {
            loadingRef.current = false;
            setIsLoading(false);
        };
        reader.readAsText(file);

        e.target.value = '';
    };

    const displayHeaders = parsedData.columns > 0
        ? (parsedData.headers.length > 0
            ? parsedData.headers
            : Array.from({ length: parsedData.columns }, (_, i) => `${i + 1}`))
        : [];

    const isMaskedCol = (idx) => maskedColumnIndices.includes(idx);

    const hasData = parsedData.rows.length > 0 || parsedData.headers.length > 0;

    return (
<>

        <div className="d-flex gap-2 mb-2 flex-wrap">
            <button className="btn btn-sm btn-outline-info" onClick={handleOpenFileClick} disabled={isLoading}>
                {isLoading ? (
<>
<span className="spinner-border spinner-border-sm me-1"></span>
</>
) : null}
                {t('csv-redact/button/upload')}
            </button>
            <input type="file" id="csv-redact-file-upload" className="d-none" accept=".csv,.tsv,.txt,text/plain" onChange={handleFileChange} />
            <button className="btn btn-sm btn-outline-info" onClick={onLoadExample}>
                {t('csv-redact/button/load_example')}
            </button>
        </div>
        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span>{t('csv-redact/input/title')}</span>
                <div className="d-flex gap-2 flex-wrap justify-content-end">
                    <div className="btn-group btn-group-sm">
                        <button className={`btn btn-sm ${inputViewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setInputViewMode('table')} disabled={!text.trim()}>{t('csv-redact/view/table')}</button>
                        <button className={`btn btn-sm ${inputViewMode === 'text' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setInputViewMode('text')}>{t('csv-redact/view/text')}</button>
                    </div>
                    <button className="btn btn-sm btn-outline-secondary" onClick={onClear}>
                        {t('csv-redact/button/clear')}
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                {inputViewMode === 'text'
                    ? (
<>

                        <textarea className="form-control border-0" style={{ minHeight: '200px', resize: 'vertical', fontFamily: 'monospace' }} placeholder={t('csv-redact/input/placeholder')} value={text} onInput={(e) => onTextChange((e.target as HTMLInputElement).value)}></textarea>
                    
</>
)
                    : (
<>

                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table className="table table-bordered table-striped table-sm mb-0">
                                {hasData ? (
<>

                                    <thead className="table-light">
                                        <tr>
                                            {displayHeaders.map((h, i) => (
                                                <th key={i} className={`text-nowrap ${isMaskedCol(i) ? 'csv-redact-masked-col' : ''}`}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                
</>
) : null}
                                <tbody>
                                    {parsedData.rows.length > 0
                                        ? parsedData.rows.map((row, i) => (
                                            <tr key={i}>
                                                {row.map((cell, ci) => (
                                                    <td key={ci} className={`font-monospace small ${isMaskedCol(ci) ? 'csv-redact-masked-col' : ''}`} style={{ whiteSpace: 'pre-wrap', maxWidth: '240px', overflowX: 'auto' }}>
                                                        {cell !== '' ? cell : (
<>
<span className="text-muted fst-italic">{t('csv-redact/view/empty')}</span>
</>
)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                        : (
<>

                                            <tr>
                                                <td className="text-muted text-center p-3">{t('csv-redact/output/no_data')}</td>
                                            </tr>
                                        
</>
)
                                    }
                                </tbody>
                            </table>
                        </div>
                    
</>
)
                }
            </div>
            <div className="card-footer bg-light">
                <div className="row g-3 align-items-end">
                    <div className="col-md-4">
                        <label className="form-label small mb-1">{t('csv-redact/options/delimiter')}</label>
                        <select className="form-select form-select-sm" value={delimiter} onChange={(e) => setDelimiter(e.target.value)}>
                            {DELIMITER_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{t(opt.key)}</option>
                            ))}
                        </select>
                        {delimiter === 'custom' ? (
<>

                            <input type="text" className="form-control form-control-sm mt-1" value={customDelimiter} onInput={(e) => setCustomDelimiter((e.target as HTMLInputElement).value)} maxLength={5} placeholder="..." />
                        
</>
) : null}
                    </div>
                    <div className="col-md-4 d-flex align-items-center">
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="csv-include-header" checked={includeHeader} onChange={(e) => setIncludeHeader(e.target.checked)} />
                            <label className="form-check-label small" htmlFor="csv-include-header">
                                {t('csv-redact/options/include_header')}
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
