import { html } from 'htm/preact';
import { useMemo } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';

export const DEFAULT_SETTINGS = {
    delay: 500,
    width: 480,
    quality: 10,
    loop: 0,
    background: '#ffffff',
    dither: false,
};

const QUALITIES = [
    { value: 5, labelKey: 'gif-maker/setting/quality_high' },
    { value: 10, labelKey: 'gif-maker/setting/quality_medium' },
    { value: 20, labelKey: 'gif-maker/setting/quality_low' },
];

const GifSettings = ({ settings, maxWidth, isGenerating, onSettingsChange }) => {
    const widthOptions = useMemo(() => {
        const presets = [320, 480, 640, 800];
        const options = [{ value: 0, labelKey: 'gif-maker/setting/width_original' }];
        presets.forEach((w) => {
            if (!maxWidth || w < maxWidth) {
                options.push({ value: w, label: `${w}px` });
            }
        });
        if (settings.width > 0 && !options.some((o) => o.value === settings.width)) {
            options.push({ value: settings.width, label: `${settings.width}px` });
        }
        return options;
    }, [maxWidth, settings.width]);

    const handleWidthChange = (e) => {
        onSettingsChange({ ...settings, width: parseInt(e.target.value, 10) || 0 });
    };

    const handleDelayChange = (e) => {
        onSettingsChange({ ...settings, delay: Math.max(20, parseInt(e.target.value, 10) || 20) });
    };

    const handleLoopChange = (value) => {
        onSettingsChange({ ...settings, loop: value });
    };

    const handleLoopTimesChange = (e) => {
        onSettingsChange({ ...settings, loop: Math.max(1, parseInt(e.target.value, 10) || 1) });
    };

    const handleBgColorChange = (e) => {
        onSettingsChange({ ...settings, background: e.target.value });
    };

    const handleDitherChange = (value) => {
        onSettingsChange({ ...settings, dither: value });
    };

    return html`
        <div class="card-body">
            <div class="mb-4">
                <label class="form-label mb-2">${getText('gif-maker/setting/delay')}</label>
                <input
                    type="number"
                    class="form-control"
                    value=${settings.delay}
                    min="20"
                    max="10000"
                    step="10"
                    disabled=${isGenerating}
                    onInput=${handleDelayChange}
                />
                <small class="form-text text-muted">${getText('gif-maker/setting/delay_hint')}</small>
            </div>

            <div class="mb-4">
                <label class="form-label mb-2">${getText('gif-maker/setting/width')}</label>
                <select
                    class="form-select"
                    value=${settings.width}
                    disabled=${isGenerating}
                    onChange=${handleWidthChange}
                >
                    ${widthOptions.map((opt) => html`
                        <option value=${opt.value}>
                            ${opt.label ? opt.label : getText(opt.labelKey)}
                        </option>
                    `)}
                </select>
            </div>

            <div class="mb-4">
                <label class="form-label mb-2">${getText('gif-maker/setting/quality')}</label>
                <div class="btn-group w-100" role="group">
                    ${QUALITIES.map((q) => html`
                        <button
                            key=${q.value}
                            type="button"
                            class="btn btn-sm ${settings.quality === q.value ? 'btn-primary' : 'btn-outline-primary'}"
                            onClick=${() => onSettingsChange({ ...settings, quality: q.value })}
                            disabled=${isGenerating}
                        >
                            ${getText(q.labelKey)}
                        </button>
                    `)}
                </div>
            </div>

            <div class="mb-4">
                <label class="form-label mb-2">${getText('gif-maker/setting/loop')}</label>
                <div class="d-flex align-items-center gap-2">
                    <div class="btn-group" role="group">
                        <button
                            type="button"
                            class="btn btn-sm ${settings.loop === 0 ? 'btn-primary' : 'btn-outline-primary'}"
                            onClick=${() => handleLoopChange(0)}
                            disabled=${isGenerating}
                        >
                            ${getText('gif-maker/setting/loop_infinite')}
                        </button>
                    </div>
                    <div class="d-flex align-items-center gap-2 flex-grow-1">
                        <span class="small text-muted">${getText('gif-maker/setting/loop_times')}</span>
                        <input
                            type="number"
                            class="form-control form-control-sm"
                            style="width: 80px"
                            value=${settings.loop > 0 ? settings.loop : ''}
                            min="1"
                            max="50"
                            step="1"
                            placeholder="1"
                            disabled=${isGenerating}
                            onInput=${handleLoopTimesChange}
                        />
                    </div>
                </div>
            </div>

            <div class="mb-4">
                <label class="form-label mb-2">${getText('gif-maker/setting/background_color')}</label>
                <input
                    type="color"
                    class="form-control form-control-color"
                    value=${settings.background}
                    onChange=${handleBgColorChange}
                    disabled=${isGenerating}
                />
                <small class="form-text text-muted">${getText('gif-maker/setting/background_color_hint')}</small>
            </div>

            <div class="mb-4">
                <label class="form-label mb-2">${getText('gif-maker/setting/dither')}</label>
                <div class="btn-group w-100" role="group">
                    <button
                        type="button"
                        class="btn btn-sm ${settings.dither ? 'btn-primary' : 'btn-outline-primary'}"
                        onClick=${() => handleDitherChange(true)}
                        disabled=${isGenerating}
                    >
                        ${getText('gif-maker/setting/dither_on')}
                    </button>
                    <button
                        type="button"
                        class="btn btn-sm ${!settings.dither ? 'btn-primary' : 'btn-outline-primary'}"
                        onClick=${() => handleDitherChange(false)}
                        disabled=${isGenerating}
                    >
                        ${getText('gif-maker/setting/dither_off')}
                    </button>
                </div>
                <small class="form-text text-muted">${getText('gif-maker/setting/dither_hint')}</small>
            </div>
        </div>
    `;
};

export default GifSettings;
