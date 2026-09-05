import { t } from '~/helpers/i18n';

const ControlsCard = ({
    onPlay,
    onStop,
    isSpeaking,
    rate,
    onRateChange,
    pitch,
    onPitchChange,
    voiceIndex,
    onVoiceChange,
    voices,
    voicesReady,
    commonVoiceIndices,
    supported,
    paragraphs,
    currentParagraph,
    estimatedDuration,
}) => {
    if (!supported) {
        return (
<>

            <div className="card">
                <div className="card-body text-center text-danger py-4">
                    {t('text-to-speech/message/not_supported')}
                </div>
            </div>
        
</>
);
    }

    const showPlay = !isSpeaking;
    const hasText = paragraphs.length > 0;

    const formatDuration = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    const commonIndicesSet = new Set(commonVoiceIndices);

    const commonOptions: any[] = [];
    const otherOptions: any[] = [];
    voices.forEach((v, i) => {
        const opt = (
<>
<option value={i}>{v.name} ({v.lang})</option>
</>
);
        if (commonIndicesSet.has(i)) {
            commonOptions.push(opt);
        } else {
            otherOptions.push(opt);
        }
    });

    return (
<>

        <div className="card">
            <div className="card-header bg-light">
                <div className="row g-2 align-items-center">
                    <div className="col-md-3">
                        <label className="small mb-0 d-block">{t('text-to-speech/controls/voice')}</label>
                        <select className="form-select form-select-sm" value={voiceIndex} onChange={onVoiceChange} disabled={!voicesReady}>
                            {commonOptions.length > 0 ? (
<>

                                <optgroup label="Common">
                                    {commonOptions}
                                </optgroup>
                            
</>
) : null}
                            {otherOptions.length > 0 ? (
<>

                                <optgroup label="Other">
                                    {otherOptions}
                                </optgroup>
                            
</>
) : null}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="small mb-0 d-block">{t('text-to-speech/controls/rate')}: {rate.toFixed(2)}</label>
                        <input type="range" className="form-range" min="0.5" max="2" step="0.1" value={rate} onInput={onRateChange} />
                    </div>
                    <div className="col-md-3">
                        <label className="small mb-0 d-block">{t('text-to-speech/controls/pitch')}: {pitch.toFixed(2)}</label>
                        <input type="range" className="form-range" min="0" max="2" step="0.1" value={pitch} onInput={onPitchChange} />
                    </div>
                    <div className="col-md-3">
                        <div className="d-grid gap-1">
                            {showPlay ? (
<>

                                <button className="btn btn-sm btn-primary" onClick={onPlay} disabled={!hasText}>
                                    <i className="bi bi-play-fill"></i> {t('text-to-speech/controls/play')}
                                </button>
                            
</>
) : (
<>

                                <button className="btn btn-sm btn-danger" onClick={onStop}>
                                    <i className="bi bi-stop-fill"></i> {t('text-to-speech/controls/stop')}
                                </button>
                            
</>
)}
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {paragraphs.length === 0 ? (
<>

                    <p className="text-muted text-center mb-0 py-3">{t('text-to-speech/status/no_text')}</p>
                
</>
) : (
<>

                    <div className="list-group list-group-flush">
                        {paragraphs.map((p, i) => (
<>

                            <div className="list-group-item border-0 py-2" style={{ borderLeft: `3px solid ${i === currentParagraph ? 'var(--bs-primary)' : 'transparent'}`, background: i === currentParagraph ? 'var(--bs-primary-bg-subtle)' : 'transparent' }}>
                                <span className={i === currentParagraph ? 'fw-medium' : ''}>
                                    {p.length > 120 ? p.slice(0, 120) + '...' : p}
                                </span>
                            </div>
                        
</>
))}
                    </div>
                
</>
)}
            </div>
            <div className="card-footer bg-light text-muted small d-flex justify-content-between align-items-center">
                <span>{paragraphs.length} {t('text-to-speech/body/paragraphs')}</span>
                <span>{t('text-to-speech/status/duration')}: {formatDuration(estimatedDuration)}</span>
            </div>
        </div>
    
</>
);
};

export default ControlsCard;
