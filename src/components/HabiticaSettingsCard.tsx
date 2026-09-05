import { useEffect, useState } from 'react';
import { t } from '~/helpers/i18n';

const STORAGE_KEY = 'habitica-credentials';
const LEGACY_STORAGE_KEY = 'habitica-batch-tasks-credentials';

const CREDENTIALS_DOC_URL = 'https://habitica.com/user/settings/siteData';

const readStorage = (key) => {
    const stored = localStorage.getItem(key);
    if (!stored) {
        return null;
    }
    try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
            return {
                userId: typeof parsed.userId === 'string' ? parsed.userId : '',
                apiToken: typeof parsed.apiToken === 'string' ? parsed.apiToken : ''
            };
        }
    } catch (_) {
        // ignore corrupt storage
    }
    return null;
};

const hasValue = (settings) => Boolean(settings && (settings.userId || settings.apiToken));

const loadSettings = () => {
    const current = readStorage(STORAGE_KEY);
    if (hasValue(current)) {
        return current;
    }
    const legacy = readStorage(LEGACY_STORAGE_KEY);
    if (hasValue(legacy)) {
        return legacy;
    }
    return current || { userId: '', apiToken: '' };
};

const HabiticaSettingsCard = ({ onChange }) => {
    const [settings, setSettings] = useState<any>(loadSettings);

    useEffect(() => {
        if (onChange) {
            onChange(settings);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInput = (key) => (e) => {
        const value = e.target.value;
        const next = { ...settings, [key]: value };
        setSettings(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        if (onChange) {
            onChange(next);
        }
    };

    return (
<>

        <div className="card">
            <div className="card-header bg-light">
                <span><i className="bi bi-gear"></i> {t('habitica/settings/title')}</span>
            </div>
            <div className="card-body">
                <div className="alert alert-success py-2 small mb-2" role="alert">
                    <i className="bi bi-shield-check me-2"></i>
                    {t('habitica/settings/privacy_note')}
                </div>
                <div className="alert alert-info py-2 small mb-3" role="alert">
                    <i className="bi bi-question-circle me-2"></i>
                    {t('habitica/settings/credentials_hint')}
                    <a href={CREDENTIALS_DOC_URL} className="ms-2 fw-medium" target="_blank" rel="noopener">
                        {t('habitica/settings/credentials_link')}
                        <i className="bi bi-box-arrow-up-right ms-1" style={{ fontSize: '0.75em' }}></i>
                    </a>
                </div>
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label small mb-1">
                            {t('habitica/options/user_id')}
                        </label>
                        <input type="text" className="form-control form-control-sm" value={settings.userId} onInput={handleInput('userId')} placeholder={t('habitica/options/user_id_placeholder')} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label small mb-1">
                            {t('habitica/options/api_token')}
                        </label>
                        <input type="password" className="form-control form-control-sm" value={settings.apiToken} onInput={handleInput('apiToken')} placeholder={t('habitica/options/api_token_placeholder')} />
                    </div>
                </div>
            </div>
        </div>
    
</>
);
};

export default HabiticaSettingsCard;
