import { useState, useEffect, useRef } from 'react';
import { t } from '~/helpers/i18n';
import ColumnExtractorService from '../services/ColumnExtractorService';

const DELIMITER_OPTIONS = [
    { value: ',', key: 'text-column-extractor/options/comma' },
    { value: '\t', key: 'text-column-extractor/options/tab' },
    { value: '|', key: 'text-column-extractor/options/pipe' },
    { value: ';', key: 'text-column-extractor/options/semicolon' },
    { value: 'custom', key: 'text-column-extractor/options/custom' },
];

const TagsInput = ({ selectedColumns, setSelectedColumns, totalColumns, previewHeaders }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [focusIndex, setFocusIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const availableOptions: any[] = [];
    for (let i = 1; i <= totalColumns; i++) {
        if (!selectedColumns.includes(i)) {
            const label = previewHeaders[i - 1]
                ? `Column ${i} (${previewHeaders[i - 1]})`
                : `Column ${i}`;
            availableOptions.push({ value: i, label });
        }
    }

    const handleAdd = (col) => {
        const next = [...selectedColumns, col];
        setSelectedColumns(next);
        setIsOpen(false);
        setFocusIndex(-1);
    };

    const handleRemove = (col) => {
        setSelectedColumns(selectedColumns.filter((c) => c !== col));
    };

    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsOpen(true);
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                setFocusIndex((prev) => Math.min(prev + 1, availableOptions.length - 1));
                e.preventDefault();
                break;
            case 'ArrowUp':
                setFocusIndex((prev) => Math.max(prev - 1, 0));
                e.preventDefault();
                break;
            case 'Enter':
                if (focusIndex >= 0 && focusIndex < availableOptions.length) {
                    handleAdd(availableOptions[focusIndex].value);
                }
                e.preventDefault();
                break;
            case 'Escape':
                setIsOpen(false);
                setFocusIndex(-1);
                e.preventDefault();
                break;
        }
    };

    const getTagLabel = (col) => {
        if (previewHeaders[col - 1]) {
            return `${col}: ${previewHeaders[col - 1]}`;
        }
        return `Column ${col}`;
    };

    return (
<>

        <div className="tags-input" ref={dropdownRef} style={{ position: 'relative' }}>
            <div className="form-control form-control-sm d-flex flex-wrap gap-1 align-items-center" style={{ minHeight: 'calc(1.5em + 0.5rem + 2px)', cursor: 'text', padding: '0.2rem 0.4rem' }} onClick={() => setIsOpen(true)} onKeyDown={handleKeyDown} tabIndex={0} role="combobox" aria-expanded={isOpen}>
                {selectedColumns.length === 0
                    ? (
<>
<span className="text-muted small">{t('text-column-extractor/options/columns_placeholder')}</span>
</>
)
                    : selectedColumns.map((col) => (
<>

                        <span className="badge bg-primary d-inline-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
                            {getTagLabel(col)}
                            <span className="tag-remove" onClick={(e) => { e.stopPropagation(); handleRemove(col); }} style={{ cursor: 'pointer', opacity: '0.7', lineHeight: '1' }}>\u00D7</span>
                        </span>
                    
</>
))
                }
            </div>
            {isOpen && availableOptions.length > 0 ? (
<>

                <div className="list-group shadow-sm" style={{ position: 'absolute', top: '100%', left: '0', right: '0', zIndex: '100', maxHeight: '200px', overflowY: 'auto' }}>
                    {availableOptions.map((opt, idx) => (
<>

                        <button className={`list-group-item list-group-item-action py-1 px-2 small ${idx === focusIndex ? 'active' : ''}`} onClick={() => handleAdd(opt.value)} onMouseEnter={() => setFocusIndex(idx)}>{opt.label}</button>
                    
</>
))}
                </div>
            
</>
) : null}
            {isOpen && availableOptions.length === 0 ? (
<>

                <div className="list-group shadow-sm" style={{ position: 'absolute', top: '100%', left: '0', right: '0', zIndex: '100' }}>
                    <div className="list-group-item py-1 px-2 small text-muted">
                        {t('text-column-extractor/view/all_selected')}
                    </div>
                </div>
            
</>
) : null}
        </div>
    
</>
);
};

