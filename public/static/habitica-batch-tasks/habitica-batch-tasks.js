import { render } from 'preact';
import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import HabiticaSettingsCard from '~/components/HabiticaSettingsCard.js';
import TasksInputCard from '@/components/TasksInputCard.js';
import ResultCard from '@/components/ResultCard.js';
import HabiticaService from '@/services/HabiticaService.js';

const App = () => {
    const [settings, setSettings] = useState({ userId: '', apiToken: '' });
    const [mode, setMode] = useState('tasks');
    const [type, setType] = useState('todo');
    const [tasksText, setTasksText] = useState('');
    const [taskTitle, setTaskTitle] = useState('');
    const [checklistText, setChecklistText] = useState('');
    const [creating, setCreating] = useState(false);
    const [result, setResult] = useState(null);

    const handleClear = () => {
        setTasksText('');
        setTaskTitle('');
        setChecklistText('');
        setResult(null);
    };

    const handleLoadExample = () => {
        setResult(null);
        if (mode === 'tasks') {
            setTasksText(
                'Read for 30 minutes\nMorning run\nPractice piano\nDrink 2L of water'
            );
        } else {
            setTaskTitle('Weekly routine');
            setChecklistText(
                'Clean the desk\nWater the plants\nPlan next week\nReview goals'
            );
        }
    };

    const buildJobs = () => {
        if (mode === 'tasks') {
            const tasks = tasksText.split('\n').map((line) => line.trim()).filter(Boolean);
            // Create in reverse order so the first line ends up on top.
            return { tasks: [...tasks].reverse(), checklist: null };
        }
        const tasks = [taskTitle.trim()];
        const checklist = checklistText.split('\n').map((line) => line.trim()).filter(Boolean);
        return { tasks, checklist };
    };

    const handleCreate = async () => {
        const { tasks, checklist } = buildJobs();

        if (mode === 'tasks' && tasks.length === 0) {
            setResult({ type: 'validation', count: 0, message: getText('habitica-batch-tasks/message/no_tasks') });
            return;
        }
        if (mode === 'subtasks') {
            if (!taskTitle.trim()) {
                setResult({ type: 'validation', count: 0, message: getText('habitica-batch-tasks/message/no_title') });
                return;
            }
            if (checklist.length === 0) {
                setResult({ type: 'validation', count: 0, message: getText('habitica-batch-tasks/message/no_checklist') });
                return;
            }
        }
        if (!settings.userId.trim() || !settings.apiToken.trim()) {
            setResult({ type: 'validation', count: 0, message: getText('habitica-batch-tasks/message/no_credentials') });
            return;
        }

        setCreating(true);
        setResult({ type: 'start', count: tasks.length, progress: 0 });

        const service = new HabiticaService();
        const { results, failures } = await service.createTasks(
            {
                userId: settings.userId.trim(),
                apiToken: settings.apiToken.trim(),
                type,
                tasks,
                checklist
            },
            (done, total) => {
                setResult({ type: 'running', count: total, progress: done, total });
            }
        );

        setCreating(false);
        setResult({
            type: 'done',
            count: results.length,
            results,
            failures
        });

        if (mode === 'tasks') {
            // Keep only the lines that failed to create; clear when all succeeded.
            setTasksText(failures.map((item) => item.text).join('\n'));
        } else {
            // Sub-tasks mode: a single task, so clear its inputs on success.
            if (results.length > 0) {
                setTaskTitle('');
                setChecklistText('');
            }
        }
    };

    return html`
        <div class="habitica-batch-tasks-container">
            <div class="row g-4">
                <div class="col-12">
                    <${HabiticaSettingsCard}
                        onChange=${setSettings}
                    />
                </div>
                <div class="col-12">
                    <${TasksInputCard}
                        mode=${mode}
                        onModeChange=${setMode}
                        tasksText=${tasksText}
                        onTasksTextChange=${setTasksText}
                        taskTitle=${taskTitle}
                        onTaskTitleChange=${setTaskTitle}
                        checklistText=${checklistText}
                        onChecklistTextChange=${setChecklistText}
                        type=${type}
                        onTypeChange=${setType}
                        creating=${creating}
                        onCreate=${handleCreate}
                        onClear=${handleClear}
                        onLoadExample=${handleLoadExample}
                    />
                </div>
                <div class="col-12">
                    <${ResultCard}
                        result=${result}
                    />
                </div>
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});