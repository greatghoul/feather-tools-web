import { useMemo } from 'react';
import { t } from '~/helpers/i18n';
import { estimateFrameCount } from '../services/VideoFramesService';

const MAX_FRAMES = 500;

const MODES = [
    { value: 'fps', labelKey: 'video-frames/settings/mode_fps' },
    { value: 'interval', labelKey: 'video-frames/settings/mode_interval' },
    { value: 'count', labelKey: 'video-frames/settings/mode_count' },
];

const ExtractionSettings = ({
    mode,
    fps,
    interval,
    count,
    format,
    quality,
    duration,
    isExtracting,
    onModeChange,
    onFpsChange,
    onIntervalChange,
    onCountChange,
    onFormatChange,
    onQualityChange,
    onExtract,
}) => {
    const estimated = useMemo(
        () => estimateFrameCount(duration, mode, fps, interval, count),
        [duration, mode, fps, interval, count]
    );

    const overLimit = estimated > MAX_FRAMES;
    const canExtract = duration > 0 && !isExtracting && !overLimit && estimated > 0;

    return (
<>

        <div className="card">
            <div className="card-header bg-light">
                <span>{t('video-frames/settings/title')}</span>
            </div>
            <div className="card-body">
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label small">
                            {t('video-frames/settings/mode')}
                        </label>
                        <div className="btn-group w-100" role="group">
                            {MODES.map((m) => (
                                <button key={m.value} type="button" className={`btn btn-sm ${mode === m.value ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => onModeChange(m.value)} disabled={isExtracting}>
                                    {t(m.labelKey)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {mode === 'fps' ? (
<>

                        <div className="col-md-6">
                            <label className="form-label small">
                                {t('video-frames/settings/fps')}
                            </label>
                            <input type="number" className="form-control" value={fps} min="1" max="60" step="1" disabled={isExtracting} onInput={(e) => onFpsChange(Math.max(1, parseInt((e.target as HTMLInputElement).value, 10) || 1))} />
                        </div>
                    
</>
) : null}

                    {mode === 'interval' ? (
<>

                        <div className="col-md-6">
                            <label className="form-label small">
                                {t('video-frames/settings/interval')}
                            </label>
                            <input type="number" className="form-control" value={interval} min="0.1" max="60" step="0.1" disabled={isExtracting} onInput={(e) => onIntervalChange(Math.max(0.1, parseFloat((e.target as HTMLInputElement).value) || 0.1))} />
                        </div>
                    
</>
) : null}

                    {mode === 'count' ? (
<>

                        <div className="col-md-6">
                            <label className="form-label small">
                                {t('video-frames/settings/count')}
                            </label>
                            <input type="number" className="form-control" value={count} min="1" max={MAX_FRAMES} step="1" disabled={isExtracting} onInput={(e) => onCountChange(Math.max(1, parseInt((e.target as HTMLInputElement).value, 10) || 1))} />
                        </div>
                    
</>
) : null}

                    <div className="col-md-6">
                        <label className="form-label small">
                            {t('video-frames/settings/format')}
                        </label>
                        <div className="btn-group w-100" role="group">
                            <button type="button" className={`btn btn-sm ${format === 'image/png' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => onFormatChange('image/png')} disabled={isExtracting}>
                                {t('video-frames/settings/format_png')}
                            </button>
                            <button type="button" className={`btn btn-sm ${format === 'image/jpeg' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => onFormatChange('image/jpeg')} disabled={isExtracting}>
                                {t('video-frames/settings/format_jpeg')}
                            </button>
                        </div>
                    </div>

                    {format === 'image/jpeg' ? (
<>

                        <div className="col-md-6">
                            <label className="form-label small">
                                {t('video-frames/settings/quality')}:
                                {Math.round(quality * 100)}%
                            </label>
                            <input type="range" className="form-range" value={quality} min="0.1" max="1" step="0.05" disabled={isExtracting} onInput={(e) => onQualityChange(parseFloat((e.target as HTMLInputElement).value))} />
                        </div>
                    
</>
) : null}

                </div>
            </div>
            <div className="card-footer">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <span className="small text-muted">
                        {t('video-frames/settings/estimated_frames')}:
                        <strong className={overLimit ? 'text-danger' : 'text-body'}>{estimated}</strong>
                        {overLimit ? (
<>

                            <span className="badge bg-danger ms-2">max {MAX_FRAMES}</span>
                        
</>
) : null}
                    </span>
                    <button className="btn btn-success" onClick={onExtract} disabled={!canExtract}>
                        {isExtracting ? (
<>

                            <span className="spinner-border spinner-border-sm me-1"></span>
                            {t('video-frames/button/extracting')}
                        
</>
) : (
<>

                            {t('video-frames/button/extract')}
                        
</>
)}
                    </button>
                </div>
            </div>
        </div>
    
</>
);
};

export default ExtractionSettings;
