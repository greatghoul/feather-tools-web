import { html } from 'htm/preact';
import { css } from 'goober';
import { getText } from '~/helpers/utils.js';

const directionRadioStyle = css`
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const settingsCardStyle = css`
    margin-bottom: 1.5rem;
`;

export const DEFAULT_SETTINGS = {
    direction: 'vertical', // 'horizontal' or 'vertical'
    width: 'max',          // 'max', 'min', or number value
    height: 'auto',        // 'auto', 'max', 'min', or number value
    bgColor: '#cccadb',    // background color
    margin: 10,             // margin in pixels
    padding: 10            // padding between images in pixels
};

const SettingsForm = ({ settings, sizes, disabled, onSettingsChange }) => {
    const handleDirectionChange = (direction) => {
        // 当切换合并方向时，自动设置对应的width和height值
        const newSettings = {
            ...settings,
            direction: direction
        };
        
        // 垂直模式下：width可选值为max/min/数值，height设为auto
        if (direction === 'vertical') {
            newSettings.width = 'max';
            newSettings.height = 'auto';
        }
        // 水平模式下：width设为auto，height可选值为max/min/数值
        else if (direction === 'horizontal') {
            newSettings.width = 'auto';
            newSettings.height = 'max';
        }
        
        onSettingsChange(newSettings);
    };

    const handleWidthChange = (value) => {
        onSettingsChange({
            ...settings,
            width: value
        });
    };

    const handleHeightChange = (value) => {
        onSettingsChange({
            ...settings,
            height: value
        });
    };

    const handleFixedWidthInputChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        onSettingsChange({
            ...settings,
            width: value
        });
    };

    const handleFixedHeightInputChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        onSettingsChange({
            ...settings,
            height: value
        });
    };

    const handleMarginChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        onSettingsChange({
            ...settings,
            margin: value
        });
    };

    const handlePaddingChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        onSettingsChange({
            ...settings,
            padding: value
        });
    };

    const handleBgColorChange = (e) => {
        onSettingsChange({
            ...settings,
            bgColor: e.target.value
        });
    };

    const isVertical = settings.direction === 'vertical';

    return html`
        <div class="settings-form ${settingsCardStyle}">
            <!-- Merge Direction -->
            <div class="mb-4">
                <label class="form-label mb-2">${getText('merge-images/setting/merge_direction')}</label>
                <div class=${directionRadioStyle}>
                    <div class="form-check form-check-inline">
                        <input 
                            type="radio" 
                            id="direction-vertical" 
                            name="direction" 
                            value="vertical"
                            class="form-check-input"
                            checked=${settings.direction === 'vertical'}
                            onChange=${() => handleDirectionChange('vertical')}
                            disabled=${disabled}
                        />
                        <label for="direction-vertical">${getText('merge-images/direction/vertical')}</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input 
                            type="radio" 
                            id="direction-horizontal" 
                            name="direction" 
                            value="horizontal"
                            class="form-check-input"
                            checked=${settings.direction === 'horizontal'}
                            onChange=${() => handleDirectionChange('horizontal')}
                            disabled=${disabled}
                        />
                        <label for="direction-horizontal">${getText('merge-images/direction/horizontal')}</label>
                    </div>
                </div>
            </div>

            <!-- Image Width Settings (Visible only in vertical mode) -->
            ${isVertical && html`
                <div class="mb-4">
                    <label class="form-label mb-2">${getText('merge-images/setting/image_width')}</label>
                    <div class="mb-2">
                        <div class="form-check">
                            <input 
                                type="radio" 
                                id="width-max" 
                                name="width" 
                                value="max"
                                checked=${settings.width === 'max'}
                                onChange=${() => handleWidthChange('max')}
                                disabled=${disabled}
                                class="form-check-input"
                            />
                            <label for="width-max" class="form-check-label">${getText('merge-images/setting/use_max_width')} (${sizes.maxWidth}px)</label>
                        </div>
                        <div class="form-check">
                            <input 
                                type="radio" 
                                id="width-min" 
                                name="width" 
                                value="min"
                                checked=${settings.width === 'min'}
                                onChange=${() => handleWidthChange('min')}
                                disabled=${disabled}
                                class="form-check-input"
                            />
                            <label for="width-min" class="form-check-label">${getText('merge-images/setting/use_min_width')} (${sizes.minWidth}px)</label>
                        </div>
                        <div class="form-check">
                            <input 
                                type="radio" 
                                id="width-fixed" 
                                name="width" 
                                value="fixed"
                                checked=${typeof settings.width === 'number'}
                                onChange=${() => handleWidthChange(sizes.maxWidth)}
                                disabled=${disabled}
                                class="form-check-input"
                            />
                            <label for="width-fixed" class="form-check-label">${getText('merge-images/setting/use_fixed_width')}</label>
                        </div>
                        ${typeof settings.width === 'number' && html`
                            <div class="ms-4 mt-1">
                                <input 
                                    type="number" 
                                    class="form-control" 
                                    placeholder="${getText('merge-images/placeholder/fixed_width')}"
                                    value=${settings.width || ''}
                                    onChange=${handleFixedWidthInputChange}
                                    disabled=${disabled}
                                    min="1"
                                />
                            </div>
                        `}
                    </div>
                </div>
            `}

            <!-- Image Height Settings (Visible only in horizontal mode) -->
            ${!isVertical && html`
                <div class="mb-4">
                    <label class="form-label mb-2">${getText('merge-images/setting/image_height')}</label>
                    <div class="mb-2">
                        <div class="form-check">
                            <input 
                                type="radio" 
                                id="height-max" 
                                name="height" 
                                value="max"
                                checked=${settings.height === 'max'}
                                onChange=${() => handleHeightChange('max')}
                                disabled=${disabled}
                                class="form-check-input"
                            />
                            <label for="height-max" class="form-check-label">${getText('merge-images/setting/use_max_height')} (${sizes.maxHeight}px)</label>
                        </div>
                        <div class="form-check">
                            <input 
                                type="radio" 
                                id="height-min" 
                                name="height" 
                                value="min"
                                checked=${settings.height === 'min'}
                                onChange=${() => handleHeightChange('min')}
                                disabled=${disabled}
                                class="form-check-input"
                            />
                            <label for="height-min" class="form-check-label">${getText('merge-images/setting/use_min_height')} (${sizes.minHeight}px)</label>
                        </div>
                        <div class="form-check">
                            <input 
                                type="radio" 
                                id="height-fixed" 
                                name="height" 
                                value="fixed"
                                checked=${typeof settings.height === 'number'}
                                onChange=${() => handleHeightChange(sizes.maxHeight)}
                                disabled=${disabled}
                                class="form-check-input"
                            />
                            <label for="height-fixed" class="form-check-label">${getText('merge-images/setting/use_fixed_height')}</label>
                        </div>
                        ${typeof settings.height === 'number' && html`
                            <div class="ms-4 mt-1">
                                <input 
                                    type="number" 
                                    class="form-control" 
                                    placeholder="${getText('merge-images/placeholder/fixed_height')}"
                                    value=${settings.height || ''}
                                    onChange=${handleFixedHeightInputChange}
                                    disabled=${disabled}
                                    min="1"
                                />
                            </div>
                        `}
                    </div>
                </div>
            `}

            <!-- Margin -->
            <div class="mb-4">
                <label class="form-label mb-2">${getText('merge-images/setting/margin')}</label>
                <input 
                    type="number" 
                    class="form-control" 
                    placeholder="${getText('merge-images/placeholder/margin')}"
                    value=${settings.margin}
                    onChange=${handleMarginChange}
                    disabled=${disabled}
                    min="0"
                />
                <small class="form-text text-muted">${getText('merge-images/setting/margin_hint')}</small>
            </div>

            <!-- Padding -->
            <div class="mb-4">
                <label class="form-label mb-2">${getText('merge-images/setting/padding')}</label>
                <input 
                    type="number" 
                    class="form-control" 
                    placeholder="${getText('merge-images/placeholder/padding')}"
                    value=${settings.padding}
                    onChange=${handlePaddingChange}
                    disabled=${disabled}
                    min="0"
                />
                <small class="form-text text-muted">${getText('merge-images/setting/padding_hint')}</small>
            </div>

            <!-- Background Color -->
            <div class="mb-4">
                <label class="form-label mb-2">${getText('merge-images/setting/background_color')}</label>
                <input 
                    type="color" 
                    class="form-control form-control-color" 
                    value=${settings.bgColor}
                    onChange=${handleBgColorChange}
                    disabled=${disabled}
                />
                <small class="form-text text-muted">${getText('merge-images/setting/background_color_hint')}</small>
            </div>
        </div>
    `;
};

export default SettingsForm;