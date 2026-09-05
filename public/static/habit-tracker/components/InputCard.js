import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';

const InputCard = ({ onLayoutChange, selectedLayout, onYearChange, selectedYear, yearType }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => currentYear - 5 + i).reverse();

    return html`
        <div class="card mb-4">
            <div class="card-header">
                <ul class="nav nav-tabs card-header-tabs">
                    <li class="nav-item">
                        <a class="nav-link active" href="#"><i class="bi bi-gear me-1"></i>${getText('habit-tracker/settings/title')}</a>
                    </li>
                </ul>
            </div>
            <div class="card-body">
                <div class="form-group mb-3">
                    <label class="form-label">${getText('habit-tracker/settings/print_layout')}</label>
                    <div class="form-check">
                        <input 
                            type="radio" 
                            id="layout-1" 
                            name="printLayout" 
                            class="form-check-input" 
                            checked=${selectedLayout === 1} 
                            onChange=${() => onLayoutChange(1)}
                        />
                        <label class="form-check-label" for="layout-1">${getText('habit-tracker/settings/layout_1_per_page')}</label>
                    </div>
                    <div class="form-check">
                        <input 
                            type="radio" 
                            id="layout-2" 
                            name="printLayout" 
                            class="form-check-input" 
                            checked=${selectedLayout === 2} 
                            onChange=${() => onLayoutChange(2)}
                        />
                        <label class="form-check-label" for="layout-2">${getText('habit-tracker/settings/layout_2_per_page')}</label>
                    </div>
                    <div class="form-check">
                        <input 
                            type="radio" 
                            id="layout-3" 
                            name="printLayout" 
                            class="form-check-input" 
                            checked=${selectedLayout === 3} 
                            onChange=${() => onLayoutChange(3)}
                        />
                        <label class="form-check-label" for="layout-3">${getText('habit-tracker/settings/layout_3_per_page')}</label>
                    </div>
                    <div class="form-check">
                        <input 
                            type="radio" 
                            id="layout-4" 
                            name="printLayout" 
                            class="form-check-input" 
                            checked=${selectedLayout === 4} 
                            onChange=${() => onLayoutChange(4)}
                        />
                        <label class="form-check-label" for="layout-4">${getText('habit-tracker/settings/layout_4_per_page')}</label>
                    </div>
                </div>

                <div class="form-group mb-3">
                    <label class="form-label">${getText('habit-tracker/settings/year')}</label>
                    <div class="form-check">
                        <input 
                            type="radio" 
                            id="year-not-specific" 
                            name="yearType" 
                            class="form-check-input" 
                            checked=${yearType === 'not-specific'} 
                            onChange=${() => onYearChange({ type: 'not-specific' })}
                        />
                        <label class="form-check-label" for="year-not-specific">${getText('habit-tracker/settings/not_specific')}</label>
                    </div>
                    <div class="form-check">
                        <input 
                            type="radio" 
                            id="year-specific" 
                            name="yearType" 
                            class="form-check-input" 
                            checked=${yearType === 'specific'} 
                            onChange=${() => onYearChange({ type: 'specific', year: selectedYear || currentYear })}
                        />
                        <label class="form-check-label" for="year-specific">${getText('habit-tracker/settings/specific_year')}</label>
                    </div>
                    ${yearType === 'specific' && html`
                        <select 
                            class="form-select form-select-sm mt-2"
                            value=${selectedYear}
                            onChange=${(e) => onYearChange({ type: 'specific', year: parseInt(e.target.value) })}
                        >
                            ${years.map(y => html`<option value=${y}>${y}</option>`)}
                        </select>
                    `}
                </div>
            </div>
        </div>
    `;
};

export default InputCard;