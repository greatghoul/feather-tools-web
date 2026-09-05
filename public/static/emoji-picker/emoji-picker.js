import { render } from 'preact';
import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import EmojiGrid from '@/components/EmojiGrid.js';
import OutputCard from '@/components/OutputCard.js';

const MAX_RECENT = 10;

const App = () => {
    const [collected, setCollected] = useState('');
    const [recentEmojis, setRecentEmojis] = useState([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('emoji-picker-recent');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setRecentEmojis(parsed.filter((item) => typeof item === 'string'));
                }
            }
        } catch (e) {
            // Ignore storage errors
        }
    }, []);

    const recordRecent = (emoji) => {
        setRecentEmojis((prev) => {
            const filtered = prev.filter((c) => c !== emoji.char);
            const updated = [emoji.char, ...filtered].slice(0, MAX_RECENT);
            try {
                localStorage.setItem('emoji-picker-recent', JSON.stringify(updated));
            } catch (e) {
                // Ignore storage errors
            }
            return updated;
        });
    };

    const handleUse = (emoji) => {
        recordRecent(emoji);
    };

    const handleCollect = (emoji) => {
        setCollected((prev) => prev + emoji.char);
        recordRecent(emoji);
    };

    const handleCollectRecent = (emoji) => {
        setCollected((prev) => prev + emoji.char);
    };

    const handleClear = () => {
        setCollected('');
    };

    return html`
        <div class="emoji-picker-container">
            <div class="row g-4">
                <div class="col-12">
                    <${EmojiGrid} onCollect=${handleCollect} onCollectRecent=${handleCollectRecent} onUse=${handleUse} recentEmojis=${recentEmojis} />
                </div>
                <div class="col-12">
                    <${OutputCard} collected=${collected} onClear=${handleClear} />
                </div>
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});
