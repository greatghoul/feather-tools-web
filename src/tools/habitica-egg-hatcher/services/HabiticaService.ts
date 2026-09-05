const API_URL = 'https://habitica.com';
const CLIENT_ID = 'feather-tools-habitica-egg-hatcher';

// Keep concurrency low so Habitica's per-user rate limit is respected.
// On a 429, back off using the Retry-After header.
const CONCURRENCY_LIMIT = 3;
const MAX_RETRIES = 3;

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
    async request({ userId, apiToken, path, options = {}, attempt = 0 }: any) {
        const headers = {
            'x-client': CLIENT_ID,
            ...(options.headers || {})
        };

        if (userId && apiToken) {
            headers['x-api-user'] = userId;
            headers['x-api-key'] = apiToken;
        }

        let response;
        try {
            response = await fetch(`${API_URL}${path}`, {
                ...options,
                headers
            });
        } catch (err: any) {
            throw new Error(`NetworkError: ${err.message}`);
        }

        if (response.status === 429 && attempt < MAX_RETRIES) {
            const raw = response.headers.get('Retry-After');
            const retryAfter = Math.max(1, parseInt(raw, 10) || 30);
            await sleep(retryAfter * 1000);
            return this.request({ userId, apiToken, path, options, attempt: attempt + 1 });
        }

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        return response.json();
    }

    async getContent(language = 'en') {
        const safeLang = typeof language === 'string' && language ? language : 'en';
        const data = await this.request({
            path: `/api/v4/content?language=${encodeURIComponent(safeLang)}`
        });
        return data.data || {};
    }

    async getInventory({ userId, apiToken }) {
        const data = await this.request({
            userId,
            apiToken,
            path: '/api/v4/user?userFields=items.eggs,items.hatchingPotions,items.pets'
        });
        const items = (data.data && data.data.items) || {};
        return {
            eggs: items.eggs || {},
            potions: items.hatchingPotions || {},
            pets: items.pets || {}
        };
    }

    async hatch({ userId, apiToken, egg, potion }) {
        const path = `/api/v4/user/hatch/${encodeURIComponent(egg)}/${encodeURIComponent(potion)}`;
        const data = await this.request({
            userId,
            apiToken,
            path,
            options: { method: 'POST' }
        });
        return data;
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
        const workers: any[] = [];
        for (let i = 0; i < workerCount; i++) {
            workers.push(runWorker());
        }
        return Promise.all(workers);
    }

    async hatchMany({ userId, apiToken, jobs }, onProgress?) {
        const ordered = new Array(jobs.length);

        await this.forEachConcurrent(jobs, CONCURRENCY_LIMIT, async (job, index) => {
            try {
                const data = await this.hatch({ userId, apiToken, egg: job.egg, potion: job.potion });
                const items = (data.data && data.data.items) || null;
                ordered[index] = { egg: job.egg, potion: job.potion, label: job.label, ok: true, items };
            } catch (err) {
                ordered[index] = { egg: job.egg, potion: job.potion, label: job.label, ok: false, error: this.extractError(err) };
            }
        }, onProgress);

        const results = ordered.filter((item) => item.ok);
        const failures = ordered.filter((item) => !item.ok);

        return { results, failures };
    }

    extractError(err) {
        if (err && err.message) {
            return err.message;
        }
        return 'Unknown error';
    }
}

export default HabiticaService;
