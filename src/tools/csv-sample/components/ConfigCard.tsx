import { t } from '~/helpers/i18n';
import InputNumber from '~/components/InputNumber';
import ColumnEditor from '../components/ColumnEditor';
import TemplateManager from '../components/TemplateManager';
import CsvSampleService from '../services/CsvSampleService';

const ConfigCard = ({
    rowCount,
    setRowCount,
    delimiter,
    setDelimiter,
    customDelimiter,
    setCustomDelimiter,
    locale,
    setLocale,
    includeHeader,
    setIncludeHeader,
    columns,
    setColumns,
    onGenerate,
    onClear,
    isGenerating,
    onActiveTemplateChange,
}) => {
    const currentConfig = {
        rowCount,
        delimiter,
        customDelimiter,
        locale,
        includeHeader,
        columns,
    };

    const handleApplyTemplate = (cfg) => {
        setRowCount(cfg.rowCount ?? 10);
        setDelimiter(cfg.delimiter ?? ',');
        setCustomDelimiter(cfg.customDelimiter ?? '');
        setLocale(cfg.locale ?? 'auto');
        setIncludeHeader(cfg.includeHeader ?? true);
        setColumns(cfg.columns ?? CsvSampleService.createDefaultColumns());
    };

    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <span>{t('csv-sample/settings/title')}</span>
            </div>
            <div className="card-body p-0">
                <div className="row g-0">
                    <div className="col-lg-4">
                        <div className="card h-100 border-0">
                            <div className="card-header py-2 bg-transparent">
                                <span>{t('csv-sample/settings/rows')}</span>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">{t('csv-sample/options/rows')}</label>
                                    <InputNumber value={rowCount} min={1} max={10000} step={1} onChange={setRowCount} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">{t('csv-sample/options/delimiter')}</label>
                                    <select className="form-select form-select-sm" value={delimiter} onChange={(e) => setDelimiter(e.target.value)}>
                                        {CsvSampleService.DELIMITERS.map((d) => (
                                            <option key={d.value} value={d.value}>{t(d.key)}</option>
                                        ))}
                                    </select>
                                    {delimiter === 'custom' ? (
<>

                                        <input type="text" className="form-control form-control-sm mt-2" placeholder="," value={customDelimiter} onInput={(e) => setCustomDelimiter((e.target as HTMLInputElement).value)} />
                                    
</>
) : null}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">{t('csv-sample/options/locale')}</label>
                                    <select className="form-select form-select-sm" value={locale} onChange={(e) => setLocale(e.target.value)}>
                                        {CsvSampleService.LOCALES.map((l) => (
                                            <option key={l.value} value={l.value}>{t(l.key)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" id="csv-sample-include-header" checked={includeHeader} onChange={(e) => setIncludeHeader(e.target.checked)} />
                                    <label className="form-check-label" htmlFor="csv-sample-include-header">
                                        {t('csv-sample/options/include_header')}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-8 border-lg-start">
                        <div className="card h-100 border-0">
                            <div className="card-header py-2 bg-transparent d-flex justify-content-between align-items-center">
                                <span>{t('csv-sample/settings/columns')}</span>
                                <button className="btn btn-link btn-sm p-0 text-decoration-none" onClick={onClear}>
                                    {t('csv-sample/button/clear')}
                                </button>
                            </div>
                            <div className="card-body">
                                <ColumnEditor columns={columns} setColumns={setColumns} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-footer bg-light">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <TemplateManager config={currentConfig} onApplyTemplate={handleApplyTemplate} onActiveTemplateChange={onActiveTemplateChange} />
                    <div className="d-flex gap-2">
                        <button className="btn btn-primary" onClick={onGenerate} disabled={isGenerating || columns.length === 0}>
                            {isGenerating ? (
<>
<span className="spinner-border spinner-border-sm me-2"></span>
</>
) : null}
                            {t('csv-sample/button/generate')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    
</>
);
};

export default ConfigCard;
