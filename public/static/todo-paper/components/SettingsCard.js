import { html } from 'htm/preact';
import { css } from 'goober';
import { getText } from '~/helpers/utils.js';

const cardStyle = css`
    .card {
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        overflow: hidden;
    }
    
    .card-header {
        background: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
        padding: 12px 16px;
    }
    
    .card-header h5 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: #222;
    }
    
    .card-body {
        padding: 16px;
    }
    
    .form-label {
        display: block;
        font-size: 0.9rem;
        margin-bottom: 6px;
        color: #374151;
    }
    
    .form-control, .form-select {
        width: 100%;
        height: 36px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        padding: 0 10px;
        font-size: 0.92rem;
        background: #fff;
        color: #222;
    }
    
    .form-control:focus, .form-select:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    
    .form-check {
        display: flex;
        align-items: center;
        min-height: 36px;
    }
    
    .form-check-input {
        width: 16px;
        height: 16px;
        margin-right: 8px;
    }
    
    .form-check-label {
        font-size: 0.92rem;
        color: #374151;
    }
    
    .btn-primary {
        width: 100%;
        height: 40px;
        border: none;
        border-radius: 8px;
        background: #2563eb;
        color: #fff;
        font-size: 0.95rem;
        cursor: pointer;
        margin-top: 8px;
    }
    
    .btn-primary:hover {
        background: #1d4ed8;
    }
`;

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
    const minorOptions = [];
    for (let count = 1; count <= maxMinor; count += 1) {
        minorOptions.push(count);
    }

    return html`
        <div class=${cardStyle}>
            <div class="card">
                <div class="card-header">
                    <h5>${getText('todo-paper/settings/card_title')}</h5>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <label class="form-label" for="titleInput">${getText('todo-paper/settings/title')}</label>
                        <input
                            type="text"
                            id="titleInput"
                            class="form-control"
                            placeholder="${getText('todo-paper/settings/title')}"
                            value=${title}
                            onInput=${(e) => onTitleChange(e.target.value)}
                        />
                    </div>

                    <div class="mb-3">
                        <label class="form-label" for="taskPerGroupSelect">${getText('todo-paper/settings/tasks_per_group')}</label>
                        <select
                            id="taskPerGroupSelect"
                            class="form-select"
                            value=${taskPerGroup}
                            onChange=${(e) => onTaskPerGroupChange(Number(e.target.value))}
                        >
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label" for="densitySelect">${getText('todo-paper/settings/density')}</label>
                        <select
                            id="densitySelect"
                            class="form-select"
                            value=${density}
                            onChange=${(e) => onDensityChange(e.target.value)}
                        >
                            <option value="comfortable">${getText('todo-paper/settings/comfortable')}</option>
                            <option value="compact">${getText('todo-paper/settings/compact')}</option>
                        </select>
                    </div>

                    <div class="mb-3 form-check">
                        <input
                            type="checkbox"
                            id="enableMinorCheckbox"
                            class="form-check-input"
                            checked=${enableMinor}
                            onChange=${(e) => onEnableMinorChange(e.target.checked)}
                        />
                        <label class="form-check-label" for="enableMinorCheckbox">
                            ${getText('todo-paper/settings/enable_minor_tasks')}
                        </label>
                    </div>

                    ${enableMinor && html`
                        <div class="mb-3">
                            <label class="form-label" for="minorCountSelect">${getText('todo-paper/settings/minor_tasks_per_group')}</label>
                            <select
                                id="minorCountSelect"
                                class="form-select"
                                value=${minorCount}
                                onChange=${(e) => onMinorCountChange(Number(e.target.value))}
                            >
                                ${minorOptions.map(count => html`<option value=${count}>${count}</option>`)}
                            </select>
                        </div>
                    `}

                    <button class="btn-primary" onClick=${onPrint}>
                        ${getText('todo-paper/button/print')}
                    </button>
                </div>
            </div>
        </div>
    `;
};

export default SettingsCard;
