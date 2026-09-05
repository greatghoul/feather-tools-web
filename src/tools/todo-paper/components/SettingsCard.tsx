import { t } from '~/helpers/i18n';
import styles from './SettingsCard.module.css';

const SettingsCard = ({
    title,
    onTitleChange,
    taskPerGroup,
    onTaskPerGroupChange,
    enableMinor,
    onEnableMinorChange,
    minorCount,
    onMinorCountChange,
    maxMinor,
    density,
    onDensityChange,
    onPrint
}) => {
    // Generate minor options
    const minorOptions: number[] = [];
    for (let count = 1; count <= maxMinor; count += 1) {
        minorOptions.push(count);
    }

    return (
<>

        <div className={styles.cardStyle}>
            <div className="card">
                <div className="card-header">
                    <h5>{t('todo-paper/settings/card_title')}</h5>
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <label className="form-label" htmlFor="titleInput">{t('todo-paper/settings/title')}</label>
                        <input type="text" id="titleInput" className="form-control" placeholder={`${t('todo-paper/settings/title')}`} value={title} onInput={(e) => onTitleChange((e.target as HTMLInputElement).value)} />
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="taskPerGroupSelect">{t('todo-paper/settings/tasks_per_group')}</label>
                        <select id="taskPerGroupSelect" className="form-select" value={taskPerGroup} onChange={(e) => onTaskPerGroupChange(Number(e.target.value))}>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="densitySelect">{t('todo-paper/settings/density')}</label>
                        <select id="densitySelect" className="form-select" value={density} onChange={(e) => onDensityChange(e.target.value)}>
                            <option value="comfortable">{t('todo-paper/settings/comfortable')}</option>
                            <option value="compact">{t('todo-paper/settings/compact')}</option>
                        </select>
                    </div>

                    <div className="mb-3 form-check">
                        <input type="checkbox" id="enableMinorCheckbox" className="form-check-input" checked={enableMinor} onChange={(e) => onEnableMinorChange(e.target.checked)} />
                        <label className="form-check-label" htmlFor="enableMinorCheckbox">
                            {t('todo-paper/settings/enable_minor_tasks')}
                        </label>
                    </div>

                    {enableMinor && (
<>

                        <div className="mb-3">
                            <label className="form-label" htmlFor="minorCountSelect">{t('todo-paper/settings/minor_tasks_per_group')}</label>
                            <select id="minorCountSelect" className="form-select" value={minorCount} onChange={(e) => onMinorCountChange(Number(e.target.value))}>
                                {minorOptions.map(count => (
<>
<option value={count}>{count}</option>
</>
))}
                            </select>
                        </div>
                    
</>
)}

                    <button className="btn-primary" onClick={onPrint}>
                        {t('todo-paper/button/print')}
                    </button>
                </div>
            </div>
        </div>
    
</>
);
};

export default SettingsCard;
