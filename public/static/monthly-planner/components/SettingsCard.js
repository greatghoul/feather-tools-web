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

    .btn-group {
        display: flex;
        gap: 8px;
        margin-top: 12px;
    }

    .btn-primary, .btn-secondary {
        flex: 1;
        height: 40px;
        border: none;
        border-radius: 8px;
        font-size: 0.95rem;
        cursor: pointer;
    }

    .btn-primary {
        background: #2563eb;
        color: #fff;
    }

    .btn-primary:hover {
        background: #1d4ed8;
    }

    .btn-secondary {
        background: #e5e7eb;
        color: #374151;
    }

    .btn-secondary:hover {
        background: #d1d5db;
    }
`;

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

    return html`
        <div class=${cardStyle}>
            <div class="card">
                <div class="card-header">
                    <h5>${getText('monthly-planner/settings/month_year')}</h5>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <label class="form-label" for="monthSelect">${getText('monthly-planner/settings/month')}</label>
                        <select
                            id="monthSelect"
                            class="form-select"
                            value=${month}
                            onChange=${(e) => onMonthChange(Number(e.target.value))}
                        >
                            ${Array.from({ length: 12 }, (_, i) => html`<option value=${i}>${getText(`common/month/${i + 1}`)}</option>`)}
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label" for="yearSelect">${getText('monthly-planner/settings/year')}</label>
                        <select
                            id="yearSelect"
                            class="form-select"
                            value=${year}
                            onChange=${(e) => onYearChange(Number(e.target.value))}
                        >
                            ${years.map(y => html`<option value=${y}>${y}</option>`)}
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label" for="startOfWeekSelect">${getText('monthly-planner/settings/start_of_week')}</label>
                        <select
                            id="startOfWeekSelect"
                            class="form-select"
                            value=${startOfWeek}
                            onChange=${(e) => onStartOfWeekChange(e.target.value)}
                        >
                            <option value="sunday">${getText('monthly-planner/settings/sunday')}</option>
                            <option value="monday">${getText('monthly-planner/settings/monday')}</option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label" for="lineCountSelect">${getText('monthly-planner/settings/line_count')}</label>
                        <select
                            id="lineCountSelect"
                            class="form-select"
                            value=${lineCount}
                            onChange=${(e) => onLineCountChange(Number(e.target.value))}
                        >
                            ${[3, 4, 5, 6].map(n => html`<option value=${n}>${n}</option>`)}
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label" for="titleInput">${getText('monthly-planner/settings/title')}</label>
                        <input
                            type="text"
                            id="titleInput"
                            class="form-control"
                            value=${title}
                            onInput=${(e) => onTitleChange(e.target.value)}
                        />
                    </div>

                    <div class="btn-group">
                        <button class="btn-primary" onClick=${onDownload}>
                            ${getText('monthly-planner/button/download')}
                        </button>
                        <button class="btn-secondary" onClick=${onPrint}>
                            ${getText('monthly-planner/button/print')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default SettingsCard;
