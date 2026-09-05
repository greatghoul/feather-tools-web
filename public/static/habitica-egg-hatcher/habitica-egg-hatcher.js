import { render } from 'preact';
import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import HabiticaSettingsCard from '~/components/HabiticaSettingsCard.js';
import HatchMatrixCard from '@/components/HatchMatrixCard.js';
import ResultCard from '@/components/ResultCard.js';
import HabiticaService from '@/services/HabiticaService.js';

const CONTENT_LANGS = ['en', 'zh'];

// Hatching is verified against the real inventory after each batch. Combos that
// were not actually hatched are retried automatically, at most this many times.
const MAX_HATCH_ATTEMPTS = 3;

const cellKey = (egg, potion) => `${egg}|${potion}`;

const splitKey = (key) => {
    const sep = key.indexOf('|');
    return { egg: key.slice(0, sep), potion: key.slice(sep + 1) };
};

const App = () => {
    const [settings, setSettings] = useState({ userId: '', apiToken: '' });
    const [content, setContent] = useState(null);
    const [inventory, setInventory] = useState(null);
    const [loadingInventory, setLoadingInventory] = useState(false);
    const [selected, setSelected] = useState(new Set());
    const [cellStatus, setCellStatus] = useState({});
    const [running, setRunning] = useState(false);
    const [pending, setPending] = useState(null);
    const [result, setResult] = useState(null);

    const handleLoadInventory = async () => {
        if (!settings.userId.trim() || !settings.apiToken.trim()) {
            setResult({ type: 'validation', message: getText('habitica-egg-hatcher/message/no_credentials') });
            return;
        }

        setLoadingInventory(true);
        setResult(null);

        const service = new HabiticaService();
        const lang = CONTENT_LANGS.includes(window.LOCALE) ? window.LOCALE : 'en';
        try {
            const [contentData, inventoryData] = await Promise.all([
                service.getContent(lang),
                service.getInventory({
                    userId: settings.userId.trim(),
                    apiToken: settings.apiToken.trim()
                })
            ]);
            setContent(contentData);
            setInventory(inventoryData);
            setSelected(new Set());
        } catch (err) {
            setResult({
                type: 'error',
                message: `${getText('habitica-egg-hatcher/message/load_failed')} ${err.message || ''}`
            });
        } finally {
            setLoadingInventory(false);
        }
    };

    const buildJobs = () => {
        return [...selected].map((key) => {
            const { egg, potion } = splitKey(key);
            const potionText = content && content.hatchingPotions && content.hatchingPotions[potion] ? content.hatchingPotions[potion].text : potion;
            const eggText = content && content.eggs && content.eggs[egg] ? content.eggs[egg].text : egg;
            return { egg, potion, label: `${potionText} ${eggText}` };
        });
    };

    const handleHatchClick = () => {
        if (selected.size === 0) {
            setResult({ type: 'validation', message: getText('habitica-egg-hatcher/message/none_selected') });
            return;
        }
        setPending({ jobs: buildJobs() });
        setResult(null);
    };

    const handleConfirmHatch = async () => {
        if (!pending || pending.jobs.length === 0) {
            setPending(null);
            return;
        }

        const credentials = {
            userId: settings.userId.trim(),
            apiToken: settings.apiToken.trim()
        };
        let jobs = [...pending.jobs];

        setRunning(true);
        setPending(null);
        setCellStatus({});

        for (let attempt = 0; attempt < MAX_HATCH_ATTEMPTS && jobs.length > 0; attempt += 1) {
            const service = new HabiticaService();
            const { results, failures } = await service.hatchMany(
                { ...credentials, jobs }
            );

            const errorByKey = {};
            for (const failure of failures) {
                errorByKey[cellKey(failure.egg, failure.potion)] = failure.error;
            }

            let inventoryData = null;
            try {
                inventoryData = await service.getInventory(credentials);
            } catch (_) {
                const lastSuccess = [...results].reverse().find((item) => item.items);
                if (lastSuccess) {
                    inventoryData = {
                        eggs: lastSuccess.items.eggs || {},
                        potions: lastSuccess.items.hatchingPotions || {},
                        pets: lastSuccess.items.pets || {}
                    };
                }
            }
            if (inventoryData) {
                setInventory(inventoryData);
            }

            const ownedKeys = new Set();
            if (inventoryData) {
                for (const petKey of Object.keys(inventoryData.pets || {})) {
                    if ((inventoryData.pets[petKey] || 0) > 0) {
                        ownedKeys.add(petKey);
                    }
                }
            }

            const remaining = [];
            for (const job of jobs) {
                const petKey = `${job.egg}-${job.potion}`;
                if (!ownedKeys.has(petKey)) {
                    remaining.push({
                        ...job,
                        error: errorByKey[cellKey(job.egg, job.potion)] || null
                    });
                }
            }
            jobs = remaining;
        }

        const failedStatus = {};
        for (const job of jobs) {
            failedStatus[cellKey(job.egg, job.potion)] = true;
        }
        setCellStatus(failedStatus);
        setSelected(new Set());
        setRunning(false);
    };

    const handleCancelHatch = () => {
        setPending(null);
    };

    return html`
        <div class="habitica-egg-hatcher-container">
            <div class="row g-4">
                <div class="col-12">
                    <${HabiticaSettingsCard}
                        onChange=${setSettings}
                    />
                </div>
                <div class="col-12">
                    <${HatchMatrixCard}
                        content=${content}
                        inventory=${inventory}
                        loading=${loadingInventory}
                        selected=${selected}
                        onSetSelected=${setSelected}
                        running=${running}
                        cellStatus=${cellStatus}
                        disabled=${running}
                        pending=${pending}
                        onHatch=${handleHatchClick}
                        onConfirm=${handleConfirmHatch}
                        onCancel=${handleCancelHatch}
                        onLoad=${handleLoadInventory}
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
