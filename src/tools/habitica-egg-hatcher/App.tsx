import { useState } from 'react';
import { t } from '~/helpers/i18n';
import HabiticaSettingsCard from '~/components/HabiticaSettingsCard';
import HatchMatrixCard from './components/HatchMatrixCard';
import ResultCard from './components/ResultCard';
import HabiticaService from './services/HabiticaService';

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
    const [content, setContent] = useState<any>(null);
    const [inventory, setInventory] = useState<any>(null);
    const [loadingInventory, setLoadingInventory] = useState(false);
    const [selected, setSelected] = useState(new Set());
    const [cellStatus, setCellStatus] = useState({});
    const [running, setRunning] = useState(false);
    const [pending, setPending] = useState<any>(null);
    const [result, setResult] = useState<any>(null);

    const handleLoadInventory = async () => {
        if (!settings.userId.trim() || !settings.apiToken.trim()) {
            setResult({ type: 'validation', message: t('habitica-egg-hatcher/message/no_credentials') });
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
        } catch (err: any) {
            setResult({
                type: 'error',
                message: `${t('habitica-egg-hatcher/message/load_failed')} ${err.message || ''}`
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
            setResult({ type: 'validation', message: t('habitica-egg-hatcher/message/none_selected') });
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

            let inventoryData: any = null;
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

            const ownedKeys = new Set<string>();
            if (inventoryData) {
                for (const petKey of Object.keys(inventoryData.pets || {})) {
                    if ((inventoryData.pets[petKey] || 0) > 0) {
                        ownedKeys.add(petKey);
                    }
                }
            }

            const remaining: any[] = [];
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

    return (
<>

        <div className="habitica-egg-hatcher-container">
            <div className="row g-4">
                <div className="col-12">
                    <HabiticaSettingsCard onChange={setSettings} />
                </div>
                <div className="col-12">
                    <HatchMatrixCard content={content} inventory={inventory} loading={loadingInventory} selected={selected} onSetSelected={setSelected} running={running} cellStatus={cellStatus} disabled={running} pending={pending} onHatch={handleHatchClick} onConfirm={handleConfirmHatch} onCancel={handleCancelHatch} onLoad={handleLoadInventory} />
                </div>
                <div className="col-12">
                    <ResultCard result={result} />
                </div>
            </div>
        </div>
    
</>
);
};

export default App;
