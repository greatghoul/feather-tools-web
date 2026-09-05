import { html } from 'htm/preact';
import { render, h } from 'preact';
import { useState, useCallback } from 'preact/hooks';
import { setup } from 'goober';
import TextCard from './components/TextCard.js';
import SettingsCard from './components/SettingsCard.js';

setup(h);

const App = () => {
    const [inputText, setInputText] = useState('');
    const [settings, setSettings] = useState({
        ignoreLeading: false,
        ignoreTrailing: false,
    });

    const handleDedup = () => {
        const lines = inputText.split('\n');
        const uniqueLines = [];
        const seen = new Set();

        lines.forEach(line => {
            let processedLine = line;
            if (settings.ignoreLeading) {
                processedLine = processedLine.trimStart();
            }
            if (settings.ignoreTrailing) {
                processedLine = processedLine.trimEnd();
            }

            if (!seen.has(processedLine)) {
                seen.add(processedLine);
                uniqueLines.push(line);
            }
        });

        setInputText(uniqueLines.join('\n'));
    };
    
    const handleTextChange = useCallback((newText) => {
        setInputText(newText);
    }, []);

    const handleSettingsChange = useCallback((newSettings) => {
        setSettings(newSettings);
    }, []);

    return html`
        <div class="row row-gap-4 mb-4">
            <div class="col-md-12">
                <${TextCard} text=${inputText} onTextChange=${handleTextChange} settings=${settings} />
            </div>

            <div class="col-md-12">
                <${SettingsCard} onSettingsChange=${handleSettingsChange} onDedup=${handleDedup} />
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});
