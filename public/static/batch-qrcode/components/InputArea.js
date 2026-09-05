import { html } from 'htm/preact';
import { useState, useRef } from 'preact/hooks';
import { css } from 'goober';
import { getText } from '~/helpers/utils.js';

const textareaStyle = css`
    min-height: 120px;
    font-family: monospace;
    resize: none;
    overflow-y: hidden;
`;

const InputArea = ({ onGenerate, generating }) => {
    const [text, setText] = useState('');
    const textareaRef = useRef(null);

    const handleInput = (e) => {
        setText(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    const handleGenerate = () => {
        if (!text.trim()) return;
        
        const urls = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
            
        if (urls.length > 0) {
            onGenerate(urls);
        }
    };

    const loadExamples = () => {
        const examples = [
            'https://www.google.com',
            'https://github.com',
            'https://stackoverflow.com',
            'https://www.wikipedia.org',
            'https://www.reddit.com'
        ].join('\n');
        setText(examples);
        
        // Adjust height after render
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
            }
        }, 0);
    };

    return html`
        <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">${getText('batch-qrcode/input/label')}</h5>
                <button 
                    class="btn btn-sm btn-outline-secondary" 
                    onClick=${loadExamples}
                    disabled=${generating}
                >
                    ${getText('batch-qrcode/input/load_examples')}
                </button>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <textarea 
                        ref=${textareaRef}
                        class="form-control ${textareaStyle}" 
                        value=${text}
                        onInput=${handleInput}
                        placeholder=${getText('batch-qrcode/input/placeholder')}
                        disabled=${generating}
                        rows="5"
                    ></textarea>
                </div>
                <button 
                    class="btn btn-primary" 
                    onClick=${handleGenerate}
                    disabled=${generating || !text.trim()}
                >
                    ${generating ? getText('batch-qrcode/input/generating') : getText('batch-qrcode/input/generate')}
                </button>
            </div>
        </div>
    `;
};

export default InputArea;
