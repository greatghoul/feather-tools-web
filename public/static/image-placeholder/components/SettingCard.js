import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { css } from 'goober';
import { getText } from '~/helpers/utils.js';

const formGroupClass = css`
    margin-bottom: 1rem;
`;

const bodyClass = css`
    padding: 0;
`;

const tabContentClass = css`
    padding: 1rem;
`;

const navPillsClass = css`
    padding: 0.5rem 0.5rem 0.5rem;
    gap: 0.25rem;
    border-bottom: 1px solid #dee2e6;

    button {
        font-size: 0.875rem;
        padding: 0.3rem 0.6rem;
    }
`;

const navLinkClass = css`
    cursor: pointer;
`;

const TABS = [
    { key: 'image', labelKey: 'image-placeholder/settings/section_image' },
    { key: 'text', labelKey: 'image-placeholder/settings/section_text' },
    { key: 'border', labelKey: 'image-placeholder/settings/section_border' },
];

const SettingCard = ({ settings, onChange }) => {
    const [activeTab, setActiveTab] = useState('image');

    const handleNumChange = (key) => (e) => {
        onChange(key, parseInt(e.target.value, 10) || 0);
    };

    const handleStrChange = (key) => (e) => {
        onChange(key, e.target.value);
    };

    return html`
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">${getText('image-placeholder/settings/title')}</h5>
            </div>
            <div class="card-body ${bodyClass}">
                <ul class="nav nav-pills ${navPillsClass}" role="tablist">
                    ${TABS.map((tab) => html`
                        <li class="nav-item" role="presentation">
                            <button
                                class="nav-link ${activeTab === tab.key && 'active'} ${navLinkClass}"
                                onClick=${() => setActiveTab(tab.key)}
                                role="tab"
                            >
                                ${getText(tab.labelKey)}
                            </button>
                        </li>
                    `)}
                </ul>

                <div class="tab-content ${tabContentClass}">
                    <!-- Image -->
                    <div class="tab-pane ${activeTab === 'image' && 'active'}" role="tabpanel">
                        <div class="row">
                            <div class="col-md-6">
                                <div class=${formGroupClass}>
                                    <label for="width" class="form-label">
                                        ${getText('image-placeholder/settings/width')}
                                    </label>
                                    <input
                                        type="number"
                                        class="form-control"
                                        id="width"
                                        min="1" max="4096"
                                        value=${settings.width}
                                        onInput=${handleNumChange('width')}
                                    />
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class=${formGroupClass}>
                                    <label for="height" class="form-label">
                                        ${getText('image-placeholder/settings/height')}
                                    </label>
                                    <input
                                        type="number"
                                        class="form-control"
                                        id="height"
                                        min="1" max="4096"
                                        value=${settings.height}
                                        onInput=${handleNumChange('height')}
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class=${formGroupClass}>
                                    <label for="bgColor" class="form-label">
                                        ${getText('image-placeholder/settings/bg_color')}
                                    </label>
                                    <input
                                        type="color"
                                        class="form-control form-control-color"
                                        id="bgColor"
                                        value=${settings.bgColor}
                                        onInput=${handleStrChange('bgColor')}
                                    />
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class=${formGroupClass}>
                                    <label for="format" class="form-label">
                                        ${getText('image-placeholder/settings/format')}
                                    </label>
                                    <select class="form-select" id="format" value=${settings.format} onChange=${handleStrChange('format')}>
                                        <option value="png">PNG</option>
                                        <option value="jpeg">JPEG</option>
                                        <option value="webp">WebP</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Text -->
                    <div class="tab-pane ${activeTab === 'text' && 'active'}" role="tabpanel">
                        <div class=${formGroupClass}>
                            <label for="text" class="form-label">
                                ${getText('image-placeholder/settings/text')}
                            </label>
                            <input
                                type="text"
                                class="form-control"
                                id="text"
                                placeholder=${getText('image-placeholder/settings/text_placeholder')}
                                value=${settings.text}
                                onInput=${handleStrChange('text')}
                            />
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class=${formGroupClass}>
                                    <label for="textColor" class="form-label">
                                        ${getText('image-placeholder/settings/text_color')}
                                    </label>
                                    <input
                                        type="color"
                                        class="form-control form-control-color"
                                        id="textColor"
                                        value=${settings.textColor}
                                        onInput=${handleStrChange('textColor')}
                                    />
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class=${formGroupClass}>
                                    <label for="fontSize" class="form-label">
                                        ${getText('image-placeholder/settings/font_size')}
                                    </label>
                                    <input
                                        type="number"
                                        class="form-control"
                                        id="fontSize"
                                        min="0" max="500"
                                        placeholder=${getText('image-placeholder/settings/auto_font_size')}
                                        value=${settings.fontSize}
                                        onInput=${handleNumChange('fontSize')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Border -->
                    <div class="tab-pane ${activeTab === 'border' && 'active'}" role="tabpanel">
                        <div class="row">
                            <div class="col-md-6">
                                <div class=${formGroupClass}>
                                    <label for="borderWidth" class="form-label">
                                        ${getText('image-placeholder/settings/border_width')}
                                    </label>
                                    <input
                                        type="number"
                                        class="form-control"
                                        id="borderWidth"
                                        min="0" max="200"
                                        value=${settings.borderWidth}
                                        onInput=${handleNumChange('borderWidth')}
                                    />
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class=${formGroupClass}>
                                    <label for="borderRadius" class="form-label">
                                        ${getText('image-placeholder/settings/border_radius')}
                                    </label>
                                    <input
                                        type="number"
                                        class="form-control"
                                        id="borderRadius"
                                        min="0" max="999"
                                        value=${settings.borderRadius}
                                        onInput=${handleNumChange('borderRadius')}
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class=${formGroupClass}>
                                    <label for="borderColor" class="form-label">
                                        ${getText('image-placeholder/settings/border_color')}
                                    </label>
                                    <input
                                        type="color"
                                        class="form-control form-control-color"
                                        id="borderColor"
                                        value=${settings.borderColor}
                                        onInput=${handleStrChange('borderColor')}
                                    />
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class=${formGroupClass}>
                                    <label for="borderStyle" class="form-label">
                                        ${getText('image-placeholder/settings/border_style')}
                                    </label>
                                    <select class="form-select" id="borderStyle" value=${settings.borderStyle} onChange=${handleStrChange('borderStyle')}>
                                        <option value="solid">${getText('image-placeholder/settings/border_style_solid')}</option>
                                        <option value="dashed">${getText('image-placeholder/settings/border_style_dashed')}</option>
                                        <option value="dotted">${getText('image-placeholder/settings/border_style_dotted')}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default SettingCard;
