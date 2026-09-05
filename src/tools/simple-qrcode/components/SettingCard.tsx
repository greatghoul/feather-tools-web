import { t } from '~/helpers/i18n';
import styles from './SettingCard.module.css';

const SettingCard = ({ settings, creating, onSubmit }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newSettings = Object.fromEntries(formData);
        onSubmit(newSettings);
    };

    return (
<>

        <div className="card h-100">
            <div className="card-header">
                <h5 className="mb-0">{t('simple-qrcode/settings/title')}</h5>
            </div>
            <div className="card-body">
                <form id="qrcode-form" onSubmit={handleSubmit}>
                    <div className={styles.formGroupClass}>
                        <label htmlFor="url">{t('simple-qrcode/settings/url')}</label>
                        <input type="url" className="form-control" id="url" name="url" placeholder="https://feather-tools.com/simple-qrcode" value={settings.url} />
                    </div>
                    
                    <div className={styles.formGroupClass}>
                        <label htmlFor="foreground">{t('simple-qrcode/settings/foreground')}</label>
                        <input type="color" className="form-control form-control-color" id="foreground" name="foreground" value={settings.foreground} />
                    </div>

                    <div className={styles.formGroupClass}>
                        <label htmlFor="background">{t('simple-qrcode/settings/background')}</label>
                        <input type="color" className="form-control form-control-color" id="background" name="background" value={settings.background} />
                    </div>

                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary mt-3" disabled={creating}>{t('simple-qrcode/settings/generate')}</button>
                    </div>
                </form>
            </div>
        </div>
    
</>
);
};

export default SettingCard;
