import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { useStore } from '~/contexts/StoreContext.js';
import { notify } from '~/helpers/messages.js';
import { getText } from '~/helpers/utils.js';
import axios from 'axios';

const DEFAULT_URL = 'https://feather-tools.com/rich-qrcode';

const LinkFetchForm = ({ onFetched }) =>  {
    const { busy, setBusy } = useStore();
    const [fetching, setFetching] = useState(false);
    const [url, setUrl] = useState(null);
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
                
                notify(getText('rich-qrcode/link_fetch/fetch_success'), '', 'success');
                
                onFetched(data);
            })
            .catch(error => {
                console.error('Error fetching metadata:', error);
                
                notify(getText('rich-qrcode/link_fetch/fetch_error'), getText('rich-qrcode/link_fetch/fetch_error_hint'), 'error');
                onFetched({
                    title: getText('rich-qrcode/preview/placeholder_text'),
                    url: url
                })
            })
            .finally(() => {
                setBusy(false);
                setFetching(false);
            });
    };

    return html`
        <form id="rich-qrcode-form" class="mb-4" onSubmit=${handleSubmit}>
            <div class="url-input-container">
                <div class="input-group input-group-lg">
                    <input
                        type="url"
                        class="form-control form-control-lg"
                        id="url-input"
                        placeholder=${getText('rich-qrcode/link_fetch/placeholder')}
                        value=${url}
                        onInput=${e => setUrl(e.target.value)}
                        aria-label="URL to create Rich QR code for"
                        disabled=${busy}
                    />
                    <button
                        type="submit"
                        class="btn btn-primary"
                        id="fetch-metadata-btn"
                        disabled=${busy}
                    >
                        <span class="fetch-btn-text">${fetching ? getText('rich-qrcode/link_fetch/fetching') : getText('rich-qrcode/link_fetch/fetch')}</span>
                        <span
                            class="spinner-border spinner-border-sm ms-1${fetching ? '' : ' d-none'}"
                            role="status"
                            aria-hidden="true"
                            id="fetch-spinner"
                        ></span>
                    </button>
                </div>
            </div>
        </form>
    `;
}

export default LinkFetchForm;
