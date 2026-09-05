import { html } from 'htm/preact';
import { useEffect, useState } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';

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
    const [settings, setSettings] = useState(loadSettings);

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

    return html`
        <div class="card">
            <div class="card-header bg-light">
                <span><i class="bi bi-gear"></i> ${getText('habitica/settings/title')}</span>
            </div>
            <div class="card-body">
                <div class="alert alert-success py-2 small mb-2" role="alert">
                    <i class="bi bi-shield-check me-2"></i>
                    ${getText('habitica/settings/privacy_note')}
                </div>
                <div class="alert alert-info py-2 small mb-3" role="alert">
                    <i class="bi bi-question-circle me-2"></i>
                    ${getText('habitica/settings/credentials_hint')}
                    <a href=${CREDENTIALS_DOC_URL} class="ms-2 fw-medium" target="_blank" rel="noopener">
                        ${getText('habitica/settings/credentials_link')}
                        <i class="bi bi-box-arrow-up-right ms-1" style="font-size: 0.75em;"></i>
                    </a>
                </div>
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label small mb-1">
                            ${getText('habitica/options/user_id')}
                        </label>
                        <input type="text" class="form-control form-control-sm"
                               value=${settings.userId}
                               onInput=${handleInput('userId')}
                               placeholder=${getText('habitica/options/user_id_placeholder')} />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small mb-1">
                            ${getText('habitica/options/api_token')}
                        </label>
                        <input type="password" class="form-control form-control-sm"
                               value=${settings.apiToken}
                               onInput=${handleInput('apiToken')}
                               placeholder=${getText('habitica/options/api_token_placeholder')} />
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default HabiticaSettingsCard;
