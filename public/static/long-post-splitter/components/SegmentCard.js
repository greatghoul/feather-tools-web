import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { notify } from '~/helpers/messages.js';

const SegmentCard = ({ segment, limit }) => {
    const [isCopying, setIsCopying] = useState(false);

    const handleCopy = () => {
        if (segment.fullText && !isCopying) {
            setIsCopying(true);
            navigator.clipboard.writeText(segment.fullText).then(() => {
                notify(getText('long-post-splitter/message/copied'), '', 'success');
                setTimeout(() => setIsCopying(false), 1000);
            });
        }
    };

    const badgeClass = segment.overLimit
        ? 'bg-danger'
        : 'bg-success';

    const showTextWeight = segment.numbering && segment.textWeight !== segment.weight;

    return html`
        <div class="card segment-card">
            <div class="card-header d-flex justify-content-between align-items-center py-2">
                <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-primary">${segment.index}/${segment.total}</span>
                    <span class=${`badge ${badgeClass}`}>
                        ${segment.weight}/${limit}
                    </span>
                    ${showTextWeight ? html`
                        <span class="text-muted small">
                            ${getText('long-post-splitter/segment/text_weight')}: ${segment.textWeight}
                        </span>
                    ` : null}
                    ${segment.overLimit ? html`
                        <span class="badge bg-warning text-dark">
                            ${getText('long-post-splitter/segment/over_limit')}
                        </span>
                    ` : null}
                </div>
                <button
                    class="btn btn-sm btn-outline-primary"
                    onClick=${handleCopy}
                    disabled=${isCopying}
                >
                    <i class="bi bi-clipboard me-1"></i>
                    ${getText('long-post-splitter/button/copy')}
                </button>
            </div>
            <div class="card-body">
                <pre class="segment-text mb-0">${segment.fullText}</pre>
            </div>
        </div>
    `;
};

export default SegmentCard;
