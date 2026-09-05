// URL Cleaner Component
import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { css } from 'goober';
import { useStore } from '~/contexts/StoreContext.js';
import { getText } from '~/helpers/utils.js';

const urlInputContainerStyle = css`
    position: relative;
`;

const urlInputStyle = css`
    min-height: 200px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9rem;
    line-height: 1.4;
    resize: vertical;
    
    @media (max-width: 768px) {
        min-height: 150px;
        font-size: 0.8rem;
    }
`;

const cleaningOptionsStyle = css`
    background-color: #f8f9fa;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
    
    @media (max-width: 768px) {
        padding: 0.75rem;
    }
`;

const optionGroupStyle = css`
    margin-bottom: 1rem;
    &:last-child { margin-bottom: 0; }
`;

const customParamsStyle = css`
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.875rem;
`;

// Example URLs for testing URL cleaning
const exampleUrls = [
    'https://example.com/page?utm_source=google&utm_medium=cpc&utm_campaign=test&_ts=122331321321',
    'https://shop.example.com/product/123?fbclid=abc123&ref=facebook',
    'https://news.example.com/article?gclid=xyz789&source=newsletter',
    'https://blog.example.com/post?utm_source=twitter&utm_content=social',
    'https://store.example.com/item?id=456&utm_term=shoes&utm_content=ad',
    'https://forum.example.com/thread/789?msclkid=def456&campaign_id=summer',
    'https://music.example.com/track/321?ad_id=ad789&click_id=clk123',
    'https://travel.example.com/deal?utm_campaign=holiday&ref=partner',
    'https://video.example.com/watch?v=abc123&gclsrc=aw.ds',
    'https://food.example.com/recipe?source=instagram&fb_source=feed',
    'https://app.example.com/download?utm_medium=email&fb_action_ids=12345',
    'https://events.example.com/register?utm_source=linkedin&fb_action_types=like',
    'https://news.example.com/article/456?utm_content=footer&gclid=xyz123',
    'https://shop.example.com/cart?ref=affiliate&utm_term=discount'
];

const SettingCard = ({
    onSubmit,
    onClear
}) => {
    const { busy, setBusy } = useStore();
    const [inputUrls, setInputUrls] = useState('');
    const [removeCommonTrackings, setRemoveCommonTrackings] = useState(true);
    const [removeAllTrackings, setRemoveAllTrackings] = useState(false);
    const [removeCustomTrackings, setRemoveCustomTrackings] = useState('');

    // Load example URLs
    const loadExampleUrls = () => {
        const urls = exampleUrls.join('\n');
        setInputUrls(urls);
    };

    // Calculate dynamic rows for textarea (between 5 and 10)
    const calculateRows = () => {
        if (!inputUrls) return 5;
        const lineCount = inputUrls.split('\n').length;
        return Math.max(5, Math.min(10, lineCount));
    };

    const handleClear = () => {
        setInputUrls('');
        onClear();
    };
    const handleSubmit = () => {
        onSubmit({
            inputUrls,
            settings: {
                removeCommonTrackings,
                removeAllTrackings,
                removeCustomTrackings
            }
        });
    };

    return html`
        <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">${getText('clean-urls/input/title')}</h5>
                <button 
                    class="btn btn-outline-secondary btn-sm"
                    onClick=${loadExampleUrls}
                >
                    ${getText('clean-urls/input/load_examples')}
                </button>
            </div>

            <div class="card-body">
                <div class="mb-3 ${urlInputContainerStyle}">
                    <textarea
                        class="form-control ${urlInputStyle}"
                        placeholder=${getText('clean-urls/input/placeholder')}
                        value=${inputUrls}
                        onInput=${(e) => {
                            const newValue = e.target.value;
                            setInputUrls(newValue);
                        }}
                        rows=${calculateRows()}
                    />
                </div>

                <div class=${cleaningOptionsStyle}>
                    <div class=${optionGroupStyle}>
                        <div class="form-check">
                            <input
                                class="form-check-input"
                                type="checkbox"
                                id="removeCommonTrackings"
                                checked=${removeCommonTrackings}
                                onChange=${(e) => setRemoveCommonTrackings(e.target.checked)}
                                disabled=${removeAllTrackings}
                            />
                            <label class="form-check-label" htmlFor="removeCommonTrackings">
                                ${getText('clean-urls/tracking_parameters/remove_common')}
                            </label>
                        </div>
                    </div>
                    
                    <div class=${optionGroupStyle}>
                        <label htmlFor="removeCustomTrackings" class="form-label">
                            ${getText('clean-urls/tracking_parameters/custom_filters')}:
                        </label>
                        <input
                            type="text"
                            class="form-control ${customParamsStyle}"
                            id="removeCustomTrackings"
                            placeholder="param1, param2, param3"
                            value=${removeCustomTrackings}
                            onInput=${(e) => setRemoveCustomTrackings(e.target.value)}
                            disabled=${removeAllTrackings}
                        />
                    </div>
                    
                    <div class=${optionGroupStyle}>
                        <div class="form-check">
                            <input
                                class="form-check-input"
                                type="checkbox"
                                id="removeAllTrackings"
                                checked=${removeAllTrackings}
                                onChange=${(e) => setRemoveAllTrackings(e.target.checked)}
                            />
                            <label class="form-check-label" htmlFor="removeAllTrackings">
                                ${getText('clean-urls/tracking_parameters/remove_all')}
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="d-flex gap-2">
                    <button
                        class="btn btn-primary"
                        onClick=${handleSubmit}
                        disabled=${!inputUrls.trim() || busy}
                    >
                        ${busy ? 'Processing...' : getText('clean-urls/button/clean_urls')}
                    </button>
                    <button
                        class="btn btn-outline-secondary"
                        onClick=${handleClear}
                    >
                        ${getText('clean-urls/button/clear')}
                    </button>
                </div>
            </div>
        </div>
    `;
};

export default SettingCard;
