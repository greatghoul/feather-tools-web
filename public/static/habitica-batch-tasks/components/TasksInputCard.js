import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const TasksInputCard = ({
    mode,
    onModeChange,
    tasksText,
    onTasksTextChange,
    taskTitle,
    onTaskTitleChange,
    checklistText,
    onChecklistTextChange,
    type,
    onTypeChange,
    creating,
    onCreate,
    onClear,
    onLoadExample
}) => {
    const taskCount = tasksText.split('\n').filter((line) => line.trim()).length;
    const checklistCount = checklistText.split('\n').filter((line) => line.trim()).length;

    return html`
        <div class="card">
            <div class="card-header">
                <ul class="nav nav-tabs card-header-tabs">
                    <li class="nav-item">
                        <button class="nav-link ${mode === 'tasks' ? 'active' : ''}"
                                aria-current=${mode === 'tasks' ? 'true' : undefined}
                                onClick=${() => onModeChange('tasks')}
                                disabled=${creating}>
                            ${getText('habitica-batch-tasks/tab/tasks')}
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link ${mode === 'subtasks' ? 'active' : ''}"
                                aria-current=${mode === 'subtasks' ? 'true' : undefined}
                                onClick=${() => onModeChange('subtasks')}
                                disabled=${creating}>
                            ${getText('habitica-batch-tasks/tab/subtasks')}
                        </button>
                    </li>
                </ul>
            </div>

            <div class="card-body">
                ${mode === 'tasks' && html`
                    <textarea
                        class="form-control"
                        style="min-height: 200px; resize: vertical;"
                        placeholder=${getText('habitica-batch-tasks/input/placeholder')}
                        value=${tasksText}
                        disabled=${creating}
                        onInput=${(e) => onTasksTextChange(e.target.value)}
                    ></textarea>
                `}

                ${mode === 'subtasks' && html`
                    <div>
                        <label class="form-label small mb-1">
                            ${getText('habitica-batch-tasks/options/task_title')}
                        </label>
                        <input type="text" class="form-control form-control-sm mb-3"
                               placeholder=${getText('habitica-batch-tasks/options/task_title_placeholder')}
                               value=${taskTitle}
                               disabled=${creating}
                               onInput=${(e) => onTaskTitleChange(e.target.value)} />
                        <label class="form-label small mb-1">
                            ${getText('habitica-batch-tasks/options/checklist')}
                        </label>
                        <textarea
                            class="form-control"
                            style="min-height: 160px; resize: vertical;"
                            placeholder=${getText('habitica-batch-tasks/options/checklist_placeholder')}
                            value=${checklistText}
                            disabled=${creating}
                            onInput=${(e) => onChecklistTextChange(e.target.value)}
                        ></textarea>
                    </div>
                `}
            </div>

            <div class="card-footer bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div class="d-flex align-items-center gap-2">
                    <span class="small text-muted me-1">${getText('habitica-batch-tasks/options/task_type')}:</span>
                    <div class="form-check form-check-inline mb-0">
                        <input class="form-check-input" type="radio" id="type-todo"
                               value="todo" checked=${type === 'todo'}
                               disabled=${creating}
                               onChange=${(e) => onTypeChange(e.target.value)} />
                        <label class="form-check-label small" for="type-todo">
                            ${getText('habitica-batch-tasks/options/type_todo')}
                        </label>
                    </div>
                    <div class="form-check form-check-inline mb-0">
                        <input class="form-check-input" type="radio" id="type-daily" name="task-type"
                               value="daily" checked=${type === 'daily'}
                               disabled=${creating}
                               onChange=${(e) => onTypeChange(e.target.value)} />
                        <label class="form-check-label small" for="type-daily">
                            ${getText('habitica-batch-tasks/options/type_daily')}
                        </label>
                    </div>
                </div>

                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-info" onClick=${onLoadExample} disabled=${creating}>
                        <i class="bi bi-file-earmark-text"></i> ${getText('habitica-batch-tasks/button/example')}
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onClick=${onClear} disabled=${creating}>
                        <i class="bi bi-x-circle"></i> ${getText('habitica-batch-tasks/button/clear')}
                    </button>
                    <button class="btn btn-primary" onClick=${onCreate} disabled=${creating}>
                        ${creating
                            ? html`<span class="spinner-border spinner-border-sm me-1"></span>`
                            : html`<i class="bi bi-lightning-fill me-1"></i>`}
                        ${getText('habitica-batch-tasks/button/create')}
                    </button>
                </div>
            </div>
        </div>
    `;
};

export default TasksInputCard;