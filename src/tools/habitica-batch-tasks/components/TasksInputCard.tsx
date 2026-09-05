import { t } from '~/helpers/i18n';

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

    return (
<>

        <div className="card">
            <div className="card-header">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <button className={`nav-link ${mode === 'tasks' ? 'active' : ''}`} aria-current={mode === 'tasks' ? 'true' : undefined} onClick={() => onModeChange('tasks')} disabled={creating}>
                            {t('habitica-batch-tasks/tab/tasks')}
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${mode === 'subtasks' ? 'active' : ''}`} aria-current={mode === 'subtasks' ? 'true' : undefined} onClick={() => onModeChange('subtasks')} disabled={creating}>
                            {t('habitica-batch-tasks/tab/subtasks')}
                        </button>
                    </li>
                </ul>
            </div>

            <div className="card-body">
                {mode === 'tasks' && (
<>

                    <textarea className="form-control" style={{ minHeight: '200px', resize: 'vertical' }} placeholder={t('habitica-batch-tasks/input/placeholder')} value={tasksText} disabled={creating} onInput={(e) => onTasksTextChange((e.target as HTMLInputElement).value)}></textarea>
                
</>
)}

                {mode === 'subtasks' && (
<>

                    <div>
                        <label className="form-label small mb-1">
                            {t('habitica-batch-tasks/options/task_title')}
                        </label>
                        <input type="text" className="form-control form-control-sm mb-3" placeholder={t('habitica-batch-tasks/options/task_title_placeholder')} value={taskTitle} disabled={creating} onInput={(e) => onTaskTitleChange((e.target as HTMLInputElement).value)} />
                        <label className="form-label small mb-1">
                            {t('habitica-batch-tasks/options/checklist')}
                        </label>
                        <textarea className="form-control" style={{ minHeight: '160px', resize: 'vertical' }} placeholder={t('habitica-batch-tasks/options/checklist_placeholder')} value={checklistText} disabled={creating} onInput={(e) => onChecklistTextChange((e.target as HTMLInputElement).value)}></textarea>
                    </div>
                
</>
)}
            </div>

            <div className="card-footer bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                    <span className="small text-muted me-1">{t('habitica-batch-tasks/options/task_type')}:</span>
                    <div className="form-check form-check-inline mb-0">
                        <input className="form-check-input" type="radio" id="type-todo" value="todo" checked={type === 'todo'} disabled={creating} onChange={(e) => onTypeChange(e.target.value)} />
                        <label className="form-check-label small" htmlFor="type-todo">
                            {t('habitica-batch-tasks/options/type_todo')}
                        </label>
                    </div>
                    <div className="form-check form-check-inline mb-0">
                        <input className="form-check-input" type="radio" id="type-daily" name="task-type" value="daily" checked={type === 'daily'} disabled={creating} onChange={(e) => onTypeChange(e.target.value)} />
                        <label className="form-check-label small" htmlFor="type-daily">
                            {t('habitica-batch-tasks/options/type_daily')}
                        </label>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-info" onClick={onLoadExample} disabled={creating}>
                        <i className="bi bi-file-earmark-text"></i> {t('habitica-batch-tasks/button/example')}
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={onClear} disabled={creating}>
                        <i className="bi bi-x-circle"></i> {t('habitica-batch-tasks/button/clear')}
                    </button>
                    <button className="btn btn-primary" onClick={onCreate} disabled={creating}>
                        {creating
                            ? (
<>
<span className="spinner-border spinner-border-sm me-1"></span>
</>
)
                            : (
<>
<i className="bi bi-lightning-fill me-1"></i>
</>
)}
                        {t('habitica-batch-tasks/button/create')}
                    </button>
                </div>
            </div>
        </div>
    
</>
);
};

export default TasksInputCard;
