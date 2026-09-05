import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const DIFFICULTIES = [
    { value: 'easy', key: 'sudoku-generator/settings/difficulty_easy' },
    { value: 'medium', key: 'sudoku-generator/settings/difficulty_medium' },
    { value: 'hard', key: 'sudoku-generator/settings/difficulty_hard' },
];

const PER_ROW_OPTIONS = [2, 3];

const SettingsCard = ({ difficulty, perRow, isGenerating, onDifficultyChange, onPerRowChange, onGenerate }) => {
    return html`
        <div class="card mb-4">
            <div class="card-header">
                <ul class="nav nav-tabs card-header-tabs">
                    <li class="nav-item">
                        <a class="nav-link active" href="#"><i class="bi bi-gear me-1"></i>${getText('sudoku-generator/settings/title')}</a>
                    </li>
                </ul>
            </div>
            <div class="card-body">
                <div class="form-group mb-3">
                    <label class="form-label">${getText('sudoku-generator/settings/difficulty')}</label>
                    <div class="btn-group w-100" role="group">
                        ${DIFFICULTIES.map((item) => html`
                            <input
                                type="radio"
                                class="btn-check"
                                id=${`difficulty-${item.value}`}
                                name="difficulty"
                                value=${item.value}
                                checked=${difficulty === item.value}
                                onChange=${() => onDifficultyChange(item.value)}
                            />
                            <label class="btn btn-outline-primary btn-sm" for=${`difficulty-${item.value}`}>${getText(item.key)}</label>
                        `)}
                    </div>
                </div>

                <div class="form-group mb-3">
                    <label class="form-label">${getText('sudoku-generator/settings/per_row')}</label>
                    <div class="btn-group w-100" role="group">
                        ${PER_ROW_OPTIONS.map((value) => html`
                            <input
                                type="radio"
                                class="btn-check"
                                id=${`per-row-${value}`}
                                name="perRow"
                                value=${value}
                                checked=${perRow === value}
                                onChange=${() => onPerRowChange(value)}
                            />
                            <label class="btn btn-outline-primary btn-sm" for=${`per-row-${value}`}>${value}</label>
                        `)}
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary w-100" onClick=${onGenerate} disabled=${isGenerating}>
                    ${isGenerating ? getText('sudoku-generator/message/generating') : getText('sudoku-generator/button/generate')}
                </button>
            </div>
        </div>
    `;
};

export default SettingsCard;
