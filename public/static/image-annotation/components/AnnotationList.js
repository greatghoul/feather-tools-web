import { html } from 'htm/preact';
import { css } from 'goober';
import { getText } from '~/helpers/utils.js';
import { getAnnotationKey } from '../services/AnnotationEngine.js';

const listStyle = css`
    .annotation-item:hover {
        background-color: #e9ecef !important;
    }
`;

const AnnotationList = ({
    annotations,
    onClearAll,
    onDelete,
    onSelect,
}) => {
    return html`
        <div class="col-12 col-md-2 bg-light rounded" style="min-height:400px;max-height:600px;">
            <div class="d-flex justify-content-between align-items-center mb-1 p-2" style="flex-shrink:0;">
                <small class="text-muted">
                    ${getText('image-annotation/annotations/title')} (${annotations.length})
                </small>
                <button
                    class="btn btn-sm btn-outline-warning"
                    onClick=${onClearAll}
                    title=${getText('image-annotation/toolbar/clear_all')}
                    style="padding:0.1rem 0.3rem;font-size:0.7rem;"
                >
                    <i class="bi bi-eraser"></i>
                </button>
            </div>
            ${annotations.length === 0 && html`
                <small class="text-muted p-2">${getText('image-annotation/annotations/empty')}</small>
            `}
            <div style="overflow-y:auto; height: calc(100% - 25px);">
                ${annotations.map((ann, idx) => html`
                    <div
                        key=${ann.id}
                        class="d-flex align-items-center justify-content-between gap-1 p-1 m-1 rounded annotation-item"
                        style="cursor:pointer;background:#f8f9fa;border:1px solid #dee2e6;font-size:0.8rem;transition:background-color 0.15s;flex-shrink:0;"
                        onClick=${() => onSelect(ann.id)}
                    >
                        <span class="text-truncate">
                            ${getText(getAnnotationKey(ann.type))} ${idx + 1}
                        </span>
                        <i
                            class="bi bi-x text-danger"
                            style="cursor:pointer;font-size:0.8rem;flex-shrink:0;"
                            onClick=${(e) => {
                                e.stopPropagation();
                                onDelete(ann.id);
                            }}
                        ></i>
                    </div>
                `)}
            </div>
        </div>
        <style>${listStyle}</style>
    `;
};

export default AnnotationList;
