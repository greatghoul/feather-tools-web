import { useState } from 'react';
import InputCard from './components/InputCard';
import OutputCard from './components/OutputCard';
import { convertText } from './services/caseConverter';

const EXAMPLE_TEXT = 'hello world from feathr tools\nuser_name is a variable\nconvertToCamelCase is cool';

const App = () => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [caseType, setCaseType] = useState('uppercase');

    const handleClear = () => {
        setInputText('');
        setOutputText('');
    };

    const handleLoadExample = () => {
        setInputText(EXAMPLE_TEXT);
        setOutputText('');
    };

    const handleConvert = () => {
        if (!inputText.trim()) {
            setOutputText('');
            return;
        }
        const lines = inputText.split('\n');
        const convertedLines = lines.map(line => convertText(line, caseType));
        setOutputText(convertedLines.join('\n'));
    };

    return (
<>

        <div className="text-case-convert-container">
            <div className="row g-4">
                <div className="col-12">
                    <InputCard text={inputText} onTextChange={setInputText} onClear={handleClear} onLoadExample={handleLoadExample} onConvert={handleConvert} caseType={caseType} setCaseType={setCaseType} />
                </div>
                <div className="col-12">
                    <OutputCard text={outputText} />
                </div>
            </div>
        </div>
    
</>
);
};

export default App;
