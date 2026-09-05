import { useState } from 'react';
import { t } from '~/helpers/i18n';

// Week start enum
const WeekStart = {
  SUNDAY: 'sunday',
  MONDAY: 'monday'
};

// Week start options for form controls
const weekStartOptions = [
  { value: WeekStart.SUNDAY, labelKey: 'weight-tracker/settings/sunday', id: 'weekStartSunday' },
  { value: WeekStart.MONDAY, labelKey: 'weight-tracker/settings/monday', id: 'weekStartMonday' }
];

export const defaultSettings = {
    dateRange: 'monthly',
    weightUnit: 'kg',
    targetWeight: null,
    startDate: new Date(),
    weekStart: WeekStart.SUNDAY,
    weightRangeMin: 40,
    weightRangeMax: 100,
    customTitle: false,
    chartTitle: ''
};

const SettingCard = ({ onGenerate }) => {
    const [settings, setSettings] = useState<any>(defaultSettings);

    const handleDateRangeChange = (e) => {
        const newDateRange = e.target.value;
        let newChartTitle = settings.chartTitle;
        
        // If custom title is enabled, update the title based on new date range
        if (settings.customTitle) {
            newChartTitle = getDefaultTitle(newDateRange);
        }
        
        setSettings({ 
            ...settings, 
            dateRange: newDateRange,
            chartTitle: newChartTitle
        });
    };

    const handleWeightUnitChange = (e) => {
        setSettings({ ...settings, weightUnit: e.target.value });
    };

    const handleTargetWeightChange = (e) => {
        setSettings({ ...settings, targetWeight: parseFloat(e.target.value) || 0 });
    };

    const handleWeekStartChange = (e) => {
        setSettings({ ...settings, weekStart: e.target.value });
    };

    const handleIncludeTargetWeightChange = (e) => {
        const isChecked = e.target.checked;
        if (isChecked) {
            // When checked, set targetWeight to default value 70
            setSettings({ ...settings, targetWeight: 70 });
        } else {
            // When unchecked, set targetWeight to null
            setSettings({ ...settings, targetWeight: null });
        }
    };

    const handleWeightRangeMinChange = (e) => {
        const inputValue = parseFloat(e.target.value) || 0;
        // Automatically round down to the nearest multiple of 10
        const roundedValue = Math.floor(inputValue / 10) * 10;
        const newMin = Math.max(0, roundedValue);
        
        // Update minimum value and automatically set maximum to the largest option (Start value + 60)
        const newMax = newMin + 60;
        
        let newTargetWeight = settings.targetWeight;
        
        // If targetWeight has value and is outside the new range, adjust it to the middle value
        if (settings.targetWeight !== null) {
            if (settings.targetWeight < newMin || settings.targetWeight > newMax) {
                // Calculate the middle value (integer)
                newTargetWeight = Math.round((newMin + newMax) / 2);
            }
        }
        
        setSettings({ 
            ...settings, 
            weightRangeMin: newMin,
            weightRangeMax: newMax,
            targetWeight: newTargetWeight
        });
    };

    const handleWeightRangeMaxChange = (e) => {
        const newMax = parseFloat(e.target.value) || 0;
        
        let newTargetWeight = settings.targetWeight;
        
        // If targetWeight has value and is outside the new range, adjust it to the middle value
        if (settings.targetWeight !== null) {
            if (settings.targetWeight < settings.weightRangeMin || settings.targetWeight > newMax) {
                // Calculate the middle value (integer)
                newTargetWeight = Math.round((settings.weightRangeMin + newMax) / 2);
            }
        }
        
        setSettings({ 
            ...settings, 
            weightRangeMax: newMax,
            targetWeight: newTargetWeight
        });
    };

    const handleCustomTitleChange = (e) => {
        const isChecked = e.target.checked;
        let newChartTitle = settings.chartTitle;
        
        if (isChecked && !newChartTitle) {
            // When checked and no title set, set default title based on date range
            newChartTitle = getDefaultTitle(settings.dateRange);
        }
        
        setSettings({ 
            ...settings, 
            customTitle: isChecked,
            chartTitle: newChartTitle
        });
    };

    const handleChartTitleChange = (e) => {
        setSettings({ ...settings, chartTitle: e.target.value });
    };

    // Get default title based on date range
    const getDefaultTitle = (dateRange) => {
        switch (dateRange) {
            case 'weekly':
                return 'Weekly Weight Tracking';
            case 'biweekly':
                return 'Bi-weekly Weight Tracking';
            case 'monthly':
            default:
                return 'Monthly Weight Tracking';
        }
    };

    const handleGenerate = () => {
        onGenerate(settings);
    };

    return (
<>

        <div className="card mb-4">
            <div className="card-header">
                <h5 className="mb-0">{t('weight-tracker/settings/settings')}</h5>
            </div>
            <div className="card-body">
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label mb-2 d-block">{t('weight-tracker/settings/date_range')}</label>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="dateRange" id="dateRangeMonthly" value="monthly" checked={settings.dateRange === 'monthly'} onChange={handleDateRangeChange} />
                            <label className="form-check-label" htmlFor="dateRangeMonthly">{t('weight-tracker/settings/monthly')}</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="dateRange" id="dateRangeWeekly" value="weekly" checked={settings.dateRange === 'weekly'} onChange={handleDateRangeChange} />
                            <label className="form-check-label" htmlFor="dateRangeWeekly">{t('weight-tracker/settings/weekly')}</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="dateRange" id="dateRangeBiweekly" value="biweekly" checked={settings.dateRange === 'biweekly'} onChange={handleDateRangeChange} />
                            <label className="form-check-label" htmlFor="dateRangeBiweekly">{t('weight-tracker/settings/bi_weekly')}</label>
                        </div>
                    </div>
                    
                    <div className="col-md-6">
                        <label className="form-label mb-2 d-block">{t('weight-tracker/settings/start_of_week')}</label>
                        <div>
                            {weekStartOptions.map(option => (
<>

                                <div className="form-check form-check-inline">
                                    <input className="form-check-input" type="radio" name="weekStart" id={`${option.id}`} value={`${option.value}`} checked={settings.weekStart === option.value} onChange={handleWeekStartChange} disabled={settings.dateRange === 'monthly'} />
                                    <label className={`form-check-label ${settings.dateRange === 'monthly' ? 'text-muted' : ''}`} htmlFor={`${option.id}`}>
                                        {t(option.labelKey)}
                                    </label>
                                </div>
                            
</>
))}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label mb-2 d-block">{t('weight-tracker/settings/weight_unit')}</label>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="weightUnit" id="weightUnitKg" value="kg" checked={settings.weightUnit === 'kg'} onChange={handleWeightUnitChange} />
                            <label className="form-check-label" htmlFor="weightUnitKg">{t('weight-tracker/settings/kilograms')}</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="weightUnit" id="weightUnitLb" value="lb" checked={settings.weightUnit === 'lb'} onChange={handleWeightUnitChange} />
                            <label className="form-check-label" htmlFor="weightUnitLb">{t('weight-tracker/settings/pounds')}</label>
                        </div>
                    </div>
                    
                    <div className="col-md-6">
                        <label className="form-label">{t('weight-tracker/settings/weight_range')} ({settings.weightUnit})</label>
                        <div className="input-group">
                            <input type="text" className="form-control" value={settings.weightRangeMin} onChange={handleWeightRangeMinChange} placeholder={`${t('weight-tracker/settings/start')}`} />
                            <span className="input-group-text">-</span>
                            <select className="form-select" value={settings.weightRangeMax} onChange={handleWeightRangeMaxChange}>
                                {(() => {
                                    const start = settings.weightRangeMin;
                                    const options: any[] = [];
                                    for (let i = 1; i <= 6; i++) {
                                        const value = start + i * 10;
                                        options.push((
<>
<option value={value}>{value}</option>
</>
));
                                    }
                                    return options;
                                })()}
                            </select>
                        </div>
                    </div>

                    <div className={`${settings.targetWeight === null ? 'col-md-12' : 'col-md-6'}`}>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="includeTargetWeight" checked={settings.targetWeight !== null} onChange={handleIncludeTargetWeightChange} />
                            <label className="form-check-label" htmlFor="includeTargetWeight">
                                {t('weight-tracker/settings/target_weight')}{settings.targetWeight !== null ? ' (' + settings.targetWeight + ' ' + settings.weightUnit + ')' : ''}
                            </label>
                        </div>
                    </div>

                    {settings.targetWeight !== null && (
<>

                        <div className="col-md-6">
                            <input type="range" className="form-range" value={settings.targetWeight} onInput={handleTargetWeightChange} onChange={handleTargetWeightChange} min={settings.weightRangeMin} max={settings.weightRangeMax} step="1" />
                        </div>
                    
</>
)}

                    <div className={`${settings.customTitle ? 'col-md-6' : 'col-md-12'}`}>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="customChartTitle" checked={settings.customTitle} onChange={handleCustomTitleChange} />
                            <label className="form-check-label" htmlFor="customChartTitle">
                                {t('weight-tracker/settings/custom_chart_title')}
                            </label>
                        </div>
                    </div>

                    {settings.customTitle && (
<>

                        <div className="col-md-6">
                            <input type="text" className="form-control" value={settings.chartTitle} onChange={handleChartTitleChange} placeholder={`${t('weight-tracker/settings/enter_custom_chart_title')}`} />
                        </div>
                    
</>
)}
                </div>

                <div className="mt-4">
                    <button className="btn btn-primary" onClick={handleGenerate}>
                        {t('weight-tracker/button/generate_chart')}
                    </button>
                </div>
            </div>
        </div>
    
</>
);
};

export default SettingCard;
