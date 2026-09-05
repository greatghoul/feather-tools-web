import { html } from 'htm/preact';
import { render, h } from 'preact';
import { useState, useCallback } from 'preact/hooks';
import { setup } from 'goober';
import InputCard from './components/InputCard.js';
import SettingsCard from './components/SettingsCard.js';
import OutputCard from './components/OutputCard.js';
import { generateBubble } from './services/BubbleService.js';

setup(h);

const App = () => {
    const [inputText, setInputText] = useState('');
    const [arrow, setArrow] = useState('none');
    const [outputs, setOutputs] = useState({ rounded: '', double: '', bold: '' });

    const handleGenerate = useCallback(() => {
        setOutputs({
            rounded: generateBubble(inputText, 'rounded', arrow),
            double: generateBubble(inputText, 'double', arrow),
            bold: generateBubble(inputText, 'bold', arrow),
        });
    }, [inputText, arrow]);

    const handleClear = useCallback(() => {
        setInputText('');
        setOutputs({ rounded: '', double: '', bold: '' });
    }, []);

    const handleLoadExample = useCallback(() => {
        setInputText('Hello, world!\nThis is a text bubble!');
    }, []);

    return html`
        <div class="row row-gap-4 mb-4">
            <div class="col-lg-5">
                <div class="d-flex flex-column gap-4">
                    <${InputCard}
                        text=${inputText}
                        onTextChange=${setInputText}
                        onClear=${handleClear}
                        onLoadExample=${handleLoadExample}
                    />
                    <${SettingsCard}
                        arrow=${arrow}
                        onArrowChange=${setArrow}
                        onGenerate=${handleGenerate}
                    />
                </div>
            </div>
            <div class="col-lg-7">
                <${OutputCard} outputs=${outputs} />
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});
