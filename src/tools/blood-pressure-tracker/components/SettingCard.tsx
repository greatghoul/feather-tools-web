import { useState, Fragment } from 'react';
import { t } from '~/helpers/i18n';

// Date type enum
const DateType = {
  MONTHLY: 'monthly',
  BI_WEEKLY: 'bi-weekly',
  WEEKLY: 'weekly'
};

// Week start enum
const WeekStart = {
  SUNDAY: 'sunday',
  MONDAY: 'monday'
};

// Date type options for form controls
const dateTypeOptions = [
  { value: DateType.MONTHLY, labelKey: 'blood-pressure-tracker/settings/monthly', id: 'dateTypeMonth' },
  { value: DateType.WEEKLY, labelKey: 'blood-pressure-tracker/settings/weekly', id: 'dateTypeWeek' },
  { value: DateType.BI_WEEKLY, labelKey: 'blood-pressure-tracker/settings/bi_weekly', id: 'dateTypeBi-weekly' }
];

// Week start options for form controls
const weekStartOptions = [
  { value: WeekStart.SUNDAY, labelKey: 'blood-pressure-tracker/settings/sunday', id: 'weekStartSunday' },
  { value: WeekStart.MONDAY, labelKey: 'blood-pressure-tracker/settings/monday', id: 'weekStartMonday' }
];

export const defaultSettings = {
  diastolicSafe: 80,
  systolicSafe: 120,
  dateType: DateType.MONTHLY,
  weekStart: WeekStart.SUNDAY,
  blankTitle: false,
  layout: 'landscape'
};

const SettingCard = ({ onGenerate, onReset }: { onGenerate: any; onReset?: any }) => {
  // Initialize state with default values
  const [diastolicSafe, setDiastolicSafe] = useState(defaultSettings.diastolicSafe);
  const [systolicSafe, setSystolicSafe] = useState(defaultSettings.systolicSafe);
  const [dateType, setDateType] = useState(defaultSettings.dateType);
  const [weekStart, setWeekStart] = useState(defaultSettings.weekStart);
  const [blankTitle, setBlankTitle] = useState(defaultSettings.blankTitle);

  // Render a single date type option
  const renderDateTypeOption = (option) => (
<>

    <div className="form-check form-check-inline">
      <input className="form-check-input" type="radio" name="dateType" id={option.id} value={option.value} checked={dateType === option.value} onChange={() => setDateType(option.value)} />
      <label className="form-check-label" htmlFor={option.id}>
        {t(option.labelKey)}
      </label>
    </div>
  
</>
);

  // Render a single week start option
  const renderWeekStartOption = (option, disabled) => (
<>

    <div className="form-check form-check-inline">
      <input className="form-check-input" type="radio" name="weekStart" id={option.id} value={option.value} checked={weekStart === option.value} onChange={() => setWeekStart(option.value)} disabled={disabled} />
      <label className="form-check-label" htmlFor={option.id}>
        {t(option.labelKey)}
      </label>
    </div>
  
</>
);

  // Reset to default values
  const handleResetDefaults = () => {
    setDiastolicSafe(defaultSettings.diastolicSafe);
    setSystolicSafe(defaultSettings.systolicSafe);
    setDateType(defaultSettings.dateType);
    setWeekStart(defaultSettings.weekStart);
    setBlankTitle(defaultSettings.blankTitle);
  };

  // Generate chart with current settings
  const handleGenerate = () => {
    onGenerate({
      diastolicSafe,
      systolicSafe,
      dateType,
      weekStart,
      blankTitle,
      layout: defaultSettings.layout
    });
  };

  return (
<>

    <div className="card mb-4">
      <div className="card-header">
        <h5 className="mb-0">{t('blood-pressure-tracker/settings/chart_settings')}</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label mb-2 d-block">{t('blood-pressure-tracker/settings/date_range')}</label>
            {dateTypeOptions.map((option, i) => <Fragment key={i}>{renderDateTypeOption(option)}</Fragment>)}
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label mb-2 d-block">{t('blood-pressure-tracker/settings/start_of_week')}</label>
            {weekStartOptions.map((option, i) => <Fragment key={i}>{renderWeekStartOption(option, dateType === DateType.MONTHLY)}</Fragment>)}
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label d-block mb-2">{t('blood-pressure-tracker/settings/safe_diastolic_value')}</label>
            <input type="range" className="form-range" min="70" max="90" value={diastolicSafe} onInput={e => setDiastolicSafe(Number((e.target as HTMLInputElement).value))} />
              <div className="mt-2">
                <span className="form-text">{t('blood-pressure-tracker/settings/current_value')} {diastolicSafe}</span>
              </div>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label d-block mb-2">{t('blood-pressure-tracker/settings/safe_systolic_value')}</label>
            <input type="range" className="form-range" min="110" max="130" value={systolicSafe} onInput={e => setSystolicSafe(Number((e.target as HTMLInputElement).value))} />
              <div className="mt-2">
                <span className="form-text">{t('blood-pressure-tracker/settings/current_value')} {systolicSafe}</span>
              </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-12">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="blankTitle" checked={blankTitle} onChange={e => setBlankTitle(e.target.checked)} />
              <label className="form-check-label" htmlFor="blankTitle">
                {t('blood-pressure-tracker/settings/blank_title')}
              </label>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-success" onClick={handleGenerate}>
            {t('blood-pressure-tracker/button/generate_chart')}
          </button>
          <button className="btn btn-secondary" onClick={handleResetDefaults}>
            {t('blood-pressure-tracker/button/reset_to_default')}
          </button>
        </div>
      </div>
    </div>
  
</>
);
};

export default SettingCard;
