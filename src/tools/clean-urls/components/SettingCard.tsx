// URL Cleaner Component
import { useState } from 'react';
import { useStore } from '~/contexts/StoreContext';
import { t } from '~/helpers/i18n';
import styles from './SettingCard.module.css';

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

    return (
<>

        <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{t('clean-urls/input/title')}</h5>
                <button className="btn btn-outline-secondary btn-sm" onClick={loadExampleUrls}>
                    {t('clean-urls/input/load_examples')}
                </button>
            </div>

            <div className="card-body">
                <div className={`mb-3 ${styles.urlInputContainerStyle}`}>
                    <textarea className={`form-control ${styles.urlInputStyle}`} placeholder={t('clean-urls/input/placeholder')} value={inputUrls} onInput={(e) => {
                            const newValue = (e.target as HTMLInputElement).value;
                            setInputUrls(newValue);
                        }} rows={calculateRows()} />
                </div>

                <div className={styles.cleaningOptionsStyle}>
                    <div className={styles.optionGroupStyle}>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="removeCommonTrackings" checked={removeCommonTrackings} onChange={(e) => setRemoveCommonTrackings(e.target.checked)} disabled={removeAllTrackings} />
                            <label className="form-check-label" htmlFor="removeCommonTrackings">
                                {t('clean-urls/tracking_parameters/remove_common')}
                            </label>
                        </div>
                    </div>
                    
                    <div className={styles.optionGroupStyle}>
                        <label htmlFor="removeCustomTrackings" className="form-label">
                            {t('clean-urls/tracking_parameters/custom_filters')}:
                        </label>
                        <input type="text" className={`form-control ${styles.customParamsStyle}`} id="removeCustomTrackings" placeholder="param1, param2, param3" value={removeCustomTrackings} onInput={(e) => setRemoveCustomTrackings((e.target as HTMLInputElement).value)} disabled={removeAllTrackings} />
                    </div>
                    
                    <div className={styles.optionGroupStyle}>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="removeAllTrackings" checked={removeAllTrackings} onChange={(e) => setRemoveAllTrackings(e.target.checked)} />
                            <label className="form-check-label" htmlFor="removeAllTrackings">
                                {t('clean-urls/tracking_parameters/remove_all')}
                            </label>
                        </div>
                    </div>
                </div>
                
                <div className="d-flex gap-2">
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={!inputUrls.trim() || busy}>
                        {busy ? 'Processing...' : t('clean-urls/button/clean_urls')}
                    </button>
                    <button className="btn btn-outline-secondary" onClick={handleClear}>
                        {t('clean-urls/button/clear')}
                    </button>
                </div>
            </div>
        </div>
    
</>
);
};

export default SettingCard;
