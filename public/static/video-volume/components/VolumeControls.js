import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';

const VOLUME_PRESETS = [
    { value: 0, labelKey: 'video-volume/preset/mute' },
    { value: 25, label: '25%' },
    { value: 50, label: '50%' },
    { value: 75, label: '75%' },
    { value: 100, label: '100%' },
    { value: 125, label: '125%' },
    { value: 150, label: '150%' },
    { value: 175, label: '175%' },
    { value: 200, label: '200%' },
];

const MIN_VOLUME = 0;
const MAX_VOLUME = 200;

const VolumeControls = ({ volume, onVolumeChange, disabled }) => {
    const [customValue, setCustomValue] = useState('');

    useEffect(() => {
        const isPreset = VOLUME_PRESETS.some((p) => p.value === volume);
        setCustomValue(isPreset ? '' : String(volume));
    }, [volume]);

    const handlePresetClick = (value) => {
        onVolumeChange(value);
    };

    const handleSliderChange = (e) => {
        onVolumeChange(parseInt(e.target.value, 10));
    };

    const handleCustomChange = (e) => {
        setCustomValue(e.target.value);
    };

    const applyCustom = () => {
        const value = parseFloat(customValue);
        if (isNaN(value)) {
            setCustomValue(String(volume));
            return;
        }
        const clamped = Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, Math.round(value)));
        onVolumeChange(clamped);
        setCustomValue(String(clamped));
    };

    const handleCustomBlur = () => {
        if (customValue === '' || customValue === String(volume)) {
            setCustomValue('');
            return;
        }
        applyCustom();
    };

    const handleCustomKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    const formatLabel = (v) => (v === 0 ? getText('video-volume/preset/mute') : `${v}%`);

    return html`
        <div class="volume-controls">
            <label class="form-label fw-bold mb-2">${getText('video-volume/settings/volume')}</label>
            <div class="d-flex flex-wrap gap-1 mb-3">
                ${VOLUME_PRESETS.map((preset) => html`
                    <button
                        key=${preset.value}
                        type="button"
                        class="btn btn-sm ${volume === preset.value ? 'btn-primary' : 'btn-outline-secondary'}"
                        onClick=${() => handlePresetClick(preset.value)}
                        disabled=${disabled}
                    >
                        ${preset.labelKey ? getText(preset.labelKey) : preset.label}
                    </button>
                `)}
            </div>
            <div class="d-flex align-items-center gap-3 mb-2">
                <i class="bi bi-volume-mute-fill text-muted"></i>
                <input
                    type="range"
                    class="form-range volume-slider"
                    min=${MIN_VOLUME}
                    max=${MAX_VOLUME}
                    step="1"
                    value=${volume}
                    onInput=${handleSliderChange}
                    disabled=${disabled}
                />
                <i class="bi bi-volume-up-fill text-muted"></i>
                <span class="badge bg-primary fs-6 volume-badge">${formatLabel(volume)}</span>
            </div>
            <div class="d-flex align-items-center gap-2">
                <input
                    type="number"
                    class="form-control form-control-sm"
                    style=${{ maxWidth: '100px' }}
                    min=${MIN_VOLUME}
                    max=${MAX_VOLUME}
                    step="1"
                    value=${customValue}
                    placeholder=${String(volume)}
                    onInput=${handleCustomChange}
                    onBlur=${handleCustomBlur}
                    onKeyDown=${handleCustomKeyDown}
                    disabled=${disabled}
                />
                <small class="text-muted">${getText('video-volume/settings/custom_hint')}</small>
            </div>
        </div>
    `;
};

export default VolumeControls;
