import { useState } from 'react';
import { t } from '~/helpers/i18n';

const InputCard = ({ onLayoutChange, selectedLayout, onYearChange, selectedYear, yearType }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => currentYear - 5 + i).reverse();

    return (
<>

        <div className="card mb-4">
            <div className="card-header">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <a className="nav-link active" href="#"><i className="bi bi-gear me-1"></i>{t('habit-tracker/settings/title')}</a>
                    </li>
                </ul>
            </div>
            <div className="card-body">
                <div className="form-group mb-3">
                    <label className="form-label">{t('habit-tracker/settings/print_layout')}</label>
                    <div className="form-check">
                        <input type="radio" id="layout-1" name="printLayout" className="form-check-input" checked={selectedLayout === 1} onChange={() => onLayoutChange(1)} />
                        <label className="form-check-label" htmlFor="layout-1">{t('habit-tracker/settings/layout_1_per_page')}</label>
                    </div>
                    <div className="form-check">
                        <input type="radio" id="layout-2" name="printLayout" className="form-check-input" checked={selectedLayout === 2} onChange={() => onLayoutChange(2)} />
                        <label className="form-check-label" htmlFor="layout-2">{t('habit-tracker/settings/layout_2_per_page')}</label>
                    </div>
                    <div className="form-check">
                        <input type="radio" id="layout-3" name="printLayout" className="form-check-input" checked={selectedLayout === 3} onChange={() => onLayoutChange(3)} />
                        <label className="form-check-label" htmlFor="layout-3">{t('habit-tracker/settings/layout_3_per_page')}</label>
                    </div>
                    <div className="form-check">
                        <input type="radio" id="layout-4" name="printLayout" className="form-check-input" checked={selectedLayout === 4} onChange={() => onLayoutChange(4)} />
                        <label className="form-check-label" htmlFor="layout-4">{t('habit-tracker/settings/layout_4_per_page')}</label>
                    </div>
                </div>

                <div className="form-group mb-3">
                    <label className="form-label">{t('habit-tracker/settings/year')}</label>
                    <div className="form-check">
                        <input type="radio" id="year-not-specific" name="yearType" className="form-check-input" checked={yearType === 'not-specific'} onChange={() => onYearChange({ type: 'not-specific' })} />
                        <label className="form-check-label" htmlFor="year-not-specific">{t('habit-tracker/settings/not_specific')}</label>
                    </div>
                    <div className="form-check">
                        <input type="radio" id="year-specific" name="yearType" className="form-check-input" checked={yearType === 'specific'} onChange={() => onYearChange({ type: 'specific', year: selectedYear || currentYear })} />
                        <label className="form-check-label" htmlFor="year-specific">{t('habit-tracker/settings/specific_year')}</label>
                    </div>
                    {yearType === 'specific' && (
<>

                        <select className="form-select form-select-sm mt-2" value={selectedYear} onChange={(e) => onYearChange({ type: 'specific', year: parseInt(e.target.value) })}>
                            {years.map(y => (
<>
<option value={y}>{y}</option>
</>
))}
                        </select>
                    
</>
)}
                </div>
            </div>
        </div>
    
</>
);
};

export default InputCard;
