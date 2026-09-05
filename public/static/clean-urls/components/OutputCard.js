// Output Card Component for Batch URL Cleaner
import { html } from 'htm/preact';
import { css, keyframes } from 'goober';
import { getText } from '~/helpers/utils.js';

const fadeInOut = keyframes`
    0%, 100% { opacity: 0; }
    10%, 90% { opacity: 1; }
`;

const btnCopyStyle = css`
    position: relative;

    &.copied::after {
        content: "Copied!";
        position: absolute;
        top: -2rem;
        left: 50%;
        transform: translateX(-50%);
        background: #28a745;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        white-space: nowrap;
        animation: ${fadeInOut} 2s ease-in-out;
    }
`;

const outputAreaStyle = css`
    min-height: 200px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9rem;
    line-height: 1.4;
    
    @media (max-width: 768px) {
        min-height: 150px;
        font-size: 0.8rem;
    }
`;

const OutputCard = ({ 
    cleanedUrls, 
    copyButtonRef,
    onCopy,
    onDownload 
}) => {
    // Calculate dynamic rows for textarea (between 5 and 15)
    const calculateRows = () => {
        if (!cleanedUrls) return 5;
        const lineCount = cleanedUrls.split('\n').length;
        return Math.max(5, Math.min(15, lineCount));
    };

    return html`
        ${(cleanedUrls) && html`
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">${getText('clean-urls/output/title')}</h5>
                    ${cleanedUrls && html`
                        <div class="btn-group">
                            <button
                                ref=${copyButtonRef}
                                class="btn btn-outline-primary btn-sm ${btnCopyStyle}"
                                onClick=${onCopy}
                            >
                                <i class="bi bi-clipboard"></i> ${getText('clean-urls/button/copy')}
                            </button>
                            <button
                                class="btn btn-outline-success btn-sm"
                                onClick=${onDownload}
                            >
                                <i class="bi bi-download"></i> Download
                            </button>
                        </div>
                    `}
                </div>
                <div class="card-body">
                    ${cleanedUrls && html`
                        <div class="results" id="output">
                            <textarea 
                                class="form-control font-monospace ${outputAreaStyle}" 
                                rows=${calculateRows()}
                                readonly
                                value=${cleanedUrls}
                            ></textarea>
                        </div>
                    `}
                </div>
            </div>
        `}
    `;
};

export default OutputCard;
