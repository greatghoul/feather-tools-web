import { html } from 'htm/preact';
import { useRef, useState, useCallback } from 'preact/hooks';
import { css } from 'goober';
import { getText } from '~/helpers/utils.js';

const bubbleFont = css`
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
        "Noto Sans Mono CJK SC", "Source Han Mono SC",
        "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB",
        "Courier New", monospace;
    white-space: pre;
    tab-size: 4;
`;

const STYLE_KEYS = [
    { key: 'rounded', label: getText('text-bubble/options/style_rounded') },
    { key: 'double', label: getText('text-bubble/options/style_double') },
    { key: 'bold', label: getText('text-bubble/options/style_bold') },
];

const BubbleCard = ({ label, text }) => {
    const textareaRef = useRef(null);
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        if (textareaRef.current && text) {
            textareaRef.current.select();
            navigator.clipboard.writeText(text).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    }, [text]);

    return html`
        <div class="card h-100">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <h6 class="mb-0">${label}</h6>
                <button
                    class="btn btn-sm btn-outline-primary"
                    onClick=${handleCopy}
                    disabled=${!text}
                >
                    ${copied ? getText('text-bubble/message/copied') : getText('text-bubble/button/copy')}
                </button>
            </div>
            <div class="card-body">
                <textarea
                    ref=${textareaRef}
                    class=${`form-control ${bubbleFont}`}
                    rows="8"
                    readonly
                    value=${text}
                    onClick=${(e) => e.target.select()}
                    placeholder=${getText('text-bubble/output/placeholder')}
                ></textarea>
            </div>
        </div>
    `;
};

const OutputCard = ({ outputs }) => {
    return html`
        <div class="d-flex flex-column gap-3">
            ${STYLE_KEYS.map(s => html`
                <${BubbleCard} label=${s.label} text=${outputs[s.key]} />
            `)}
        </div>
    `;
};

export default OutputCard;
