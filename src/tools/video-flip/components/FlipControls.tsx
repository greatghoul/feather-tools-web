import { t } from '~/helpers/i18n';

const MODES = [
    { value: 'horizontal', icon: 'bi-arrow-left-right', labelKey: 'video-flip/mode/horizontal' },
    { value: 'vertical', icon: 'bi-arrow-up-down', labelKey: 'video-flip/mode/vertical' },
    { value: 'both', icon: 'bi-arrow-repeat', labelKey: 'video-flip/mode/both' },
];

const FlipControls = ({ flipMode, onChange, disabled }) => {
    return (
<>

        <div className="btn-group w-100" role="group" aria-label="flip mode">
            {MODES.map((mode) => (
                <button key={mode.value} type="button" className={`btn ${flipMode === mode.value ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => onChange(mode.value)} disabled={disabled}>
                    <i className={`bi ${mode.icon} me-1`}></i>
                    {t(mode.labelKey)}
                </button>
            ))}
        </div>
    
</>
);
};

export default FlipControls;
