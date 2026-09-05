import { t } from '~/helpers/i18n';

const formatTime = (ms) => (ms / 1000).toFixed(2);

const CutControls = ({
    mode,
    onModeChange,
    totalFrames,
    totalDuration,
    startFrame,
    endFrame,
    startTime,
    endTime,
    onStartFrameChange,
    onEndFrameChange,
    onStartTimeChange,
    onEndTimeChange,
    onCut,
    isProcessing,
}) => {
    const canCut = !isProcessing && (
        mode === 'frame' ? startFrame < endFrame : startTime < endTime
    );

    const statsText = mode === 'frame'
        ? `${t('gif-cut/cut/selected_frames')}: ${endFrame - startFrame + 1} / ${totalFrames}`
        : `${t('gif-cut/cut/selected_duration')}: ${(endTime - startTime).toFixed(2)}s / ${formatTime(totalDuration)}s`;

    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
                <div className="btn-group btn-group-sm">
                    <button className={`btn ${mode === 'frame' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => onModeChange('frame')}>
                        {t('gif-cut/cut/mode_frame')}
                    </button>
                    <button className={`btn ${mode === 'second' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => onModeChange('second')}>
                        {t('gif-cut/cut/mode_second')}
                    </button>
                </div>
                <span className="text-muted small">{statsText}</span>
            </div>
            <div className="card-body">
                <div className="row g-3 align-items-end">
                    <div className="col-md-4">
                        <label className="form-label small mb-1">
                            {mode === 'frame'
                                ? t('gif-cut/timeline/start_frame')
                                : t('gif-cut/cut/start_time')}
                        </label>
                        {mode === 'frame' ? (
<>

                            <input type="number" className="form-control" value={startFrame + 1} min="1" max={endFrame + 1} disabled={isProcessing} onInput={(e) => {
                                    const val = parseInt((e.target as HTMLInputElement).value, 10);
                                    if (!isNaN(val) && val >= 1 && val <= endFrame + 1) {
                                        onStartFrameChange(val - 1);
                                    }
                                }} />
                        
</>
) : (
<>

                            <input type="number" className="form-control" value={startTime} min="0" max={endTime} step="0.01" disabled={isProcessing} onInput={(e) => {
                                    const val = parseFloat((e.target as HTMLInputElement).value);
                                    if (!isNaN(val) && val >= 0 && val <= endTime) {
                                        onStartTimeChange(val);
                                    }
                                }} />
                        
</>
)}
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small mb-1">
                            {mode === 'frame'
                                ? t('gif-cut/timeline/end_frame')
                                : t('gif-cut/cut/end_time')}
                        </label>
                        {mode === 'frame' ? (
<>

                            <input type="number" className="form-control" value={endFrame + 1} min={startFrame + 1} max={totalFrames} disabled={isProcessing} onInput={(e) => {
                                    const val = parseInt((e.target as HTMLInputElement).value, 10);
                                    if (!isNaN(val) && val >= startFrame + 1 && val <= totalFrames) {
                                        onEndFrameChange(val - 1);
                                    }
                                }} />
                        
</>
) : (
<>

                            <input type="number" className="form-control" value={endTime} min={startTime} max={formatTime(totalDuration)} step="0.01" disabled={isProcessing} onInput={(e) => {
                                    const val = parseFloat((e.target as HTMLInputElement).value);
                                    const maxVal = totalDuration / 1000;
                                    if (!isNaN(val) && val >= startTime && val <= maxVal) {
                                        onEndTimeChange(val);
                                    }
                                }} />
                        
</>
)}
                    </div>
                    <div className="col-md-4">
                        <div className="d-grid">
                            <button className="btn btn-success" onClick={onCut} disabled={!canCut}>
                                {isProcessing ? (
<>

                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                    {t('gif-cut/message/processing')}
                                
</>
) : t('gif-cut/button/cut')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    
</>
);
};

export default CutControls;