const InputCard = ({ text, onTextChange, onClear, onLoadExample, onExtract, delimiter, setDelimiter, customDelimiter, setCustomDelimiter, selectedColumns, setSelectedColumns, includeHeader, setIncludeHeader, inputViewMode, setInputViewMode, previewData, previewHeaders }) => {
    const handleOpenFileClick = () => {
        document.getElementById('column-extractor-file-upload')!.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = (ev.target as FileReader).result;
            onTextChange(content);
            const detected = ColumnExtractorService.detectDelimiter(content);
            setDelimiter(detected);
        };
        reader.readAsText(file);

        e.target.value = '';
    };

    return (
<>

        <div className="d-flex gap-2 mb-2 flex-wrap">
            <button className="btn btn-sm btn-outline-info" onClick={handleOpenFileClick}>
                {t('text-column-extractor/button/upload')}
            </button>
            <input type="file" id="column-extractor-file-upload" className="d-none" accept=".csv,.tsv,.txt,text/plain" onChange={handleFileChange} />
            <button className="btn btn-sm btn-outline-info" onClick={onLoadExample}>
                {t('text-column-extractor/button/load_example')}
            </button>
        </div>
        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span>{t('text-column-extractor/input/title')}</span>
                <div className="d-flex gap-2 flex-wrap justify-content-end">
                    <div className="btn-group btn-group-sm">
                        <button className={`btn btn-sm ${inputViewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setInputViewMode('table')} disabled={!text.trim()}>{t('text-column-extractor/view/table')}</button>
                        <button className={`btn btn-sm ${inputViewMode === 'text' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setInputViewMode('text')}>{t('text-column-extractor/view/text')}</button>
                    </div>
                    <button className="btn btn-sm btn-outline-secondary" onClick={onClear}>
                        {t('text-column-extractor/button/clear')}
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                {inputViewMode === 'text'
                    ? (
<>

                        <textarea className="form-control border-0" style={{ minHeight: '200px', resize: 'vertical', fontFamily: 'monospace' }} placeholder={t('text-column-extractor/input/placeholder')} value={text} onInput={(e) => onTextChange((e.target as HTMLInputElement).value)}></textarea>
                    
</>
)
                    : (
<>

                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table className="table table-bordered table-striped table-sm mb-0">
                                <tbody>
                                    {previewData.rows.length > 0
                                        ? previewData.rows.map((row) => (
<>

                                            <tr>
                                                {row.map((cell, ci) => (
<>

                                                    <td className={`font-monospace small ${ci < previewData.columns ? '' : 'text-muted'}`} style={{ whiteSpace: 'pre-wrap', maxWidth: '200px', overflowX: 'auto' }}>
                                                        {cell || (
<>
<span className="text-muted fst-italic">{t('text-column-extractor/view/empty')}</span>
</>
)}
                                                    </td>
                                                
</>
))}
                                            </tr>
                                        
</>
))
                                        : (
<>

                                            <tr>
                                                <td className="text-muted text-center p-3">{t('text-column-extractor/output/no_data')}</td>
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
                <div className="row g-3">
                    <div className="col-12">
                        <label className="form-label small mb-1">{t('text-column-extractor/options/columns')}</label>
                        <TagsInput selectedColumns={selectedColumns} setSelectedColumns={setSelectedColumns} totalColumns={previewData.columns} previewHeaders={previewHeaders} />
                    </div>
                </div>
                <div className="row g-3 mt-1">
                    <div className="col-md-4">
                        <label className="form-label small mb-1">{t('text-column-extractor/options/delimiter')}</label>
                        <select className="form-select form-select-sm" value={delimiter} onChange={(e) => setDelimiter(e.target.value)}>
                            {DELIMITER_OPTIONS.map((opt) => (
<>

                                <option value={opt.value}>{t(opt.key)}</option>
                            
</>
))}
                        </select>
                        {delimiter === 'custom' ? (
<>

                            <input type="text" className="form-control form-control-sm mt-1" value={customDelimiter} onInput={(e) => setCustomDelimiter((e.target as HTMLInputElement).value)} maxLength={5} placeholder="..." />
                        
</>
) : null}
                    </div>
                    <div className="col-md-4 d-flex align-items-center">
                        <div className="form-check mt-2">
                            <input className="form-check-input" type="checkbox" id="includeHeader" checked={includeHeader} onChange={(e) => setIncludeHeader(e.target.checked)} />
                            <label className="form-check-label small" htmlFor="includeHeader">
                                {t('text-column-extractor/options/include_header')}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <button className="btn btn-primary w-100" onClick={onExtract} disabled={!text.trim()}>
                            {t('text-column-extractor/button/extract')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    
</>
);
};

export default InputCard;
