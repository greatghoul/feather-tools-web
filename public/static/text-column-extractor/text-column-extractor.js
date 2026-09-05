import { render } from 'preact';
import { html } from 'htm/preact';
import { useState, useMemo, useEffect } from 'preact/hooks';
import InputCard from '@/components/InputCard.js';
import OutputCard from '@/components/OutputCard.js';
import ColumnExtractorService from '@/services/ColumnExtractorService.js';

const App = () => {
    const [inputText, setInputText] = useState('');
    const [outputData, setOutputData] = useState({ headers: [], rows: [] });
    const [delimiter, setDelimiter] = useState(',');
    const [customDelimiter, setCustomDelimiter] = useState('');
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [includeHeader, setIncludeHeader] = useState(true);
    const [inputViewMode, setInputViewMode] = useState('table');
    const [outputViewMode, setOutputViewMode] = useState('table');

    const resolveDelimiter = () => {
        if (delimiter === 'custom') return customDelimiter || ',';
        return delimiter;
    };

    const sep = resolveDelimiter();

    const previewData = useMemo(() => {
        if (!inputText.trim()) return { rows: [], columns: 0 };
        return ColumnExtractorService.previewAll(inputText, sep);
    }, [inputText, sep]);

    const previewHeaders = useMemo(() => {
        if (previewData.rows.length === 0) return [];
        return Array.from({ length: previewData.columns }, (_, i) =>
            previewData.rows[0][i] || ''
        );
    }, [previewData]);

    useEffect(() => {
        setSelectedColumns((prev) => prev.filter((c) => c <= previewData.columns));
    }, [previewData.columns]);

    const handleExtract = () => {
        if (!inputText.trim() || selectedColumns.length === 0) {
            setOutputData({ headers: [], rows: [] });
            return;
        }

        const columnInput = selectedColumns.join(',');
        const result = ColumnExtractorService.extract(inputText, sep, columnInput, includeHeader);
        setOutputData(result);
    };

    const handleClear = () => {
        setInputText('');
        setOutputData({ headers: [], rows: [] });
        setSelectedColumns([]);
    };

    const handleLoadExample = () => {
        const isChinese = window.LOCALE === 'zh';
        const exampleText = isChinese
            ? [
                '姓名,年龄,城市,职业',
                '张三,28,北京,工程师',
                '李四,35,上海,设计师',
                '王五,42,广州,产品经理',
                '赵六,31,深圳,开发人员',
            ].join('\n')
            : [
                'Name,Age,City,Occupation',
                'Alice,28,New York,Engineer',
                'Bob,35,London,Designer',
                'Charlie,42,Tokyo,Product Manager',
                'Diana,31,Sydney,Developer',
            ].join('\n');
        setInputText(exampleText);
        setOutputData({ headers: [], rows: [] });
    };

    return html`
        <div class="text-column-extractor-container">
            <div class="row g-4">
                <div class="col-12">
                    <${InputCard}
                        text=${inputText}
                        onTextChange=${setInputText}
                        onClear=${handleClear}
                        onLoadExample=${handleLoadExample}
                        onExtract=${handleExtract}
                        delimiter=${delimiter}
                        setDelimiter=${setDelimiter}
                        customDelimiter=${customDelimiter}
                        setCustomDelimiter=${setCustomDelimiter}
                        selectedColumns=${selectedColumns}
                        setSelectedColumns=${setSelectedColumns}
                        includeHeader=${includeHeader}
                        setIncludeHeader=${setIncludeHeader}
                        inputViewMode=${inputViewMode}
                        setInputViewMode=${setInputViewMode}
                        previewData=${previewData}
                        previewHeaders=${previewHeaders}
                    />
                </div>
                <div class="col-12">
                    <${OutputCard}
                        headers=${outputData.headers}
                        rows=${outputData.rows}
                        outputViewMode=${outputViewMode}
                        setOutputViewMode=${setOutputViewMode}
                        delimiter=${sep}
                    />
                </div>
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});
