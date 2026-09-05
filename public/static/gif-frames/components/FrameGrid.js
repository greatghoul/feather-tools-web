import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const FrameGrid = ({
    frames,
    selectedIndices,
    onToggleSelect,
    onSelectAll,
    onDeselectAll,
    onDownloadFrame,
    onCopyFrame,
    onDownloadAll,
    onDownloadSelected,
    onPlaySelected,
}) => {
    const allSelected = frames.length > 0 && selectedIndices.size === frames.length;
    const someSelected = selectedIndices.size > 0;

    return html`
        <div class="card frames-card">
            <div class="card-header bg-light">
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <span>
                        ${getText('gif-frames/result/title')}
                        (${frames.length})
                    </span>
                    <div class="d-flex flex-wrap gap-2">
                        <button
                            class="btn btn-sm btn-outline-secondary"
                            onClick=${allSelected ? onDeselectAll : onSelectAll}
                        >
                            ${allSelected
                                ? getText('gif-frames/button/deselect_all')
                                : getText('gif-frames/button/select_all')}
                        </button>
                        <button
                            class="btn btn-sm btn-outline-primary"
                            onClick=${onDownloadAll}
                        >
                            <i class="bi bi-download me-1"></i>
                            ${getText('gif-frames/button/download_all')}
                        </button>
                        <button
                            class="btn btn-sm btn-outline-primary"
                            onClick=${onDownloadSelected}
                            disabled=${!someSelected}
                        >
                            <i class="bi bi-download me-1"></i>
                            ${getText('gif-frames/button/download_selected')}
                            ${someSelected ? html`<span class="badge bg-primary ms-1">${selectedIndices.size}</span>` : null}
                        </button>
                        <button
                            class="btn btn-sm btn-success"
                            onClick=${onPlaySelected}
                            disabled=${!someSelected}
                        >
                            <i class="bi bi-play-fill me-1"></i>
                            ${getText('gif-frames/button/play_selected')}
                        </button>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="frame-grid">
                    ${frames.map((frame) => html`
                        <div
                            key=${frame.index}
                            class="frame-card ${selectedIndices.has(frame.index) ? 'selected' : ''}"
                        >
                            <div
                                class="frame-thumbnail"
                                onClick=${() => onToggleSelect(frame.index)}
                            >
                                <img
                                    class="frame-image"
                                    src=${frame.url}
                                    alt="Frame ${frame.index + 1}"
                                />
                                <div class="frame-checkbox ${selectedIndices.has(frame.index) ? 'checked' : ''}">
                                    ${selectedIndices.has(frame.index) ? html`<i class="bi bi-check-lg"></i>` : null}
                                </div>
                            </div>
                            <div class="frame-body">
                                <div class="frame-info">
                                    <span class="frame-label">
                                        ${getText('gif-frames/result/frame')} ${frame.index + 1}
                                    </span>
                                    <span class="frame-delay">
                                        ${frame.delay}ms
                                    </span>
                                </div>
                                <div class="frame-actions">
                                    <button
                                        class="btn btn-sm btn-outline-primary"
                                        onClick=${() => onDownloadFrame(frame.index)}
                                        title=${getText('gif-frames/result/download_frame')}
                                    >
                                        ${getText('gif-frames/button/download')}
                                    </button>
                                    <button
                                        class="btn btn-sm btn-outline-secondary"
                                        onClick=${() => onCopyFrame(frame.index)}
                                        title=${getText('gif-frames/result/copy_frame')}
                                    >
                                        ${getText('gif-frames/button/copy')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    `)}
                </div>
            </div>
        </div>
    `;
};

export default FrameGrid;
