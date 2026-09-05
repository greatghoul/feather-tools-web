import { t } from '~/helpers/i18n';
import ColorPicker from '~/components/ColorPicker';
import styles from './SettingsCard.module.css';

const SettingsCard = ({
    lineColor,
    onLineColorChange,
    presetColors,
    lineHeight,
    onLineHeightChange,
    paddingVertical,
    onPaddingVerticalChange,
    paddingHorizontal,
    onPaddingHorizontalChange,
    marginOptions,
    orientation,
    onOrientationChange,
    orientationOptions,
}) => {
    return (
<>

        <div className={styles.cardStyle}>
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <ul className="nav nav-tabs card-header-tabs">
                        <li className="nav-item">
                            <a className="nav-link active" href="#">
                                <i className="bi bi-gear me-1"></i>{t('line-paper/settings/card_title')}
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <label className="form-label">{t('line-paper/settings/line_color')}</label>
                        <ColorPicker value={lineColor} onChange={onLineColorChange} presets={presetColors} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="lineHeightSlider">{t('line-paper/settings/line_height')}</label>
                        <div className={styles.sliderStyle}>
                            <div className="range-row">
                                <input type="range" id="lineHeightSlider" min="5" max="20" step="1" value={lineHeight} onInput={(e) => onLineHeightChange(Number((e.target as HTMLInputElement).value))} />
                                <span className="range-value">{lineHeight}mm</span>
                            </div>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="orientationSelect">{t('line-paper/settings/orientation')}</label>
                        <select id="orientationSelect" className="form-select" value={orientation} onChange={(e) => onOrientationChange(e.target.value)}>
                            {orientationOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="paddingVerticalSelect">{t('line-paper/settings/padding_vertical')}</label>
                        <select id="paddingVerticalSelect" className="form-select" value={paddingVertical} onChange={(e) => onPaddingVerticalChange(e.target.value)}>
                            {marginOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="paddingHorizontalSelect">{t('line-paper/settings/padding_horizontal')}</label>
                        <select id="paddingHorizontalSelect" className="form-select" value={paddingHorizontal} onChange={(e) => onPaddingHorizontalChange(e.target.value)}>
                            {marginOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    
</>
);
};

export default SettingsCard;
