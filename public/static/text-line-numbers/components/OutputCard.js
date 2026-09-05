import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';

const OutputCard = ({ text, onDownload }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!text) return;
        
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };



    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <span>${getText('text-line-numbers/output/title')}</span>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-success" 
                            onClick=${onDownload}
                            disabled=${!text}>
                        <i class="bi bi-download"></i> ${getText('text-line-numbers/button/download')}
                    </button>
                    <button class="btn btn-sm btn-outline-success" 
                            onClick=${handleCopy}
                            disabled=${!text}>
                        <i class="bi bi-clipboard"></i> ${copied ? getText('text-line-numbers/message/copied') : getText('text-line-numbers/button/copy')}
                    </button>
                </div>
            </div>
            <div class="card-body p-0">
                <textarea
                    class="form-control border-0"
                    style="min-height: 200px; resize: vertical; white-space: nowrap; overflow-x: auto;"
                    readonly
                    value=${text}
                    placeholder="Generated text with line numbers will appear here..."
                ></textarea>
            </div>
            <div class="card-footer bg-light">
                <div class="small text-muted">
                    ${text ? 
                        html`<span>Lines: ${text.split('\n').length} | Characters: ${text.length}</span>` :
                        html`<span>No output generated yet</span>`
                    }
                </div>
            </div>
        </div>
    `;
};

export default OutputCard;