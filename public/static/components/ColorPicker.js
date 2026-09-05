import { html } from 'htm/preact';
import { css } from 'goober';

const style = css`
    .cp-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .cp-group {
        display: flex;
        gap: 6px;
        align-items: center;
    }

    .cp-btn {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        padding: 0;
        transition: border-color 0.15s, transform 0.15s;
        outline: none;
    }

    .cp-btn:hover {
        transform: scale(1.15);
    }

    .cp-btn.active {
        border-color: #333;
        transform: scale(1.12);
    }

    .cp-selected {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        padding: 4px 8px 4px 4px;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        background: #f9fafb;
        transition: border-color 0.15s;
        position: relative;
    }

    .cp-selected:hover {
        border-color: #2563eb;
    }

    .cp-swatch {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        flex-shrink: 0;
    }

    .cp-icon {
        font-size: 14px;
        color: #9ca3af;
        line-height: 1;
    }

    .cp-selected:hover .cp-icon {
        color: #2563eb;
    }

    .cp-picker {
        position: absolute;
        right: 0;
        top: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
    }
`;

/**
 * Color picker with preset swatches and custom color input.
 *
 * @param {Object} props
 * @param {string} props.value       - Current color value (preset key like 'blue' or hex '#ff0000')
 * @param {function} props.onChange  - Called with the new color value
 * @param {Array} props.presets      - [{ value: 'blue', hex: '#xxx', label: 'Blue' }]
 */
const ColorPicker = ({ value, onChange, presets = [] }) => {
    const isCustom = typeof value === 'string' && value.startsWith('#');
    const activeHex = isCustom
        ? value
        : (presets.find((p) => p.value === value)?.hex || '#333333');

    return html`
        <div class=${style}>
            <div class="cp-row">
                <div class="cp-group">
                    ${presets.map((p) => html`
                        <button
                            class="cp-btn ${value === p.value ? 'active' : ''}"
                            style=${{ backgroundColor: p.hex }}
                            title=${p.label}
                            onClick=${() => onChange(p.value)}
                            key=${p.value}
                        ></button>
                    `)}
                </div>
                <div class="cp-selected">
                    <div class="cp-swatch" style=${{ backgroundColor: activeHex }}></div>
                    <span class="cp-icon bi bi-pencil"></span>
                    <input
                        type="color"
                        class="cp-picker"
                        value=${activeHex}
                        onInput=${(e) => onChange(e.target.value)}
                    />
                </div>
            </div>
        </div>
    `;
};

export default ColorPicker;
