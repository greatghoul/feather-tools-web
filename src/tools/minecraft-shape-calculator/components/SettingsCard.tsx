import { t } from '~/helpers/i18n';

const clampNumber = (value, min, max) => {
    const n = Number(value);
    if (!Number.isFinite(n)) {
        return String(min);
    }
    return String(Math.min(max, Math.max(min, Math.round(n))));
};

const SettingsCard = ({ shape, onShapeChange, mode, onModeChange, diameter, onDiameterChange, width, onWidthChange, height, onHeightChange, cornerRadius, maxCornerRadius, onCornerRadiusChange, thickness, maxThickness, onThicknessChange, onCalculate }) => {
    return (
<>

        <div className="card">
            <div className="card-header bg-light">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <a className="nav-link active" href="#">
                            <i className="bi bi-grid-3x3-gap me-1"></i>{t('minecraft-shape-calculator/settings/title')}
                        </a>
                    </li>
                </ul>
            </div>
            <div className="card-body">
                <div className="row g-3">
                    <div className="col-12">
                        <label className="form-label small mb-1">{t('minecraft-shape-calculator/settings/shape')}</label>
                        <div className="d-flex gap-4 flex-wrap">
                            <div className="form-check">
                                <input className="form-check-input" type="radio" id="shape-circle" name="shape" value="circle" checked={shape === 'circle'} onChange={(e) => onShapeChange((e.target as HTMLInputElement).value)} />
                                <label className="form-check-label small" htmlFor="shape-circle">{t('minecraft-shape-calculator/settings/circle')}</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" id="shape-rounded-rectangle" name="shape" value="rounded_rectangle" checked={shape === 'rounded_rectangle'} onChange={(e) => onShapeChange((e.target as HTMLInputElement).value)} />
                                <label className="form-check-label small" htmlFor="shape-rounded-rectangle">{t('minecraft-shape-calculator/settings/rounded_rectangle')}</label>
                            </div>
                        </div>
                    </div>
                    <div className="col-12">
                        <label className="form-label small mb-1">{t('minecraft-shape-calculator/settings/mode')}</label>
                        <div className="d-flex gap-4 flex-wrap">
                            <div className="form-check">
                                <input className="form-check-input" type="radio" id="mode-solid" name="mode" value="solid" checked={mode === 'solid'} onChange={(e) => onModeChange((e.target as HTMLInputElement).value)} />
                                <label className="form-check-label small" htmlFor="mode-solid">{t('minecraft-shape-calculator/settings/solid')}</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" id="mode-outline" name="mode" value="outline" checked={mode === 'outline'} onChange={(e) => onModeChange((e.target as HTMLInputElement).value)} />
                                <label className="form-check-label small" htmlFor="mode-outline">{t('minecraft-shape-calculator/settings/outline')}</label>
                            </div>
                        </div>
                    </div>
                    <div className={`col-12 ${shape === 'circle' ? '' : 'd-none'}`}>
                        <label className="form-label small mb-1">{t('minecraft-shape-calculator/settings/diameter')}</label>
                        <input type="number" className="form-control form-control-sm" min="3" max="100" step="1" value={diameter} onInput={(e) => onDiameterChange((e.target as HTMLInputElement).value)} onBlur={(e) => onDiameterChange(clampNumber((e.target as HTMLInputElement).value, 3, 100))} />
                    </div>
                    <div className={`col-12 ${shape === 'circle' ? 'd-none' : ''}`}>
                        <label className="form-label small mb-1">{t('minecraft-shape-calculator/settings/width')}</label>
                        <input type="number" className="form-control form-control-sm" min="3" max="200" step="1" value={width} onInput={(e) => onWidthChange((e.target as HTMLInputElement).value)} onBlur={(e) => onWidthChange(clampNumber((e.target as HTMLInputElement).value, 3, 200))} />
                    </div>
                    <div className={`col-12 ${shape === 'circle' ? 'd-none' : ''}`}>
                        <label className="form-label small mb-1">{t('minecraft-shape-calculator/settings/height')}</label>
                        <input type="number" className="form-control form-control-sm" min="3" max="200" step="1" value={height} onInput={(e) => onHeightChange((e.target as HTMLInputElement).value)} onBlur={(e) => onHeightChange(clampNumber((e.target as HTMLInputElement).value, 3, 200))} />
                    </div>
                    <div className={`col-12 ${shape === 'circle' ? 'd-none' : ''}`}>
                        <label className="form-label small mb-1">
                            {t('minecraft-shape-calculator/settings/corner_radius')}: {cornerRadius}
                        </label>
                        <input type="range" className="form-range" min="1" max={maxCornerRadius} step="1" value={cornerRadius} onInput={(e) => onCornerRadiusChange((e.target as HTMLInputElement).value)} />
                    </div>
                    <div className={`col-12 ${mode === 'outline' ? '' : 'd-none'}`}>
                        <label className="form-label small mb-1">
                            {t('minecraft-shape-calculator/settings/thickness')}: {thickness}
                        </label>
                        <input type="range" className="form-range" min="1" max={maxThickness} step="1" value={thickness} onInput={(e) => onThicknessChange((e.target as HTMLInputElement).value)} />
                    </div>
                </div>
            </div>
            <div className="card-footer bg-light">
                <button className="btn btn-primary w-100" onClick={onCalculate}>
                    <i className="bi bi-calculator me-1"></i>{t('minecraft-shape-calculator/settings/calculate')}
                </button>
            </div>
        </div>
    
</>
);
};

export default SettingsCard;
