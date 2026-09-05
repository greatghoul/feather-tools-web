import { html } from 'htm/preact';
import { render } from 'preact';
import { useState } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { notify } from '~/helpers/messages.js';
import figlet from 'figlet';

figlet.defaults({
    fontPath: 'https://cdn.jsdelivr.net/npm/figlet@1.11.0/fonts'
});

const STYLES = [
    { id: 'slant', name: 'Slant', font: 'Slant', key: 'text-ascii-art/options/style_slant' },
    { id: 'block', name: 'Block', font: 'Block', key: 'text-ascii-art/options/style_block' },
    { id: 'doom', name: 'Doom', font: 'Doom', key: 'text-ascii-art/options/style_doom' },
    { id: 'script', name: 'Script', font: 'Script', key: 'text-ascii-art/options/style_script' },
    { id: 'chunky', name: 'Chunky', font: 'Chunky', key: 'text-ascii-art/options/style_chunky' },
    { id: 'nancyj', name: 'Nancyj', font: 'Nancyj', key: 'text-ascii-art/options/style_nancyj' },
    { id: 'rectangles', name: 'Rectangles', font: 'Rectangles', key: 'text-ascii-art/options/style_rectangles' },
    { id: 'roman', name: 'Roman', font: 'Roman', key: 'text-ascii-art/options/style_roman' },
    { id: 'shadow', name: 'Shadow', font: 'Shadow', key: 'text-ascii-art/options/style_shadow' },
    { id: 'speed', name: 'Speed', font: 'Speed', key: 'text-ascii-art/options/style_speed' },
    { id: 'stop', name: 'Stop', font: 'Stop', key: 'text-ascii-art/options/style_stop' },
];

function renderAsciiArt(inputText, font) {
    return new Promise((resolve, reject) => {
        figlet.text(inputText, {
            font: font,
            horizontalLayout: 'default',
            verticalLayout: 'default'
        }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        notify(getText('text-ascii-art/message/copied'), '', 'success');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

const App = () => {
    const [inputText, setInputText] = useState('Hello World');
    const [results, setResults] = useState({});
    const [isGenerating, setIsGenerating] = useState(false);

    const handleClear = () => {
        setInputText('');
        setResults({});
    };

    const hasResults = Object.keys(results).length > 0;

    const handleGenerate = async () => {
        if (!inputText.trim()) {
            setResults({});
            return;
        }

        setIsGenerating(true);
        const newResults = {};
        
        try {
            for (const style of STYLES) {
                try {
                    const result = await renderAsciiArt(inputText, style.font);
                    newResults[style.id] = result;
                } catch (error) {
                    console.error(`Error generating ${style.name} ASCII art:`, error);
                    newResults[style.id] = `Error generating ${style.name} ASCII art.`;
                }
            }
            setResults(newResults);
        } finally {
            setIsGenerating(false);
        }
    };

    return html`
        <div class="row g-4 mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">${getText('text-ascii-art/input/title')}</h5>
                    </div>
                    <div class="card-body">
                        <textarea
                            class="form-control"
                            rows="6"
                            placeholder=${getText('text-ascii-art/input/placeholder')}
                            value=${inputText}
                            onInput=${(event) => setInputText(event.target.value)}
                        ></textarea>
                    </div>
                    <div class="card-footer d-flex gap-2">
                        <button 
                            class="btn btn-primary" 
                            onClick=${handleGenerate}
                            disabled=${isGenerating}
                        >
                            ${isGenerating ? 'Generating...' : getText('text-ascii-art/button/generate')}
                        </button>
                        <button class="btn btn-outline-secondary" onClick=${handleClear}>
                            ${getText('text-ascii-art/button/clear')}
                        </button>
                    </div>
                </div>
            </div>

            ${hasResults ? STYLES.map(style => html`
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">${getText(style.key)}</h6>
                            <button 
                                class="btn btn-sm btn-outline-primary"
                                onClick=${() => copyToClipboard(results[style.id] || '')}
                                disabled=${!results[style.id]}
                                title="Copy to clipboard"
                            >
                                <i class="bi bi-clipboard"></i>
                            </button>
                        </div>
                        <div class="card-body p-2">
                            <div class="overflow-auto" style="max-height: 200px;">
                                <pre class="font-monospace mb-0" style="font-size: 0.75rem; white-space: pre; min-width: max-content;">
                                    ${results[style.id] || 'ASCII art will appear here...'}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            `) : null}
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app');
    if (appContainer) {
        render(html`<${App} />`, appContainer);
    }
});
