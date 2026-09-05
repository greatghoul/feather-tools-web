import { useState, useEffect } from 'react';
import { useStore } from '~/contexts/StoreContext';
import { notify } from '~/helpers/messages';
import { t } from '~/helpers/i18n';
import axios from 'axios';

const DEFAULT_URL = 'https://feather-tools.com/rich-qrcode';

const LinkFetchForm = ({ onFetched }) =>  {
    const { busy, setBusy } = useStore() as any;
    const [fetching, setFetching] = useState(false);
    const [url, setUrl] = useState<string | null>(null);
    const [shouldAutoSubmit, setShouldAutoSubmit] = useState(false);

    // Validate URL format
    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlParam = params.get('url');
        console.log('URL is', urlParam);
        
        // Only set URL if it exists and is valid
        if (urlParam && isValidUrl(urlParam)) {
            setUrl(urlParam);
            setShouldAutoSubmit(true);
        }
    }, []);

    // Auto-submit when URL is set and should auto-submit
    useEffect(() => {
        if (shouldAutoSubmit && url && isValidUrl(url)) {
            setShouldAutoSubmit(false); // Prevent multiple submissions
            handleSubmit(new Event('submit'));
        }
    }, [url, shouldAutoSubmit]);

    // Monitor busy state and sync fetching state
    useEffect(() => {
        if (!busy) {
            setFetching(false);
        }
    }, [busy]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Disable all form elements during fetch
        setBusy(true);
        setFetching(true);

        const params = {
            url: (url && url.trim()) || DEFAULT_URL,
        };

        axios.get('/api/link-meta', { params })
            .then(response => {
                const data = response.data;
                console.log('Metadata received:', data);
                
                notify(t('rich-qrcode/link_fetch/fetch_success'), '', 'success');
                
                onFetched(data);
            })
            .catch(error => {
                console.error('Error fetching metadata:', error);
                
                notify(t('rich-qrcode/link_fetch/fetch_error'), t('rich-qrcode/link_fetch/fetch_error_hint'), 'error');
                onFetched({
                    title: t('rich-qrcode/preview/placeholder_text'),
                    url: url
                })
            })
            .finally(() => {
                setBusy(false);
                setFetching(false);
            });
    };

    return (
<>

        <form id="rich-qrcode-form" className="mb-4" onSubmit={handleSubmit}>
            <div className="url-input-container">
                <div className="input-group input-group-lg">
                    <input type="url" className="form-control form-control-lg" id="url-input" placeholder={t('rich-qrcode/link_fetch/placeholder')} value={url ?? ''} onInput={e => setUrl((e.target as HTMLInputElement).value)} aria-label="URL to create Rich QR code for" disabled={busy} />
                    <button type="submit" className="btn btn-primary" id="fetch-metadata-btn" disabled={busy}>
                        <span className="fetch-btn-text">{fetching ? t('rich-qrcode/link_fetch/fetching') : t('rich-qrcode/link_fetch/fetch')}</span>
                        <span className={`spinner-border spinner-border-sm ms-1${fetching ? '' : ' d-none'}`} role="status" aria-hidden="true" id="fetch-spinner"></span>
                    </button>
                </div>
            </div>
        </form>
    
</>
);
}

export default LinkFetchForm;
