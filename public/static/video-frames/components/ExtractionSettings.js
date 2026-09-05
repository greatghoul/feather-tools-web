import { html } from 'htm/preact';
import { useMemo } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { estimateFrameCount } from '@/services/VideoFramesService.js';

const MAX_FRAMES = 500;

const MODES = [
    { value: 'fps', labelKey: 'video-frames/settings/mode_fps' },
    { value: 'interval', labelKey: 'video-frames/settings/mode_interval' },
    { value: 'count', labelKey: 'video-frames/settings/mode_count' },
];

const ExtractionSettings = ({
    mode,
    fps,
    interval,
    count,
    format,
    quality,
    duration,
    isExtracting,
    onModeChange,
    onFpsChange,
    onIntervalChange,
    onCountChange,
    onFormatChange,
    onQualityChange,
    onExtract,
}) => {
    const estimated = useMemo(
        () => estimateFrameCount(duration, mode, fps, interval, count),
        [duration, mode, fps, interval, count]
    );

    const overLimit = estimated > MAX_FRAMES;
    const canExtract = duration > 0 && !isExtracting && !overLimit && estimated > 0;

    return html`
        <div class="card">
            <div class="card-header bg-light">
                <span>${getText('video-frames/settings/title')}</span>
            </div>
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label small">
                            ${getText('video-frames/settings/mode')}
                        </label>
                        <div class="btn-group w-100" role="group">
                            ${MODES.map((m) => html`
                                <button
                                    key=${m.value}
                                    type="button"
                                    class="btn btn-sm ${mode === m.value ? 'btn-primary' : 'btn-outline-primary'}"
                                    onClick=${() => onModeChange(m.value)}
                                    disabled=${isExtracting}
                                >
                                    ${getText(m.labelKey)}
                                </button>
                            `)}
                        </div>
                    </div>

                    ${mode === 'fps' ? html`
                        <div class="col-md-6">
                            <label class="form-label small">
                                ${getText('video-frames/settings/fps')}
                            </label>
                            <input
                                type="number"
                                class="form-control"
                                value=${fps}
                                min="1"
                                max="60"
                                step="1"
                                disabled=${isExtracting}
                                onInput=${(e) => onFpsChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            />
                        </div>
                    ` : null}

                    ${mode === 'interval' ? html`
                        <div class="col-md-6">
                            <label class="form-label small">
                                ${getText('video-frames/settings/interval')}
                            </label>
                            <input
                                type="number"
                                class="form-control"
                                value=${interval}
                                min="0.1"
                                max="60"
                                step="0.1"
                                disabled=${isExtracting}
                                onInput=${(e) => onIntervalChange(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                            />
                        </div>
                    ` : null}

                    ${mode === 'count' ? html`
                        <div class="col-md-6">
                            <label class="form-label small">
                                ${getText('video-frames/settings/count')}
                            </label>
                            <input
                                type="number"
                                class="form-control"
                                value=${count}
                                min="1"
                                max=${MAX_FRAMES}
                                step="1"
                                disabled=${isExtracting}
                                onInput=${(e) => onCountChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            />
                        </div>
                    ` : null}

                    <div class="col-md-6">
                        <label class="form-label small">
                            ${getText('video-frames/settings/format')}
                        </label>
                        <div class="btn-group w-100" role="group">
                            <button
                                type="button"
                                class="btn btn-sm ${format === 'image/png' ? 'btn-primary' : 'btn-outline-primary'}"
                                onClick=${() => onFormatChange('image/png')}
                                disabled=${isExtracting}
                            >
                                ${getText('video-frames/settings/format_png')}
                            </button>
                            <button
                                type="button"
                                class="btn btn-sm ${format === 'image/jpeg' ? 'btn-primary' : 'btn-outline-primary'}"
                                onClick=${() => onFormatChange('image/jpeg')}
                                disabled=${isExtracting}
                            >
                                ${getText('video-frames/settings/format_jpeg')}
                            </button>
                        </div>
                    </div>

                    ${format === 'image/jpeg' ? html`
                        <div class="col-md-6">
                            <label class="form-label small">
                                ${getText('video-frames/settings/quality')}:
                                ${Math.round(quality * 100)}%
                            </label>
                            <input
                                type="range"
                                class="form-range"
                                value=${quality}
                                min="0.1"
                                max="1"
                                step="0.05"
                                disabled=${isExtracting}
                                onInput=${(e) => onQualityChange(parseFloat(e.target.value))}
                            />
                        </div>
                    ` : null}

                </div>
            </div>
            <div class="card-footer">
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <span class="small text-muted">
                        ${getText('video-frames/settings/estimated_frames')}:
                        <strong class=${overLimit ? 'text-danger' : 'text-body'}>${estimated}</strong>
                        ${overLimit ? html`
                            <span class="badge bg-danger ms-2">max ${MAX_FRAMES}</span>
                        ` : null}
                    </span>
                    <button
                        class="btn btn-success"
                        onClick=${onExtract}
                        disabled=${!canExtract}
                    >
                        ${isExtracting ? html`
                            <span class="spinner-border spinner-border-sm me-1"></span>
                            ${getText('video-frames/button/extracting')}
                        ` : html`
                            ${getText('video-frames/button/extract')}
                        `}
                    </button>
                </div>
            </div>
        </div>
    `;
};

export default ExtractionSettings;
