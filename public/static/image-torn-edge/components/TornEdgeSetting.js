import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';

export const DEFAULT_TORN_SETTING = {
    intensity: 5,
    roughness: 5,
    edges: 'all',
    shadowEnabled: true,
    shadowOffsetX: 3,
    shadowOffsetY: 3,
    shadowTransparency: 0.3,
    shadowBlur: 8,
};

const EDGE_OPTIONS = [
    { value: 'all', key: 'image-torn-edge/setting/edge_all', icon: 'square' },
    { value: 'top', key: 'image-torn-edge/setting/edge_top', icon: 'arrow-up' },
    { value: 'bottom', key: 'image-torn-edge/setting/edge_bottom', icon: 'arrow-down' },
    { value: 'left', key: 'image-torn-edge/setting/edge_left', icon: 'arrow-left' },
    { value: 'right', key: 'image-torn-edge/setting/edge_right', icon: 'arrow-right' },
];

const TornEdgeSetting = ({ setting, onChange }) => {
    const [formSetting, setFormSetting] = useState(setting);

    useEffect(() => {
        setFormSetting(setting);
    }, [setting])

    const handleSettingChange = (changes) => {
        const newFormSetting = { ...formSetting, ...changes };
        setFormSetting(newFormSetting);
        onChange(newFormSetting);
    };

    const getEdgeLabel = (edge) => {
        if (edge.key) return getText(edge.key);
        return edge.label;
    };

    return html`
        <div class="card-body">
            <div class="mb-3">
                <label class="form-label small text-secondary-emphasis">
                    ${getText('image-torn-edge/setting/intensity')}
                </label>
                <div class="d-flex align-items-center gap-2">
                    <input
                        type="range"
                        class="form-range flex-grow-1"
                        value=${formSetting.intensity}
                        min="1"
                        max="10"
                        step="1"
                        onChange=${(e) => handleSettingChange({ intensity: parseInt(e.target.value) })}
                    />
                    <span class="badge bg-secondary" style="min-width: 28px;">${formSetting.intensity}</span>
                </div>
            </div>

            <div class="mb-3">
                <label class="form-label small text-secondary-emphasis">
                    ${getText('image-torn-edge/setting/roughness')}
                </label>
                <div class="d-flex align-items-center gap-2">
                    <input
                        type="range"
                        class="form-range flex-grow-1"
                        value=${formSetting.roughness}
                        min="1"
                        max="10"
                        step="1"
                        onChange=${(e) => handleSettingChange({ roughness: parseInt(e.target.value) })}
                    />
                    <span class="badge bg-secondary" style="min-width: 28px;">${formSetting.roughness}</span>
                </div>
            </div>

            <div class="mb-3">
                <label class="form-label small text-secondary-emphasis">
                    ${getText('image-torn-edge/setting/edges')}
                </label>
                <div>
                    <div class="btn-group btn-group-sm d-flex flex-wrap" role="group">
                        ${EDGE_OPTIONS.map(edge => html`
                            <button
                                type="button"
                                class="btn btn-outline-secondary ${formSetting.edges === edge.value ? 'active' : ''}"
                                onClick=${() => handleSettingChange({ edges: edge.value })}
                            >
                                ${edge.icon ? html`<i class="bi bi-${edge.icon} me-1"></i>` : ''}
                                ${getEdgeLabel(edge)}
                            </button>
                        `)}
                    </div>
                </div>
            </div>

            <div class="mb-3">
                <div class="form-check form-switch">
                    <input
                        class="form-check-input"
                        type="checkbox"
                        id="shadowEnabled"
                        checked=${formSetting.shadowEnabled}
                        onChange=${(e) => handleSettingChange({ shadowEnabled: e.target.checked })}
                    />
                    <label class="form-check-label" for="shadowEnabled">
                        ${getText('image-torn-edge/setting/shadow_enabled')}
                    </label>
                </div>
            </div>

            ${formSetting.shadowEnabled && html`
                <div class="mb-3">
                    <label class="form-label small text-secondary-emphasis">
                        ${getText('image-torn-edge/setting/shadow_offset')}
                    </label>
                    <div class="row g-2">
                        <div class="col-6">
                            <div class="input-group input-group-sm">
                                <span class="input-group-text">X</span>
                                <input
                                    type="number"
                                    class="form-control"
                                    value=${formSetting.shadowOffsetX}
                                    onChange=${(e) => handleSettingChange({ shadowOffsetX: parseInt(e.target.value) || 0 })}
                                    step="1"
                                    min="-50"
                                    max="50"
                                />
                                <span class="input-group-text">px</span>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="input-group input-group-sm">
                                <span class="input-group-text">Y</span>
                                <input
                                    type="number"
                                    class="form-control"
                                    value=${formSetting.shadowOffsetY}
                                    onChange=${(e) => handleSettingChange({ shadowOffsetY: parseInt(e.target.value) || 0 })}
                                    step="1"
                                    min="-50"
                                    max="50"
                                />
                                <span class="input-group-text">px</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label small text-secondary-emphasis">
                        ${getText('image-torn-edge/setting/shadow_transparency')}
                    </label>
                    <div class="d-flex align-items-center gap-2">
                        <input
                            type="range"
                            class="form-range flex-grow-1"
                            value=${Math.round(formSetting.shadowTransparency * 100)}
                            min="0"
                            max="100"
                            step="1"
                            onChange=${(e) => handleSettingChange({ shadowTransparency: parseInt(e.target.value) / 100 })}
                        />
                        <span class="badge bg-secondary" style="min-width: 40px;">${Math.round(formSetting.shadowTransparency * 100)}%</span>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label small text-secondary-emphasis">
                        ${getText('image-torn-edge/setting/shadow_blur')}
                    </label>
                    <div class="input-group input-group-sm">
                        <input
                            type="number"
                            class="form-control"
                            value=${formSetting.shadowBlur}
                            onChange=${(e) => handleSettingChange({ shadowBlur: parseInt(e.target.value) || 0 })}
                            step="1"
                            min="0"
                            max="50"
                        />
                        <span class="input-group-text">px</span>
                    </div>
                </div>
            `}
        </div>
    `;
};

export default TornEdgeSetting;
