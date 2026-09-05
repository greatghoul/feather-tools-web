import { render } from 'preact';
import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import InputCard from './components/InputCard.js';
import OutputCard from './components/OutputCard.js';
import LineNumberService from './services/LineNumberService.js';

const App = () => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [options, setOptions] = useState({
        type: 'number',
        prefix: '',
        suffix: '. ',
        start: 1,
        step: 1,
        padding: 0,
        reverse: false,
        uppercase: true,
        skipEmpty: false
    });

    const handleClear = () => {
        setInputText('');
        setOutputText('');
    };

    const handleLoadExample = () => {
        const service = new LineNumberService();
        const exampleText = service.getExampleText(options);
        setInputText(exampleText);
        setOutputText('');
    };

    const handleGenerate = () => {
        if (!inputText.trim()) {
            setOutputText('');
            return;
        }

        const service = new LineNumberService();
        const result = service.generateLineNumbers(inputText, options);
        setOutputText(result);
    };

    const handleOpenFile = (fileContent) => {
        setInputText(fileContent);
        setOutputText('');
    };

    const handleDownload = () => {
        if (!outputText) return;
        
        const blob = new Blob([outputText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'numbered-text.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const updateOption = (key, value) => {
        setOptions((prev) => ({ ...prev, [key]: value }));
    };

    return html`
        <div class="text-line-numbers-container">
            <div class="row g-4">
                <div class="col-12">
                    <${InputCard}
                        text=${inputText}
                        onTextChange=${setInputText}
                        onClear=${handleClear}
                        onLoadExample=${handleLoadExample}
                        onGenerate=${handleGenerate}
                        onOpenFile=${handleOpenFile}
                        options=${options}
                        updateOption=${updateOption}
                    />
                </div>
                <div class="col-12">
                    <${OutputCard} 
                        text=${outputText}
                        onDownload=${handleDownload}
                    />
                </div>
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});