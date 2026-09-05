const API_URL = 'https://habitica.com';
const CLIENT_ID = 'feather-tools-habitica-batch-tasks';

// Create tasks concurrently, but keep concurrency low so Habitica's per-user
// rate limit is respected. On a 429, back off using the Retry-After header.
const CONCURRENCY_LIMIT = 3;
const MAX_RETRIES = 3;

const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);

const makeId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

const makeItem = (text) => ({
    id: makeId(),
    text,
    completed: false
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getErrorMessage = async (response) => {
    let errorMessage = `HTTP ${response.status}`;
    try {
        const data = await response.json();
        errorMessage = data.message || data.error || errorMessage;
    } catch (_) {
        // ignore
    }
    return errorMessage;
};

export class HabiticaService {
    async createTasks({ userId, apiToken, type, tasks, checklist }, onProgress) {
        const jobList = this.buildJobs(tasks, checklist);
        const ordered = new Array(jobList.length);

        await this.forEachConcurrent(jobList, CONCURRENCY_LIMIT, async (job, index) => {
            try {
                await this.createTask({ userId, apiToken, type, text: job.text, checklist: job.checklist });
                ordered[index] = { text: job.label, ok: true };
            } catch (err) {
                ordered[index] = { text: job.label, ok: false, error: this.extractError(err) };
            }
        }, onProgress);

        const results = ordered.filter((item) => item.ok).map(({ text }) => ({ text, ok: true }));
        const failures = ordered.filter((item) => !item.ok).map(({ text, error }) => ({ text, ok: false, error }));

        return { results, failures };
    }

    buildJobs(tasks, checklist) {
        if (Array.isArray(checklist) && checklist.length > 0) {
            // Sub-tasks mode: a single task title with a checklist of sub-tasks.
            return [{ label: tasks[0], text: tasks[0], checklist }];
        }
        return tasks.map((text) => ({ label: text, text, checklist: null }));
    }

    forEachConcurrent(items, limit, worker, onProgress) {
        let next = 0;
        let completed = 0;

        const runWorker = async () => {
            while (true) {
                const index = next++;
                if (index >= items.length) {
                    return;
                }
                await worker(items[index], index);
                completed += 1;
                if (onProgress) {
                    onProgress(completed, items.length);
                }
            }
        };

        const workerCount = Math.min(limit, items.length || 0);
        const workers = [];
        for (let i = 0; i < workerCount; i++) {
            workers.push(runWorker());
        }
        return Promise.all(workers);
    }

    async createTask({ userId, apiToken, type = 'todo', text, checklist }, attempt = 0) {
        const body = {
            type,
            text
        };

        if (Array.isArray(checklist) && checklist.length > 0) {
            body.checklist = checklist.map(makeItem);
        }

        let response;
        try {
            response = await fetch(`${API_URL}/api/v4/tasks/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-user': userId,
                    'x-api-key': apiToken,
                    'x-client': CLIENT_ID
                },
                body: JSON.stringify(body)
            });
        } catch (err) {
            throw new Error(`NetworkError: ${err.message}`);
        }

        if (response.status === 429 && attempt < MAX_RETRIES) {
            const raw = response.headers.get('Retry-After');
            const retryAfter = Math.max(1, parseInt(raw, 10) || 30);
            await sleep(retryAfter * 1000);
            return this.createTask({ userId, apiToken, type, text, checklist }, attempt + 1);
        }

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        return response.json();
    }

    extractError(err) {
        if (err && err.message) {
            return err.message;
        }
        return 'Unknown error';
    }
}

export default HabiticaService;