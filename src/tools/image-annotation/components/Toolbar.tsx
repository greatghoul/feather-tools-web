import { t } from '~/helpers/i18n';
import InputNumber from '~/components/InputNumber';
import { TOOL_LABELS } from '../services/AnnotationEngine';
import styles from './Toolbar.module.css';

const Toolbar = ({
    tool,
    toolKeys,
    strokeColor,
    strokeWidth,
    fillEnabled,
    fillOpacity,
    cornerRadius,
    blockSize,
    isShapeTool,
    onToolChange,
    onStrokeColorChange,
    onStrokeWidthChange,
    onFillEnabledChange,
    onFillOpacityChange,
    onCornerRadiusChange,
    onBlockSizeChange,
    imageId,
}) => {
    return (
<>

        <div className="col-12 col-md-2 d-flex flex-column gap-2 bg-light rounded p-2" style={{ minWidth: '200px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,auto)', gap: '4px' }} className="pb-2">
                {toolKeys.map((tKey) => {
                    const isSelect = tKey === 'select';
                    const btnClass = tool === tKey
                        ? 'btn-primary'
                        : 'btn-outline-secondary';
                    const icon = isSelect ? 'bi-cursor' : TOOL_LABELS[tKey]?.icon || 'bi-circle';
                    const titleKey = isSelect
                        ? 'image-annotation/toolbar/select'
                        : TOOL_LABELS[tKey]?.key || '';
                    return (
                        <button key={tKey} className={`btn btn-sm ${btnClass}`} onClick={() => onToolChange(tKey)} title={t(titleKey)} style={{ padding: '0.2rem 0.4rem' }}>
                            <i className={`bi ${icon}`}></i>
                        </button>
                    );
                })}
            </div>
            <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center justify-content-between">
                    <small className="text-muted text-nowrap" style={{ fontSize: '0.7rem' }}>{t('image-annotation/toolbar/color')}</small>
                    <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: '0' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: strokeColor, border: '1px solid #adb5bd', cursor: 'pointer', pointerEvents: 'none' }}></div>
                        <input type="color" value={strokeColor} onChange={(e) => onStrokeColorChange(e.target.value)} style={{ position: 'absolute', left: '0', top: '0', width: '28px', height: '28px', padding: '0', border: 'none', opacity: '0', cursor: 'pointer' }} />
                    </div>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                    <small className="text-muted text-nowrap" style={{ fontSize: '0.7rem' }}>{t('image-annotation/toolbar/stroke_width')}</small>
                    <div className={styles.narrowInputStyle}>
                        <InputNumber value={strokeWidth} min={1} max={20} step={1} onChange={onStrokeWidthChange} />
                    </div>
                </div>
                {tool === 'roundedRect' && (
<>

                    <div className="d-flex align-items-center justify-content-between">
                        <small className="text-muted text-nowrap" style={{ fontSize: '0.7rem' }}>{t('image-annotation/toolbar/corner_radius')}</small>
                        <div className={styles.narrowInputStyle}>
                            <InputNumber value={cornerRadius} min={5} max={100} step={5} onChange={onCornerRadiusChange} />
                        </div>
                    </div>
                
</>
)}
                {isShapeTool && tool !== 'highlighter' && (
<>

                    <div className={`d-flex align-items-center justify-content-between form-switch ${styles.fillSwitchStyle}`}>
                        <small className="text-muted text-nowrap" style={{ fontSize: '0.7rem' }}>{t('image-annotation/settings/fill')}</small>
                        <input className="form-check-input" type="checkbox" id={`fill-${imageId}`} checked={fillEnabled} onChange={() => onFillEnabledChange(!fillEnabled)} style={{ cursor: 'pointer', marginTop: '0' }} />
                    </div>
                    {fillEnabled && (
<>

                        <div className="d-flex align-items-center justify-content-between">
                            <small className="text-muted text-nowrap" style={{ fontSize: '0.7rem' }}>{t('image-annotation/settings/fill_opacity')}</small>
                            <div className={styles.narrowInputStyle}>
                                <InputNumber value={fillOpacity} min={0} max={100} step={5} onChange={onFillOpacityChange} />
                            </div>
                        </div>
                    
</>
)}
                
</>
)}
                {tool === 'mosaic' && (
<>

                    <div className="d-flex align-items-center justify-content-between">
                        <small className="text-muted text-nowrap" style={{ fontSize: '0.7rem' }}>{t('image-annotation/toolbar/block_size')}</small>
                        <div className={styles.narrowInputStyle}>
                            <InputNumber value={blockSize} min={5} max={60} step={5} onChange={onBlockSizeChange} />
                        </div>
                    </div>
                
</>
)}
            </div>
        </div>
    
</>
);
};

export default Toolbar;
