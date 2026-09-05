import { render } from 'preact';
import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import InputCard from '@/components/InputCard.js';
import OutputCard from '@/components/OutputCard.js';
import { convertText } from '@/services/caseConverter.js';

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

    return html`
        <div class="text-case-convert-container">
            <div class="row g-4">
                <div class="col-12">
                    <${InputCard}
                        text=${inputText}
                        onTextChange=${setInputText}
                        onClear=${handleClear}
                        onLoadExample=${handleLoadExample}
                        onConvert=${handleConvert}
                        caseType=${caseType}
                        setCaseType=${setCaseType}
                    />
                </div>
                <div class="col-12">
                    <${OutputCard} text=${outputText} />
                </div>
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});