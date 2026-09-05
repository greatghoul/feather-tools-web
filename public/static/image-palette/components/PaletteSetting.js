import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

export const DEFAULT_PALETTE_SETTING = {
    colorCount: 8,
    sortBy: 'brightness'
};

const PaletteSetting = ({ setting, onChange }) => {
    const handleColorCountChange = (e) => {
        onChange({
            ...setting,
            colorCount: parseInt(e.target.value)
        });
    };

    const handleSortByChange = (e) => {
        onChange({
            ...setting,
            sortBy: e.target.value
        });
    };

    return html`
        <div class="card-body">
            <div class="mb-3">
                <label class="form-label">
                    <i class="bi bi-palette me-1"></i>
                    ${getText('image-palette/setting/color_count')}
                </label>
                <select
                    class="form-select"
                    value=${setting.colorCount}
                    onChange=${handleColorCountChange}
                >
                    <option value="4">4</option>
                    <option value="6">6</option>
                    <option value="8">8</option>
                    <option value="12">12</option>
                    <option value="16">16</option>
                    <option value="24">24</option>
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">
                    <i class="bi bi-sort-down me-1"></i>
                    ${getText('image-palette/setting/sort_by')}
                </label>
                <select
                    class="form-select"
                    value=${setting.sortBy}
                    onChange=${handleSortByChange}
                >
                    <option value="brightness">
                        ${getText('image-palette/setting/sort_brightness')}
                    </option>
                    <option value="hue">
                        ${getText('image-palette/setting/sort_hue')}
                    </option>
                </select>
            </div>
        </div>
    `;
};

export default PaletteSetting;
