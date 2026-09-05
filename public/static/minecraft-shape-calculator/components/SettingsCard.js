import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const clampNumber = (value, min, max) => {
    const n = Number(value);
    if (!Number.isFinite(n)) {
        return String(min);
    }
    return String(Math.min(max, Math.max(min, Math.round(n))));
};

const SettingsCard = ({ shape, onShapeChange, mode, onModeChange, diameter, onDiameterChange, width, onWidthChange, height, onHeightChange, cornerRadius, maxCornerRadius, onCornerRadiusChange, thickness, maxThickness, onThicknessChange, onCalculate }) => {
    return html`
        <div class="card">
            <div class="card-header bg-light">
                <ul class="nav nav-tabs card-header-tabs">
                    <li class="nav-item">
                        <a class="nav-link active" href="#">
                            <i class="bi bi-grid-3x3-gap me-1"></i>${getText('minecraft-shape-calculator/settings/title')}
                        </a>
                    </li>
                </ul>
            </div>
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-12">
                        <label class="form-label small mb-1">${getText('minecraft-shape-calculator/settings/shape')}</label>
                        <div class="d-flex gap-4 flex-wrap">
                            <div class="form-check">
                                <input
                                    class="form-check-input"
                                    type="radio"
                                    id="shape-circle"
                                    name="shape"
                                    value="circle"
                                    checked=${shape === 'circle'}
                                    onChange=${(e) => onShapeChange(e.target.value)}
                                />
                                <label class="form-check-label small" for="shape-circle">${getText('minecraft-shape-calculator/settings/circle')}</label>
                            </div>
                            <div class="form-check">
                                <input
                                    class="form-check-input"
                                    type="radio"
                                    id="shape-rounded-rectangle"
                                    name="shape"
                                    value="rounded_rectangle"
                                    checked=${shape === 'rounded_rectangle'}
                                    onChange=${(e) => onShapeChange(e.target.value)}
                                />
                                <label class="form-check-label small" for="shape-rounded-rectangle">${getText('minecraft-shape-calculator/settings/rounded_rectangle')}</label>
                            </div>
                        </div>
                    </div>
                    <div class="col-12">
                        <label class="form-label small mb-1">${getText('minecraft-shape-calculator/settings/mode')}</label>
                        <div class="d-flex gap-4 flex-wrap">
                            <div class="form-check">
                                <input
                                    class="form-check-input"
                                    type="radio"
                                    id="mode-solid"
                                    name="mode"
                                    value="solid"
                                    checked=${mode === 'solid'}
                                    onChange=${(e) => onModeChange(e.target.value)}
                                />
                                <label class="form-check-label small" for="mode-solid">${getText('minecraft-shape-calculator/settings/solid')}</label>
                            </div>
                            <div class="form-check">
                                <input
                                    class="form-check-input"
                                    type="radio"
                                    id="mode-outline"
                                    name="mode"
                                    value="outline"
                                    checked=${mode === 'outline'}
                                    onChange=${(e) => onModeChange(e.target.value)}
                                />
                                <label class="form-check-label small" for="mode-outline">${getText('minecraft-shape-calculator/settings/outline')}</label>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 ${shape === 'circle' ? '' : 'd-none'}">
                        <label class="form-label small mb-1">${getText('minecraft-shape-calculator/settings/diameter')}</label>
                        <input
                            type="number"
                            class="form-control form-control-sm"
                            min="3"
                            max="100"
                            step="1"
                            value=${diameter}
                            onInput=${(e) => onDiameterChange(e.target.value)}
                            onBlur=${(e) => onDiameterChange(clampNumber(e.target.value, 3, 100))}
                        />
                    </div>
                    <div class="col-12 ${shape === 'circle' ? 'd-none' : ''}">
                        <label class="form-label small mb-1">${getText('minecraft-shape-calculator/settings/width')}</label>
                        <input
                            type="number"
                            class="form-control form-control-sm"
                            min="3"
                            max="200"
                            step="1"
                            value=${width}
                            onInput=${(e) => onWidthChange(e.target.value)}
                            onBlur=${(e) => onWidthChange(clampNumber(e.target.value, 3, 200))}
                        />
                    </div>
                    <div class="col-12 ${shape === 'circle' ? 'd-none' : ''}">
                        <label class="form-label small mb-1">${getText('minecraft-shape-calculator/settings/height')}</label>
                        <input
                            type="number"
                            class="form-control form-control-sm"
                            min="3"
                            max="200"
                            step="1"
                            value=${height}
                            onInput=${(e) => onHeightChange(e.target.value)}
                            onBlur=${(e) => onHeightChange(clampNumber(e.target.value, 3, 200))}
                        />
                    </div>
                    <div class="col-12 ${shape === 'circle' ? 'd-none' : ''}">
                        <label class="form-label small mb-1">
                            ${getText('minecraft-shape-calculator/settings/corner_radius')}: ${cornerRadius}
                        </label>
                        <input
                            type="range"
                            class="form-range"
                            min="1"
                            max=${maxCornerRadius}
                            step="1"
                            value=${cornerRadius}
                            onInput=${(e) => onCornerRadiusChange(e.target.value)}
                        />
                    </div>
                    <div class="col-12 ${mode === 'outline' ? '' : 'd-none'}">
                        <label class="form-label small mb-1">
                            ${getText('minecraft-shape-calculator/settings/thickness')}: ${thickness}
                        </label>
                        <input
                            type="range"
                            class="form-range"
                            min="1"
                            max=${maxThickness}
                            step="1"
                            value=${thickness}
                            onInput=${(e) => onThicknessChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <div class="card-footer bg-light">
                <button class="btn btn-primary w-100" onClick=${onCalculate}>
                    <i class="bi bi-calculator me-1"></i>${getText('minecraft-shape-calculator/settings/calculate')}
                </button>
            </div>
        </div>
    `;
};

export default SettingsCard;
