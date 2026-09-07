import { t } from '~/helpers/i18n';

export interface WheelSettings {
    dedup: boolean;
    removeWinner: boolean;
}

interface OptionsCardProps {
    settings: WheelSettings;
    onSettingsChange: (settings: WheelSettings) => void;
    disabled: boolean;
}

const OptionsCard = ({ settings, onSettingsChange, disabled }: OptionsCardProps) => {
    return (
        <div className="card">
            <div className="card-header">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <a className="nav-link active" href="#" onClick={(e) => e.preventDefault()}>
                            {t('random-wheel/options/title')}
                        </a>
                    </li>
                </ul>
            </div>
            <div className="card-body">
                <div className="form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="random-wheel-dedup"
                        checked={settings.dedup}
                        disabled={disabled}
                        onChange={(e) => onSettingsChange({ ...settings, dedup: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="random-wheel-dedup">
                        {t('random-wheel/options/dedup')}
                    </label>
                </div>
                <div className="form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="random-wheel-remove-winner"
                        checked={settings.removeWinner}
                        disabled={disabled}
                        onChange={(e) => onSettingsChange({ ...settings, removeWinner: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="random-wheel-remove-winner">
                        {t('random-wheel/options/remove_winner')}
                    </label>
                </div>
            </div>
        </div>
    );
};

export default OptionsCard;
