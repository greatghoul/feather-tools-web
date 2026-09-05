import { t } from '~/helpers/i18n';

const mealCheckboxes = [
    { key: 'breakfast', labelKey: 'meal-planner/settings/breakfast' },
    { key: 'lunch', labelKey: 'meal-planner/settings/lunch' },
    { key: 'dinner', labelKey: 'meal-planner/settings/dinner' },
    { key: 'snack', labelKey: 'meal-planner/settings/snack' }
];

const SettingCard = ({
    title, onTitleChange,
    startOfWeek, onStartOfWeekChange,
    meals, onToggleMeal,
    showShoppingList, onShowShoppingListChange,
    showNotes, onShowNotesChange,
    onPrint, onDownload
}) => {
    return (
<>

        <div className="card mb-4">
            <div className="card-header">
                <h5 className="mb-0">{t('meal-planner/settings/card_title')}</h5>
            </div>
            <div className="card-body">
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label">{t('meal-planner/settings/title')}</label>
                        <input type="text" className="form-control" value={title} onInput={(e) => onTitleChange((e.target as HTMLInputElement).value)} />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label mb-2 d-block">{t('meal-planner/settings/start_of_week')}</label>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="weekStart" id="weekStartMon" value="monday" checked={startOfWeek === 'monday'} onChange={(e) => onStartOfWeekChange(e.target.value)} />
                            <label className="form-check-label" htmlFor="weekStartMon">{t('meal-planner/settings/monday')}</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="weekStart" id="weekStartSun" value="sunday" checked={startOfWeek === 'sunday'} onChange={(e) => onStartOfWeekChange(e.target.value)} />
                            <label className="form-check-label" htmlFor="weekStartSun">{t('meal-planner/settings/sunday')}</label>
                        </div>
                    </div>
                </div>

                <div className="row mt-3">
                    <div className="col-md-6">
                        <label className="form-label mb-2 d-block">{t('meal-planner/settings/meals_title')}</label>
                        {mealCheckboxes.map(({ key, labelKey }) => (
                            <div className="form-check form-check-inline" key={key}>
                                <input className="form-check-input" type="checkbox" id={`meal-${key}`} checked={meals[key]} onChange={() => onToggleMeal(key)} />
                                <label className="form-check-label" htmlFor={`meal-${key}`}>{t(labelKey)}</label>
                            </div>
))}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label mb-2 d-block">{t('meal-planner/settings/sections_title')}</label>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="checkbox" id="showShopping" checked={showShoppingList} onChange={(e) => onShowShoppingListChange(e.target.checked)} />
                            <label className="form-check-label" htmlFor="showShopping">{t('meal-planner/settings/show_shopping_list')}</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="checkbox" id="showNotes" checked={showNotes} onChange={(e) => onShowNotesChange(e.target.checked)} />
                            <label className="form-check-label" htmlFor="showNotes">{t('meal-planner/settings/show_notes')}</label>
                        </div>
                    </div>
                </div>

                <div className="mt-4 d-flex gap-2">
                    <button className="btn btn-outline-secondary" onClick={onDownload}>
                        <i className="bi bi-download me-1"></i>{t('common/download')}
                    </button>
                    <button className="btn btn-primary" onClick={onPrint}>
                        <i className="bi bi-printer me-1"></i>{t('common/print')}
                    </button>
                </div>
            </div>
        </div>
    
</>
);
};

export default SettingCard;
