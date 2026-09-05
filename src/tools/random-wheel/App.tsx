import { useCallback, useMemo, useState } from 'react';
import ItemsCard from './components/ItemsCard';
import OptionsCard, { type WheelSettings } from './components/OptionsCard';
import WheelCard from './components/WheelCard';
import HistoryCard from './components/HistoryCard';

const MAX_ITEMS = 100;
const MAX_HISTORY = 50;

const App = () => {
    const [text, setText] = useState('');
    const [settings, setSettings] = useState<WheelSettings>({ dedup: true, removeWinner: false });
    const [spinning, setSpinning] = useState(false);
    const [history, setHistory] = useState<string[]>([]);

    const { items, truncated } = useMemo(() => {
        const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
        const deduped = settings.dedup ? [...new Set(lines)] : lines;
        return { items: deduped.slice(0, MAX_ITEMS), truncated: deduped.length > MAX_ITEMS };
    }, [text, settings.dedup]);

    const handleResult = useCallback((item: string) => {
        setHistory((prev) => [item, ...prev].slice(0, MAX_HISTORY));
        if (settings.removeWinner) {
            setText((prev) => {
                const lines = prev.split('\n');
                const idx = lines.findIndex((line) => line.trim() === item);
                if (idx >= 0) lines.splice(idx, 1);
                return lines.join('\n');
            });
        }
    }, [settings.removeWinner]);

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
                    onSpinChange={setSpinning}
                    onResult={handleResult}
                />
                <HistoryCard history={history} onClear={() => setHistory([])} />
            </div>
        </div>
    );
};

export default App;
