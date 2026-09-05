import { html } from 'htm/preact';
import { useState, useEffect, useRef, useMemo } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { notify } from '~/helpers/messages.js';
import { CATEGORIES, EMOJIS, searchEmojis, getEmojiName, getEmojiByChar, filterPlatformSupported } from '@/services/emojiData.js';

const EmojiGrid = ({ onCollect, onCollectRecent, onUse, recentEmojis }) => {
    const [activeCategory, setActiveCategory] = useState('smileys');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const gridRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            debounceRef.current = null;
        }, 200);
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
        };
    }, [searchQuery]);

    useEffect(() => {
        if (gridRef.current) {
            gridRef.current.scrollTop = 0;
        }
    }, [activeCategory, debouncedQuery]);

    const displayedEmojis = useMemo(() => {
        if (debouncedQuery.trim()) {
            return filterPlatformSupported(searchEmojis(debouncedQuery));
        }
        return filterPlatformSupported(EMOJIS[activeCategory] || []);
    }, [activeCategory, debouncedQuery]);

    const isSearching = !!debouncedQuery.trim();
    const visibleRecent = filterPlatformSupported(
        recentEmojis
            .map((char) => getEmojiByChar(char))
            .filter((emoji) => emoji)
    );

    const handleClearSearch = () => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
            debounceRef.current = null;
        }
        setSearchQuery('');
        setDebouncedQuery('');
    };

    const handleEmojiAction = (e, emoji, collectFn, useFn) => {
        if (e.ctrlKey || e.metaKey) {
            collectFn(emoji);
        } else {
            navigator.clipboard.writeText(emoji.char).then(() => {
                notify(`${emoji.char} ${getText('emoji-picker/message/copied')}`, '', 'success');
            });
            if (useFn) useFn(emoji);
        }
    };

    return html`
        <div class="card emoji-picker-grid-card">
            <div class="card-header">
                <div class="emoji-picker-search">
                    <div class="input-group">
                        <span class="input-group-text">🔍</span>
                        <input
                            type="text"
                            class="form-control"
                            placeholder=${getText('emoji-picker/search/placeholder')}
                            value=${searchQuery}
                            onInput=${(e) => setSearchQuery(e.target.value)}
                        />
                        ${searchQuery && html`
                            <button class="btn btn-outline-secondary" type="button" onClick=${handleClearSearch}>×</button>
                        `}
                    </div>
                </div>
            </div>
            <div class="card-body">
                ${visibleRecent.length > 0 && html`
                    <div class="emoji-picker-recent mb-3">
                        <div class="text-muted small mb-2">${getText('emoji-picker/recent/title')}</div>
                        <div class="emoji-picker-recent-list">
                            ${visibleRecent.map((emoji) => html`
                                <button
                                    key=${emoji.char}
                                    class="emoji-picker-emoji-btn"
                                    title=${getEmojiName(emoji)}
                                    onClick=${(e) => handleEmojiAction(e, emoji, onCollectRecent)}
                                ><span class="emoji-picker-emoji-glyph">${emoji.char}</span></button>
                            `)}
                        </div>
                    </div>
                `}

                ${!isSearching && html`
                    <div class="emoji-picker-categories mb-3">
                        ${CATEGORIES.map((category) => html`
                            <button
                                key=${category.id}
                                class=${`btn btn-sm emoji-picker-category-btn ${activeCategory === category.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick=${() => setActiveCategory(category.id)}
                            >${getText(category.key)}</button>
                        `)}
                    </div>
                `}

                ${isSearching && html`
                    <div class="text-muted small mb-2">${getText('emoji-picker/search/results_title')}</div>
                `}

                <div ref=${gridRef} class="emoji-picker-grid">
                    ${displayedEmojis.length === 0 ? html`
                        <div class="text-center text-muted py-5">${getText('emoji-picker/no_results')}</div>
                    ` : displayedEmojis.map((emoji) => html`
                        <button
                            key=${emoji.char + emoji.name}
                            class="emoji-picker-emoji-btn"
                            title=${getEmojiName(emoji)}
                            onClick=${(e) => handleEmojiAction(e, emoji, onCollect, onUse)}
                        ><span class="emoji-picker-emoji-glyph">${emoji.char}</span></button>
                    `)}
                </div>
            </div>
            <div class="card-footer bg-light text-muted emoji-picker-hint">
                ${getText('emoji-picker/hint/click_ctrl')}
            </div>
        </div>
    `;
};

export default EmojiGrid;
