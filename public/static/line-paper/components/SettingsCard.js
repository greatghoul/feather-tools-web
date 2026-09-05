import { html } from 'htm/preact';
import { css } from 'goober';
import { getText } from '~/helpers/utils.js';
import ColorPicker from '~/components/ColorPicker.js';

const cardStyle = css`
    .card {
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        overflow: hidden;
    }

    .card-header h5 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: #222;
    }

    .card-body {
        padding: 16px;
    }

    .form-label {
        display: block;
        font-size: 0.9rem;
        margin-bottom: 6px;
        color: #374151;
    }

    .form-control, .form-select {
        width: 100%;
        height: 36px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        padding: 0 10px;
        font-size: 0.92rem;
        background: #fff;
        color: #222;
    }

    .form-control:focus, .form-select:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .form-check {
        display: flex;
        align-items: center;
        min-height: 36px;
    }

    .form-check-input {
        width: 16px;
        height: 16px;
        margin-right: 8px;
    }

    .form-check-label {
        font-size: 0.92rem;
        color: #374151;
    }

    .btn-primary {
        width: 100%;
        height: 40px;
        border: none;
        border-radius: 8px;
        background: #2563eb;
        color: #fff;
        font-size: 0.95rem;
        cursor: pointer;
        margin-top: 8px;
    }

    .btn-primary:hover {
        background: #1d4ed8;
    }
`;

const sliderStyle = css`
    input[type=range] {
        flex: 1;
        min-width: 0;
        height: 6px;
        -webkit-appearance: none;
        appearance: none;
        background: #d1d5db;
        border-radius: 3px;
        outline: none;
        cursor: pointer;
    }

    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #2563eb;
        cursor: pointer;
        border: 2px solid #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    input[type=range]::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #2563eb;
        cursor: pointer;
        border: 2px solid #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .range-value {
        font-size: 0.92rem;
        font-weight: 600;
        color: #2563eb;
        min-width: 36px;
        text-align: right;
    }

    .range-row {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: nowrap;
    }

    .range-value {
        flex-shrink: 0;
    }
`;

const SettingsCard = ({
    lineColor,
    onLineColorChange,
    presetColors,
    lineHeight,
    onLineHeightChange,
    paddingVertical,
    onPaddingVerticalChange,
    paddingHorizontal,
    onPaddingHorizontalChange,
    marginOptions,
    orientation,
    onOrientationChange,
    orientationOptions,
}) => {
    return html`
        <div class=${cardStyle}>
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <ul class="nav nav-tabs card-header-tabs">
                        <li class="nav-item">
                            <a class="nav-link active" href="#">
                                <i class="bi bi-gear me-1"></i>${getText('line-paper/settings/card_title')}
                            </a>
                        </li>
                    </ul>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <label class="form-label">${getText('line-paper/settings/line_color')}</label>
                        <${ColorPicker}
                            value=${lineColor}
                            onChange=${onLineColorChange}
                            presets=${presetColors}
                        />
                    </div>
                    <div class="mb-3">
                        <label class="form-label" for="lineHeightSlider">${getText('line-paper/settings/line_height')}</label>
                        <div class=${sliderStyle}>
                            <div class="range-row">
                                <input
                                    type="range"
                                    id="lineHeightSlider"
                                    min="5"
                                    max="20"
                                    step="1"
                                    value=${lineHeight}
                                    onInput=${(e) => onLineHeightChange(Number(e.target.value))}
                                />
                                <span class="range-value">${lineHeight}mm</span>
                            </div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label" for="orientationSelect">${getText('line-paper/settings/orientation')}</label>
                        <select
                            id="orientationSelect"
                            class="form-select"
                            value=${orientation}
                            onChange=${(e) => onOrientationChange(e.target.value)}
                        >
                            ${orientationOptions.map(opt => html`
                                <option value=${opt.value}>${opt.label}</option>
                            `)}
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label" for="paddingVerticalSelect">${getText('line-paper/settings/padding_vertical')}</label>
                        <select
                            id="paddingVerticalSelect"
                            class="form-select"
                            value=${paddingVertical}
                            onChange=${(e) => onPaddingVerticalChange(e.target.value)}
                        >
                            ${marginOptions.map(opt => html`
                                <option value=${opt.value}>${opt.label}</option>
                            `)}
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label" for="paddingHorizontalSelect">${getText('line-paper/settings/padding_horizontal')}</label>
                        <select
                            id="paddingHorizontalSelect"
                            class="form-select"
                            value=${paddingHorizontal}
                            onChange=${(e) => onPaddingHorizontalChange(e.target.value)}
                        >
                            ${marginOptions.map(opt => html`
                                <option value=${opt.value}>${opt.label}</option>
                            `)}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default SettingsCard;
