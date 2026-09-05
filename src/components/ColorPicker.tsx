import styles from './ColorPicker.module.css';

/**
 * Color picker with preset swatches and custom color input.
 *
 * @param {Object} props
 * @param {string} props.value       - Current color value (preset key like 'blue' or hex '#ff0000')
 * @param {function} props.onChange  - Called with the new color value
 * @param {Array} props.presets      - [{ value: 'blue', hex: '#xxx', label: 'Blue' }]
 */
const ColorPicker = ({ value, onChange, presets = [] as any[] }) => {
    const isCustom = typeof value === 'string' && value.startsWith('#');
    const activeHex = isCustom
        ? value
        : (presets.find((p) => p.value === value)?.hex || '#333333');

    return (
<>

        <div className={styles.style}>
            <div className="cp-row">
                <div className="cp-group">
                    {presets.map((p) => (
                        <button className={`cp-btn ${value === p.value ? 'active' : ''}`} style={{ backgroundColor: p.hex }} title={p.label} onClick={() => onChange(p.value)} key={p.value}></button>
                    ))}
                </div>
                <div className="cp-selected">
                    <div className="cp-swatch" style={{ backgroundColor: activeHex }}></div>
                    <span className="cp-icon bi bi-pencil"></span>
                    <input type="color" className="cp-picker" value={activeHex} onInput={(e) => onChange((e.target as HTMLInputElement).value)} />
                </div>
            </div>
        </div>
    
</>
);
};

export default ColorPicker;
