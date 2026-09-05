import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const formatTime = (ms) => (ms / 1000).toFixed(2);

const CutControls = ({
    mode,
    onModeChange,
    totalFrames,
    totalDuration,
    startFrame,
    endFrame,
    startTime,
    endTime,
    onStartFrameChange,
    onEndFrameChange,
    onStartTimeChange,
    onEndTimeChange,
    onCut,
    isProcessing,
}) => {
    const canCut = !isProcessing && (
        mode === 'frame' ? startFrame < endFrame : startTime < endTime
    );

    const statsText = mode === 'frame'
        ? `${getText('gif-cut/cut/selected_frames')}: ${endFrame - startFrame + 1} / ${totalFrames}`
        : `${getText('gif-cut/cut/selected_duration')}: ${(endTime - startTime).toFixed(2)}s / ${formatTime(totalDuration)}s`;

    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center py-2">
                <div class="btn-group btn-group-sm">
                    <button
                        class="btn ${mode === 'frame' ? 'btn-primary' : 'btn-outline-secondary'}"
                        onClick=${() => onModeChange('frame')}
                    >
                        ${getText('gif-cut/cut/mode_frame')}
                    </button>
                    <button
                        class="btn ${mode === 'second' ? 'btn-primary' : 'btn-outline-secondary'}"
                        onClick=${() => onModeChange('second')}
                    >
                        ${getText('gif-cut/cut/mode_second')}
                    </button>
                </div>
                <span class="text-muted small">${statsText}</span>
            </div>
            <div class="card-body">
                <div class="row g-3 align-items-end">
                    <div class="col-md-4">
                        <label class="form-label small mb-1">
                            ${mode === 'frame'
                                ? getText('gif-cut/timeline/start_frame')
                                : getText('gif-cut/cut/start_time')}
                        </label>
                        ${mode === 'frame' ? html`
                            <input
                                type="number"
                                class="form-control"
                                value=${startFrame + 1}
                                min="1"
                                max=${endFrame + 1}
                                disabled=${isProcessing}
                                onInput=${(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    if (!isNaN(val) && val >= 1 && val <= endFrame + 1) {
                                        onStartFrameChange(val - 1);
                                    }
                                }}
                            />
                        ` : html`
                            <input
                                type="number"
                                class="form-control"
                                value=${startTime}
                                min="0"
                                max=${endTime}
                                step="0.01"
                                disabled=${isProcessing}
                                onInput=${(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val) && val >= 0 && val <= endTime) {
                                        onStartTimeChange(val);
                                    }
                                }}
                            />
                        `}
                    </div>
                    <div class="col-md-4">
                        <label class="form-label small mb-1">
                            ${mode === 'frame'
                                ? getText('gif-cut/timeline/end_frame')
                                : getText('gif-cut/cut/end_time')}
                        </label>
                        ${mode === 'frame' ? html`
                            <input
                                type="number"
                                class="form-control"
                                value=${endFrame + 1}
                                min=${startFrame + 1}
                                max=${totalFrames}
                                disabled=${isProcessing}
                                onInput=${(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    if (!isNaN(val) && val >= startFrame + 1 && val <= totalFrames) {
                                        onEndFrameChange(val - 1);
                                    }
                                }}
                            />
                        ` : html`
                            <input
                                type="number"
                                class="form-control"
                                value=${endTime}
                                min=${startTime}
                                max=${formatTime(totalDuration)}
                                step="0.01"
                                disabled=${isProcessing}
                                onInput=${(e) => {
                                    const val = parseFloat(e.target.value);
                                    const maxVal = totalDuration / 1000;
                                    if (!isNaN(val) && val >= startTime && val <= maxVal) {
                                        onEndTimeChange(val);
                                    }
                                }}
                            />
                        `}
                    </div>
                    <div class="col-md-4">
                        <div class="d-grid">
                            <button
                                class="btn btn-success"
                                onClick=${onCut}
                                disabled=${!canCut}
                            >
                                ${isProcessing ? html`
                                    <span class="spinner-border spinner-border-sm me-1"></span>
                                    ${getText('gif-cut/message/processing')}
                                ` : getText('gif-cut/button/cut')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default CutControls;
