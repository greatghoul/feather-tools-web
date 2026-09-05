import { t } from '~/helpers/i18n';
import styles from './SettingsCard.module.css';

const SettingsCard = ({
    month, onMonthChange,
    year, onYearChange,
    startOfWeek, onStartOfWeekChange,
    lineCount, onLineCountChange,
    title, onTitleChange,
    onDownload, onPrint
}) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    return (
<>

        <div className={styles.cardStyle}>
            <div className="card">
                <div className="card-header">
                    <h5>{t('monthly-planner/settings/month_year')}</h5>
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <label className="form-label" htmlFor="monthSelect">{t('monthly-planner/settings/month')}</label>
                        <select id="monthSelect" className="form-select" value={month} onChange={(e) => onMonthChange(Number(e.target.value))}>
                            {Array.from({ length: 12 }, (_, i) => (
<>
<option value={i}>{t(`common/month/${i + 1}`)}</option>
</>
))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="yearSelect">{t('monthly-planner/settings/year')}</label>
                        <select id="yearSelect" className="form-select" value={year} onChange={(e) => onYearChange(Number(e.target.value))}>
                            {years.map(y => (
<>
<option value={y}>{y}</option>
</>
))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="startOfWeekSelect">{t('monthly-planner/settings/start_of_week')}</label>
                        <select id="startOfWeekSelect" className="form-select" value={startOfWeek} onChange={(e) => onStartOfWeekChange(e.target.value)}>
                            <option value="sunday">{t('monthly-planner/settings/sunday')}</option>
                            <option value="monday">{t('monthly-planner/settings/monday')}</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="lineCountSelect">{t('monthly-planner/settings/line_count')}</label>
                        <select id="lineCountSelect" className="form-select" value={lineCount} onChange={(e) => onLineCountChange(Number(e.target.value))}>
                            {[3, 4, 5, 6].map(n => (
<>
<option value={n}>{n}</option>
</>
))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="titleInput">{t('monthly-planner/settings/title')}</label>
                        <input type="text" id="titleInput" className="form-control" value={title} onInput={(e) => onTitleChange((e.target as HTMLInputElement).value)} />
                    </div>

                    <div className="btn-group">
                        <button className="btn-primary" onClick={onDownload}>
                            {t('monthly-planner/button/download')}
                        </button>
                        <button className="btn-secondary" onClick={onPrint}>
                            {t('monthly-planner/button/print')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    
</>
);
};

export default SettingsCard;
