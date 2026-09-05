import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const MODES = [
    { value: 'horizontal', icon: 'bi-arrow-left-right', labelKey: 'video-flip/mode/horizontal' },
    { value: 'vertical', icon: 'bi-arrow-up-down', labelKey: 'video-flip/mode/vertical' },
    { value: 'both', icon: 'bi-arrow-repeat', labelKey: 'video-flip/mode/both' },
];

const FlipControls = ({ flipMode, onChange, disabled }) => {
    return html`
        <div class="btn-group w-100" role="group" aria-label="flip mode">
            ${MODES.map((mode) => html`
                <button
                    key=${mode.value}
                    type="button"
                    class="btn ${flipMode === mode.value ? 'btn-primary' : 'btn-outline-secondary'}"
                    onClick=${() => onChange(mode.value)}
                    disabled=${disabled}
                >
                    <i class="bi ${mode.icon} me-1"></i>
                    ${getText(mode.labelKey)}
                </button>
            `)}
        </div>
    `;
};

export default FlipControls;
