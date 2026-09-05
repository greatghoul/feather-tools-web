import { t } from '~/helpers/i18n';
import ColorPicker from '~/components/ColorPicker';
import styles from './SettingsCard.module.css';

const SettingsCard = ({
    style,
    onStyleChange,
    lineColor,
    onLineColorChange,
    presetColors,
    cellSize,
    onCellSizeChange,
    paddingVertical,
    onPaddingVerticalChange,
    paddingHorizontal,
    onPaddingHorizontalChange,
    marginOptions,
    orientation,
    onOrientationChange,
    orientationOptions,
    styleOptions,
}) => {
    return (
<>

        <div className={styles.cardStyle}>
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <ul className="nav nav-tabs card-header-tabs">
                        <li className="nav-item">
                            <a className="nav-link active" href="#">
                                <i className="bi bi-gear me-1"></i>{t('hanzi-paper/settings/card_title')}
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <label className="form-label">{t('hanzi-paper/settings/style')}</label>
                        <select className="form-select" value={style} onChange={(e) => onStyleChange(e.target.value)}>
                            {styleOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">{t('hanzi-paper/settings/line_color')}</label>
                        <ColorPicker value={lineColor} onChange={onLineColorChange} presets={presetColors} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="cellSizeSlider">{t('hanzi-paper/settings/cell_size')}</label>
                        <div className={styles.sliderStyle}>
                            <div className="range-row">
                                <input type="range" id="cellSizeSlider" min="10" max="30" step="1" value={cellSize} onInput={(e) => onCellSizeChange(Number((e.target as HTMLInputElement).value))} />
                                <span className="range-value">{cellSize}mm</span>
                            </div>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="orientationSelect">{t('hanzi-paper/settings/orientation')}</label>
                        <select id="orientationSelect" className="form-select" value={orientation} onChange={(e) => onOrientationChange(e.target.value)}>
                            {orientationOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="paddingVerticalSelect">{t('hanzi-paper/settings/padding_vertical')}</label>
                        <select id="paddingVerticalSelect" className="form-select" value={paddingVertical} onChange={(e) => onPaddingVerticalChange(e.target.value)}>
                            {marginOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="paddingHorizontalSelect">{t('hanzi-paper/settings/padding_horizontal')}</label>
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
