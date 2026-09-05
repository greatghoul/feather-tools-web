import { useState } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';
import ConfigCard from './components/ConfigCard';
import OutputCard from './components/OutputCard';
import CsvSampleService from './services/CsvSampleService';

const App = () => {
    const [rowCount, setRowCount] = useState(10);
    const [delimiter, setDelimiter] = useState(',');
    const [customDelimiter, setCustomDelimiter] = useState('');
    const [locale, setLocale] = useState('auto');
    const [includeHeader, setIncludeHeader] = useState(true);
    const [columns, setColumns] = useState(CsvSampleService.createDefaultColumns());
    const [outputData, setOutputData] = useState<any>({ headers: [], rows: [] });
    const [viewMode, setViewMode] = useState('table');
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTemplateName, setActiveTemplateName] = useState('');

    const sep = delimiter === 'custom' ? (customDelimiter || ',') : delimiter;

    const handleGenerate = async () => {
        const validColumns = columns.filter((c) => c.name.trim() !== '');
        if (validColumns.length === 0) {
            notify(t('csv-sample/message/no_columns'), '', 'warning');
            return;
        }
        setIsGenerating(true);
        try {
            const data = await CsvSampleService.generateCsv(validColumns, rowCount, { locale });
            setOutputData({
                headers: includeHeader ? data.headers : [],
                rows: data.rows,
            });
            setViewMode(data.rows.length > 100 ? 'text' : 'table');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClear = () => {
        setColumns(CsvSampleService.createEmptyColumns());
        setOutputData({ headers: [], rows: [] });
        setViewMode('table');
    };

    return (
<>

        <div className="csv-sample-container">
            <div className="row g-4">
                <div className="col-12">
                    <ConfigCard rowCount={rowCount} setRowCount={setRowCount} delimiter={delimiter} setDelimiter={setDelimiter} customDelimiter={customDelimiter} setCustomDelimiter={setCustomDelimiter} locale={locale} setLocale={setLocale} includeHeader={includeHeader} setIncludeHeader={setIncludeHeader} columns={columns} setColumns={setColumns} onGenerate={handleGenerate} onClear={handleClear} isGenerating={isGenerating} onActiveTemplateChange={setActiveTemplateName} />
                </div>
                <div className="col-12">
                    <OutputCard headers={outputData.headers} rows={outputData.rows} delimiter={sep} viewMode={viewMode} setViewMode={setViewMode} filenamePrefix={activeTemplateName} />
                </div>
            </div>
        </div>
    
</>
);
};

export default App;
