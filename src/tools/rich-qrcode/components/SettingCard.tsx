import { useState, useEffect, useContext } from 'react';
import { useStore } from '~/contexts/StoreContext';
import { t } from '~/helpers/i18n';

// SettingCard component for QR code settings panel
// Props:
//   linkInfo: { title: string, url: string }
//   onGenerate: function - callback for generate button click
//   loading: boolean - loading state
const SettingCard = ({ linkInfo, onGenerate }) => {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { busy, setBusy } = useStore() as any;

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

    return (
<>

        <div className="card h-100">
            <div className="card-header bg-light">
                <h5 className="mb-0">{t('rich-qrcode/settings/title')}</h5>
            </div>
            <div className="card-body">
                <div className="form-group mb-3">
                    <label htmlFor="title-input">{t('rich-qrcode/settings/title_label')}</label>
                    <input type="text" className="form-control" id="title-input" placeholder={t('rich-qrcode/settings/title_placeholder')} value={title} onInput={e => setTitle((e.target as HTMLInputElement).value)} disabled={busy} />
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="url-display">{t('rich-qrcode/settings/url_label')}</label>
                    <input type="text" className="form-control" id="url-display" placeholder={t('rich-qrcode/settings/url_placeholder')} value={url} onInput={e => setUrl((e.target as HTMLInputElement).value.trim())} disabled={busy} />
                </div>
                <div className="d-grid gap-2">
                    <button type="button" className="btn btn-primary" id="generate-btn" onClick={handleSubmit} disabled={busy || !url}>
                        <span className="generate-btn-text">{submitting ? t('rich-qrcode/settings/generating') : t('rich-qrcode/settings/generate')}</span>
                        <span className={`spinner-border spinner-border-sm ms-1${submitting ? '' : ' d-none'}`} role="status" aria-hidden="true" id="generate-spinner"></span>
                    </button>
                </div>
            </div>
        </div>
    
</>
);
};

export default SettingCard;
