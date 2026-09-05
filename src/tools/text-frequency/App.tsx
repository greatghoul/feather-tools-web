import { useState } from 'react';
import InputCard from './components/InputCard';
import OutputCard from './components/OutputCard';
import FrequencyService from './services/FrequencyService';

const App = () => {
    const [inputText, setInputText] = useState('');
    const [result, setResult] = useState<any>(null);
    const [options, setOptions] = useState({
        minLength: 1,
        caseSensitive: false,
        ignoreNumbers: false,
        ignoreStopwords: false,
        sortBy: 'frequency',
        sortOrder: 'descending',
        limit: 0,
    });

    const handleClear = () => {
        setInputText('');
        setResult(null);
    };

    const handleLoadExample = () => {
        const service = new FrequencyService();
        setInputText(service.getExampleText());
        setResult(null);
    };

    const handleAnalyze = () => {
        if (!inputText.trim()) {
            setResult(null);
            return;
        }
        const service = new FrequencyService();
        const analysisResult = service.analyze(inputText, options);
        setResult(analysisResult);
    };

    const handleExportCSV = () => {
        if (!result || result.frequencies.length === 0) return;
        const service = new FrequencyService();
        const csv = service.exportCSV(result.frequencies);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'word-frequency.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const updateOption = (key, value) => {
        setOptions((prev) => ({ ...prev, [key]: value }));
    };

    return (
<>

        <div className="text-frequency-container">
            <div className="row g-4">
                <div className="col-12">
                    <InputCard text={inputText} onTextChange={setInputText} onClear={handleClear} onLoadExample={handleLoadExample} onAnalyze={handleAnalyze} options={options} updateOption={updateOption} />
                </div>
                <div className="col-12">
                    <OutputCard result={result} onExportCSV={handleExportCSV} />
                </div>
            </div>
        </div>
    
</>
);
};

export default App;
