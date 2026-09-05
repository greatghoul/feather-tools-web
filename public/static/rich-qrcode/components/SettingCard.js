import { html } from 'htm/preact';
import { useState, useEffect, useContext } from 'preact/hooks';
import { useStore } from '~/contexts/StoreContext.js';
import { getText } from '~/helpers/utils.js';

// SettingCard component for QR code settings panel
// Props:
//   linkInfo: { title: string, url: string }
//   onGenerate: function - callback for generate button click
//   loading: boolean - loading state
const SettingCard = ({ linkInfo, onGenerate }) => {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { busy, setBusy } = useStore();

    const handleSubmit = () => {
        // Don't submit if URL is empty
        if (!url) {
            return;
        }
        
        setSubmitting(true);
        setBusy(true);
        onGenerate({ title, url });
    };

    useEffect(() => {
        setTitle((linkInfo && linkInfo.title) || '');
        setUrl((linkInfo && linkInfo.url) || '');
    }, [linkInfo]);

    // Monitor busy state and reset submitting when busy becomes false
    useEffect(() => {
        if (!busy) {
            setSubmitting(false);
        }
    }, [busy]);

    return html`
        <div class="card h-100">
            <div class="card-header bg-light">
                <h5 class="mb-0">${getText('rich-qrcode/settings/title')}</h5>
            </div>
            <div class="card-body">
                <div class="form-group mb-3">
                    <label for="title-input">${getText('rich-qrcode/settings/title_label')}</label>
                    <input
                        type="text"
                        class="form-control"
                        id="title-input"
                        placeholder=${getText('rich-qrcode/settings/title_placeholder')}
                        value=${title}
                        onInput=${e => setTitle(e.target.value)}
                        disabled=${busy}
                    />
                </div>
                <div class="form-group mb-3">
                    <label for="url-display">${getText('rich-qrcode/settings/url_label')}</label>
                    <input
                        type="text"
                        class="form-control"
                        id="url-display"
                        placeholder=${getText('rich-qrcode/settings/url_placeholder')}
                        value=${url}
                        onInput=${e => setUrl(e.target.value.trim())}
                        disabled=${busy}
                    />
                </div>
                <div class="d-grid gap-2">
                    <button
                        type="button"
                        class="btn btn-primary"
                        id="generate-btn"
                        onClick=${handleSubmit}
                        disabled=${busy || !url}
                    >
                        <span class="generate-btn-text">${submitting ? getText('rich-qrcode/settings/generating') : getText('rich-qrcode/settings/generate')}</span>
                        <span
                            class="spinner-border spinner-border-sm ms-1${submitting ? '' : ' d-none'}"
                            role="status"
                            aria-hidden="true"
                            id="generate-spinner"
                        ></span>
                    </button>
                </div>
            </div>
        </div>
    `;
};

export default SettingCard;
