import { html } from 'htm/preact';
import { useMemo } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { estimateFrameCount } from '@/services/VideoGifService.js';

const MAX_FRAMES = 200;

const MODES = [
    { value: 'fps', labelKey: 'video-to-gif/settings/mode_fps' },
    { value: 'interval', labelKey: 'video-to-gif/settings/mode_interval' },
    { value: 'count', labelKey: 'video-to-gif/settings/mode_count' },
];

const QUALITIES = [
    { value: 5, labelKey: 'video-to-gif/settings/quality_high' },
    { value: 10, labelKey: 'video-to-gif/settings/quality_medium' },
    { value: 20, labelKey: 'video-to-gif/settings/quality_low' },
];

const GifSettings = ({
    mode,
    fps,
    interval,
    count,
    width,
    quality,
    duration,
    videoWidth,
    isGenerating,
    onModeChange,
    onFpsChange,
    onIntervalChange,
    onCountChange,
    onWidthChange,
    onQualityChange,
    onGenerate,
}) => {
    const estimated = useMemo(
        () => estimateFrameCount(duration, mode, fps, interval, count),
        [duration, mode, fps, interval, count]
    );

    const overLimit = estimated > MAX_FRAMES;
    const canGenerate = duration > 0 && !isGenerating && !overLimit && estimated > 0;

    const widthOptions = useMemo(() => {
        const presets = [320, 480, 640, 800];
        const options = [{ value: 0, labelKey: 'video-to-gif/settings/width_original' }];
        presets.forEach((w) => {
            if (!videoWidth || w < videoWidth) {
                options.push({ value: w, label: `${w}px` });
            }
        });
        return options;
    }, [videoWidth]);

    return html`
        <div class="card">
            <div class="card-header bg-light">
                <span>${getText('video-to-gif/settings/title')}</span>
            </div>
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label small">
                            ${getText('video-to-gif/settings/mode')}
                        </label>
                        <div class="btn-group w-100" role="group">
                            ${MODES.map((m) => html`
                                <button
                                    key=${m.value}
                                    type="button"
                                    class="btn btn-sm ${mode === m.value ? 'btn-primary' : 'btn-outline-primary'}"
                                    onClick=${() => onModeChange(m.value)}
                                    disabled=${isGenerating}
                                >
                                    ${getText(m.labelKey)}
                                </button>
                            `)}
                        </div>
                    </div>

                    ${mode === 'fps' ? html`
                        <div class="col-md-6">
                            <label class="form-label small">
                                ${getText('video-to-gif/settings/fps')}
                            </label>
                            <input
                                type="number"
                                class="form-control"
                                value=${fps}
                                min="1"
                                max="30"
                                step="1"
                                disabled=${isGenerating}
                                onInput=${(e) => onFpsChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            />
                        </div>
                    ` : null}

                    ${mode === 'interval' ? html`
                        <div class="col-md-6">
                            <label class="form-label small">
                                ${getText('video-to-gif/settings/interval')}
                            </label>
                            <input
                                type="number"
                                class="form-control"
                                value=${interval}
                                min="0.1"
                                max="60"
                                step="0.1"
                                disabled=${isGenerating}
                                onInput=${(e) => onIntervalChange(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                            />
                        </div>
                    ` : null}

                    ${mode === 'count' ? html`
                        <div class="col-md-6">
                            <label class="form-label small">
                                ${getText('video-to-gif/settings/count')}
                            </label>
                            <input
                                type="number"
                                class="form-control"
                                value=${count}
                                min="1"
                                max=${MAX_FRAMES}
                                step="1"
                                disabled=${isGenerating}
                                onInput=${(e) => onCountChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            />
                        </div>
                    ` : null}

                    <div class="col-md-6">
                        <label class="form-label small">
                            ${getText('video-to-gif/settings/width')}
                        </label>
                        <select
                            class="form-select"
                            value=${width}
                            disabled=${isGenerating}
                            onChange=${(e) => onWidthChange(parseInt(e.target.value, 10) || 0)}
                        >
                            ${widthOptions.map((opt) => html`
                                <option value=${opt.value}>
                                    ${opt.label ? opt.label : getText(opt.labelKey)}
                                </option>
                            `)}
                        </select>
                    </div>

                    <div class="col-md-6">
                        <label class="form-label small">
                            ${getText('video-to-gif/settings/quality')}
                        </label>
                        <div class="btn-group w-100" role="group">
                            ${QUALITIES.map((q) => html`
                                <button
                                    key=${q.value}
                                    type="button"
                                    class="btn btn-sm ${quality === q.value ? 'btn-primary' : 'btn-outline-primary'}"
                                    onClick=${() => onQualityChange(q.value)}
                                    disabled=${isGenerating}
                                >
                                    ${getText(q.labelKey)}
                                </button>
                            `)}
                        </div>
                    </div>

                </div>
            </div>
            <div class="card-footer">
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <span class="small text-muted">
                        ${getText('video-to-gif/settings/estimated_frames')}:
                        <strong class=${overLimit ? 'text-danger' : 'text-body'}>${estimated}</strong>
                        ${overLimit ? html`
                            <span class="badge bg-danger ms-2">max ${MAX_FRAMES}</span>
                        ` : null}
                    </span>
                    <button
                        class="btn btn-success"
                        onClick=${onGenerate}
                        disabled=${!canGenerate}
                    >
                        ${isGenerating ? html`
                            <span class="spinner-border spinner-border-sm me-1"></span>
                            ${getText('video-to-gif/button/generating')}
                        ` : html`
                            ${getText('video-to-gif/button/generate')}
                        `}
                    </button>
                </div>
            </div>
        </div>
    `;
};

export default GifSettings;
