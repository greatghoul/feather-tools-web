import { useState } from 'react';
import { t } from '~/helpers/i18n';

const DateType = {
    MONTHLY: 'monthly',
    BI_WEEKLY: 'bi-weekly',
    WEEKLY: 'weekly'
};

const WeekStart = {
    SUNDAY: 'sunday',
    MONDAY: 'monday'
};

const dateTypeOptions = [
    { value: DateType.WEEKLY, labelKey: 'sleep-chart/settings/weekly', id: 'dateTypeWeek' },
    { value: DateType.BI_WEEKLY, labelKey: 'sleep-chart/settings/bi_weekly', id: 'dateTypeBiWeekly' },
    { value: DateType.MONTHLY, labelKey: 'sleep-chart/settings/monthly', id: 'dateTypeMonth' }
];

const weekStartOptions = [
    { value: WeekStart.SUNDAY, labelKey: 'sleep-chart/settings/sunday', id: 'weekStartSunday' },
    { value: WeekStart.MONDAY, labelKey: 'sleep-chart/settings/monday', id: 'weekStartMonday' }
];

export const defaultSettings = {
    dateType: DateType.WEEKLY,
    weekStart: WeekStart.SUNDAY,
    timeMin: 21,
    timeSpan: 12,
    blankTitle: false,
    layout: 'portrait'
};

const hourOptions = Array.from({ length: 24 }, (_, i) => i);
const spanOptions = Array.from({ length: 7 }, (_, i) => i + 12);

const formatHour = (h) => {
    const display = h % 24;
    return `${String(display).padStart(2, '0')}:00`;
};

const SettingCard = ({ onGenerate, onReset }: { onGenerate: any; onReset?: any }) => {
    const [dateType, setDateType] = useState(defaultSettings.dateType);
    const [weekStart, setWeekStart] = useState(defaultSettings.weekStart);
    const [timeMin, setTimeMin] = useState(defaultSettings.timeMin);
    const [timeSpan, setTimeSpan] = useState(defaultSettings.timeSpan);
    const [blankTitle, setBlankTitle] = useState(defaultSettings.blankTitle);

    const renderDateTypeOption = (option) => (
        <div key={option.value} className="form-check form-check-inline">
            <input className="form-check-input" type="radio" name="dateType" id={option.id} value={option.value} checked={dateType === option.value} onChange={() => setDateType(option.value)} />
            <label className="form-check-label" htmlFor={option.id}>
                {t(option.labelKey)}
            </label>
        </div>
);

    const renderWeekStartOption = (option, disabled) => (
        <div key={option.value} className="form-check form-check-inline">
            <input className="form-check-input" type="radio" name="weekStart" id={option.id} value={option.value} checked={weekStart === option.value} onChange={() => setWeekStart(option.value)} disabled={disabled} />
            <label className="form-check-label" htmlFor={option.id}>
                {t(option.labelKey)}
            </label>
        </div>
);

    const handleResetDefaults = () => {
        setDateType(defaultSettings.dateType);
        setWeekStart(defaultSettings.weekStart);
        setTimeMin(defaultSettings.timeMin);
        setTimeSpan(defaultSettings.timeSpan);
        setBlankTitle(defaultSettings.blankTitle);
    };

    const handleGenerate = () => {
        onGenerate({
            dateType,
            weekStart,
            timeMin,
            timeMax: timeMin + timeSpan,
            blankTitle,
            layout: defaultSettings.layout
        });
    };

    return (
<>

        <div className="card mb-4">
            <div className="card-header">
                <h5 className="mb-0">{t('sleep-chart/settings/chart_settings')}</h5>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label mb-2 d-block">{t('sleep-chart/settings/date_range')}</label>
                        {dateTypeOptions.map(renderDateTypeOption)}
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label mb-2 d-block">{t('sleep-chart/settings/start_of_week')}</label>
                        {weekStartOptions.map(option => renderWeekStartOption(option, dateType === DateType.MONTHLY))}
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6 mb-3 mb-md-0">
                        <label className="form-label mb-2 d-block">{t('sleep-chart/settings/time_range')}</label>
                        <div className="d-flex align-items-center gap-2">
                            <select className="form-select form-select-sm" style={{ width: 'auto' }} value={timeMin} onChange={e => setTimeMin(Number(e.target.value))}>
                                {hourOptions.map(h => (
                                    <option key={h} value={h}>{formatHour(h)}</option>
))}
                            </select>
                            <span>—</span>
                            <select className="form-select form-select-sm" style={{ width: 'auto' }} value={timeSpan} onChange={e => setTimeSpan(Number(e.target.value))}>
                                {spanOptions.map(s => (
                                    <option key={s} value={s}>{s}h</option>
))}
                            </select>
                            <span className="text-muted small">{formatHour(timeMin + timeSpan)}</span>
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-12">
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="blankTitle" checked={blankTitle} onChange={e => setBlankTitle(e.target.checked)} />
                            <label className="form-check-label" htmlFor="blankTitle">
                                {t('sleep-chart/settings/blank_title')}
                            </label>
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button className="btn btn-success" onClick={handleGenerate}>
                        {t('sleep-chart/button/generate_chart')}
                    </button>
                    <button className="btn btn-secondary" onClick={handleResetDefaults}>
                        {t('sleep-chart/button/reset_to_default')}
                    </button>
                </div>
            </div>
        </div>
    
</>
);
};

export default SettingCard;
