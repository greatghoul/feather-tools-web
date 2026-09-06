import { useCallback, useEffect, useMemo, useState } from 'react';
import ItemsCard from './components/ItemsCard';
import OptionsCard, { type WheelSettings } from './components/OptionsCard';
import WheelCard from './components/WheelCard';
import HistoryCard from './components/HistoryCard';

const MAX_ITEMS = 100;
const MAX_HISTORY = 50;
// Options live in sessionStorage: a reload restores them, but a fresh visit
// starts empty. The legacy localStorage keys predate this and are cleaned up.
const TEXT_KEY = 'random-wheel-options';
const SETTINGS_KEY = 'random-wheel-settings';
const LEGACY_KEYS = ['random-wheel-options', 'random-wheel-settings'];

const loadSavedText = () => {
    try {
        return sessionStorage.getItem(TEXT_KEY) ?? '';
    } catch (_) {
        return '';
    }
};

const loadSavedSettings = (): WheelSettings => {
    try {
        const raw = sessionStorage.getItem(SETTINGS_KEY);
        if (raw) {
            const saved = JSON.parse(raw);
            return { dedup: saved.dedup ?? true, removeWinner: saved.removeWinner ?? false };
        }
    } catch (_) {}
    return { dedup: true, removeWinner: false };
};

const clearLegacyStorage = () => {
    try {
        LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
    } catch (_) {}
};

const App = () => {
    const [text, setText] = useState(loadSavedText);
    const [settings, setSettings] = useState<WheelSettings>(loadSavedSettings);
    const [spinning, setSpinning] = useState(false);
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        try {
            sessionStorage.setItem(TEXT_KEY, text);
        } catch (_) {}
    }, [text]);

    useEffect(() => {
        try {
            sessionStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (_) {}
    }, [settings]);

    useEffect(() => {
        clearLegacyStorage();
    }, []);

    const { items, truncated } = useMemo(() => {
        const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
        const deduped = settings.dedup ? [...new Set(lines)] : lines;
        return { items: deduped.slice(0, MAX_ITEMS), truncated: deduped.length > MAX_ITEMS };
    }, [text, settings.dedup]);

    const handleResult = useCallback((item: string) => {
        setHistory((prev) => [item, ...prev].slice(0, MAX_HISTORY));
    }, []);

    // Called after the removal animation finishes so the wheel keeps the drawn
    // slice visible until it has flashed and collapsed.
    const handleRemoveItem = useCallback((item: string) => {
        setText((prev) => {
            const lines = prev.split('\n');
            const idx = lines.findIndex((line) => line.trim() === item);
            if (idx >= 0) lines.splice(idx, 1);
            return lines.join('\n');
        });
    }, []);

    return (
        <div className="row row-gap-4 mb-4">
            <div className="col-lg-5 d-flex flex-column gap-4">
                <ItemsCard
                    text={text}
                    onTextChange={setText}
                    itemsCount={items.length}
                    truncated={truncated}
                    disabled={spinning}
                />
                <OptionsCard settings={settings} onSettingsChange={setSettings} disabled={spinning} />
            </div>
            <div className="col-lg-7 d-flex flex-column gap-4">
                <WheelCard
                    items={items}
                    spinning={spinning}
                    removeWinner={settings.removeWinner}
                    onSpinChange={setSpinning}
                    onResult={handleResult}
                    onRemoveItem={handleRemoveItem}
                />
                <HistoryCard history={history} onClear={() => setHistory([])} />
            </div>
        </div>
    );
};

export default App;
