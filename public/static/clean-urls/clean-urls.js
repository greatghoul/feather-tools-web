// Batch URL Cleaner Main JavaScript
import { html } from 'htm/preact';
import { render, h } from 'preact';
import { useState, useRef } from 'preact/hooks';
import { setup } from 'goober';
import { StoreContext } from '~/contexts/StoreContext.js';
import SettingCard from '@/components/SettingCard.js';
import OutputCard from '@/components/OutputCard.js';

setup(h);

// Common tracking parameters to remove
const COMMON_TRACKING_PARAMS = [
    // Google Analytics
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    // Google Ads
    'gclid', 'gclsrc',
    // Facebook
    'fbclid', 'fb_action_ids', 'fb_action_types', 'fb_source',
    // Microsoft
    'msclkid',
    // Other common tracking
    'ref', 'source', 'campaign_id', 'ad_id', 'click_id'
];

function BatchUrlCleaner() {
    const [busy, setBusy] = useState(false);
    const [cleanedUrls, setCleanedUrls] = useState('');

    const store = {
        busy,
        setBusy,
    };
    
    const copyButtonRef = useRef();

    // Clean a single URL
    const cleanUrl = (urlString, settings) => {
        try {
            const url = new URL(urlString.trim());

            if (settings.removeAllTrackings) {
                // Remove all query parameters
                url.search = '';
            } else {
                const paramsToRemove = new Set();
                
                // Add common tracking parameters if enabled
                if (settings.removeCommonTrackings) {
                    COMMON_TRACKING_PARAMS.forEach(param => paramsToRemove.add(param));
                }
                
                // Add custom parameters
                if (settings.removeCustomTrackings.trim()) {
                    settings.removeCustomTrackings.split(',').forEach(param => {
                        const trimmed = param.trim();
                        if (trimmed) paramsToRemove.add(trimmed);
                    });
                }
                
                // Remove specified parameters
                paramsToRemove.forEach(param => {
                    url.searchParams.delete(param);
                });
            }
            
            return url.toString();
        } catch (error) {
            // Return original if URL is invalid
            return urlString;
        }
    };

    // Process all URLs
    const handleCleanUrls = ({ inputUrls, settings }) => {
        if (!inputUrls.trim()) return;
        
        setBusy(true);
        
        // Simulate processing delay for better UX
        setTimeout(() => {
            const urls = inputUrls.trim().split('\n');
            const results = urls.map(url => cleanUrl(url, settings));
            
            setCleanedUrls(results.join('\n'));
            setBusy(false);
        }, 300);
    };

    // Copy to clipboard
    const handleCopy = async () => {
        if (!cleanedUrls) return;
        
        try {
            await navigator.clipboard.writeText(cleanedUrls);
            
            // Show copied feedback
            const btn = copyButtonRef.current;
            if (btn) {
                btn.classList.add('copied');
                setTimeout(() => btn.classList.remove('copied'), 2000);
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    // Download as text file
    const handleDownload = () => {
        if (!cleanedUrls) return;
        
        const blob = new Blob([cleanedUrls], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cleaned-urls-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Clear all
    const handleClear = () => {
        setCleanedUrls('');
    };

    return html`
        <${StoreContext.Provider} value=${store}>
            <div className="clean-urls">
                <${SettingCard}
                    onSubmit=${handleCleanUrls}
                    onClear=${handleClear}
                />

                <${OutputCard}
                    cleanedUrls=${cleanedUrls}
                    copyButtonRef=${copyButtonRef}
                    onCopy=${handleCopy}
                    onDownload=${handleDownload}
                />
            </div>
        <//>
    `;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app');
    if (appContainer) {
        render(html`<${BatchUrlCleaner} />`, appContainer);
    }
});
