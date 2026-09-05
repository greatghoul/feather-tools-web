import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

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
    return html`
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">${getText('meal-planner/settings/card_title')}</h5>
            </div>
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">${getText('meal-planner/settings/title')}</label>
                        <input
                            type="text"
                            class="form-control"
                            value=${title}
                            onInput=${(e) => onTitleChange(e.target.value)}
                        />
                    </div>

                    <div class="col-md-6">
                        <label class="form-label mb-2 d-block">${getText('meal-planner/settings/start_of_week')}</label>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="weekStart" id="weekStartMon"
                                value="monday" checked=${startOfWeek === 'monday'}
                                onChange=${(e) => onStartOfWeekChange(e.target.value)} />
                            <label class="form-check-label" for="weekStartMon">${getText('meal-planner/settings/monday')}</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="weekStart" id="weekStartSun"
                                value="sunday" checked=${startOfWeek === 'sunday'}
                                onChange=${(e) => onStartOfWeekChange(e.target.value)} />
                            <label class="form-check-label" for="weekStartSun">${getText('meal-planner/settings/sunday')}</label>
                        </div>
                    </div>
                </div>

                <div class="row mt-3">
                    <div class="col-md-6">
                        <label class="form-label mb-2 d-block">${getText('meal-planner/settings/meals_title')}</label>
                        ${mealCheckboxes.map(({ key, labelKey }) => html`
                            <div class="form-check form-check-inline" key=${key}>
                                <input class="form-check-input" type="checkbox" id="meal-${key}"
                                    checked=${meals[key]} onChange=${() => onToggleMeal(key)} />
                                <label class="form-check-label" for="meal-${key}">${getText(labelKey)}</label>
                            </div>
                        `)}
                    </div>

                    <div class="col-md-6">
                        <label class="form-label mb-2 d-block">${getText('meal-planner/settings/sections_title')}</label>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="showShopping"
                                checked=${showShoppingList} onChange=${(e) => onShowShoppingListChange(e.target.checked)} />
                            <label class="form-check-label" for="showShopping">${getText('meal-planner/settings/show_shopping_list')}</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="showNotes"
                                checked=${showNotes} onChange=${(e) => onShowNotesChange(e.target.checked)} />
                            <label class="form-check-label" for="showNotes">${getText('meal-planner/settings/show_notes')}</label>
                        </div>
                    </div>
                </div>

                <div class="mt-4 d-flex gap-2">
                    <button class="btn btn-outline-secondary" onClick=${onDownload}>
                        <i class="bi bi-download me-1"></i>${getText('common/download')}
                    </button>
                    <button class="btn btn-primary" onClick=${onPrint}>
                        <i class="bi bi-printer me-1"></i>${getText('common/print')}
                    </button>
                </div>
            </div>
        </div>
    `;
};

export default SettingCard;
