import { useState, useEffect, useRef, useMemo } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';
import { CATEGORIES, EMOJIS, searchEmojis, getEmojiName, getEmojiByChar, filterPlatformSupported } from '../services/emojiData';

const EmojiGrid = ({ onCollect, onCollectRecent, onUse, recentEmojis }) => {
    const [activeCategory, setActiveCategory] = useState('smileys');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const gridRef = useRef<HTMLDivElement | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const handleEmojiAction = (e, emoji, collectFn, useFn?) => {
        if (e.ctrlKey || e.metaKey) {
            collectFn(emoji);
        } else {
            navigator.clipboard.writeText(emoji.char).then(() => {
                notify(`${emoji.char} ${t('emoji-picker/message/copied')}`, '', 'success');
            });
            if (useFn) useFn(emoji);
        }
    };

    return (
<>

        <div className="card emoji-picker-grid-card">
            <div className="card-header">
                <div className="emoji-picker-search">
                    <div className="input-group">
                        <span className="input-group-text">🔍</span>
                        <input type="text" className="form-control" placeholder={t('emoji-picker/search/placeholder')} value={searchQuery} onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)} />
                        {searchQuery && (
<>

                            <button className="btn btn-outline-secondary" type="button" onClick={handleClearSearch}>×</button>
                        
</>
)}
                    </div>
                </div>
            </div>
            <div className="card-body">
                {visibleRecent.length > 0 && (
<>

                    <div className="emoji-picker-recent mb-3">
                        <div className="text-muted small mb-2">{t('emoji-picker/recent/title')}</div>
                        <div className="emoji-picker-recent-list">
                            {visibleRecent.map((emoji) => (
<>

                                <button key={emoji.char} className="emoji-picker-emoji-btn" title={getEmojiName(emoji)} onClick={(e) => handleEmojiAction(e, emoji, onCollectRecent)}><span className="emoji-picker-emoji-glyph">{emoji.char}</span></button>
                            
</>
))}
                        </div>
                    </div>
                
</>
)}

                {!isSearching && (
<>

                    <div className="emoji-picker-categories mb-3">
                        {CATEGORIES.map((category) => (
<>

                            <button key={category.id} className={`btn btn-sm emoji-picker-category-btn ${activeCategory === category.id ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setActiveCategory(category.id)}>{t(category.key)}</button>
                        
</>
))}
                    </div>
                
</>
)}

                {isSearching && (
<>

                    <div className="text-muted small mb-2">{t('emoji-picker/search/results_title')}</div>
                
</>
)}

                <div ref={gridRef} className="emoji-picker-grid">
                    {displayedEmojis.length === 0 ? (
<>

                        <div className="text-center text-muted py-5">{t('emoji-picker/no_results')}</div>
                    
</>
) : displayedEmojis.map((emoji) => (
<>

                        <button key={emoji.char + emoji.name} className="emoji-picker-emoji-btn" title={getEmojiName(emoji)} onClick={(e) => handleEmojiAction(e, emoji, onCollect, onUse)}><span className="emoji-picker-emoji-glyph">{emoji.char}</span></button>
                    
</>
))}
                </div>
            </div>
            <div className="card-footer bg-light text-muted emoji-picker-hint">
                {t('emoji-picker/hint/click_ctrl')}
            </div>
        </div>
    
</>
);
};

export default EmojiGrid;
