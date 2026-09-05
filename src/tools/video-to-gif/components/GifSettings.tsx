import { useMemo } from 'react';
import { t } from '~/helpers/i18n';
import { estimateFrameCount } from '../services/VideoGifService';

const MAX_FRAMES = 200;

const MODES = [
    { value: 'fps', labelKey: 'video-to-gif/settings/mode_fps' },
    { value: 'interval', labelKey: 'video-to-gif/settings/mode_interval' },
    { value: 'count', labelKey: 'video-to-gif/settings/mode_count' },
];

const QUALITIES = [
    { value: 5, labelKey: 'video-to-gif/settings/quality_high' },
    { value: 10, labelKey: 'video-to-gif/settings/quality_medium' },
    { value: 20, labelKey: 'video-to-gif/settings/quality_low' },
];

const GifSettings = ({
    mode,
    fps,
    interval,
    count,
    width,
    quality,
    duration,
    videoWidth,
    isGenerating,
    onModeChange,
    onFpsChange,
    onIntervalChange,
    onCountChange,
    onWidthChange,
    onQualityChange,
    onGenerate,
}) => {
    const estimated = useMemo(
        () => estimateFrameCount(duration, mode, fps, interval, count),
        [duration, mode, fps, interval, count]
    );

    const overLimit = estimated > MAX_FRAMES;
    const canGenerate = duration > 0 && !isGenerating && !overLimit && estimated > 0;

    const widthOptions = useMemo(() => {
        const presets = [320, 480, 640, 800];
        const options: { value: number; labelKey?: string; label?: string }[] = [{ value: 0, labelKey: 'video-to-gif/settings/width_original' }];
        presets.forEach((w) => {
            if (!videoWidth || w < videoWidth) {
                options.push({ value: w, label: `${w}px` });
            }
        });
        return options;
    }, [videoWidth]);

    return (
<>

        <div className="card">
            <div className="card-header bg-light">
                <span>{t('video-to-gif/settings/title')}</span>
            </div>
            <div className="card-body">
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label small">
                            {t('video-to-gif/settings/mode')}
                        </label>
                        <div className="btn-group w-100" role="group">
                            {MODES.map((m) => (
<>

                                <button key={m.value} type="button" className={`btn btn-sm ${mode === m.value ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => onModeChange(m.value)} disabled={isGenerating}>
                                    {t(m.labelKey)}
                                </button>
                            
</>
))}
                        </div>
                    </div>

                    {mode === 'fps' ? (
<>

                        <div className="col-md-6">
                            <label className="form-label small">
                                {t('video-to-gif/settings/fps')}
                            </label>
                            <input type="number" className="form-control" value={fps} min="1" max="30" step="1" disabled={isGenerating} onInput={(e) => onFpsChange(Math.max(1, parseInt((e.target as HTMLInputElement).value, 10) || 1))} />
                        </div>
                    
</>
) : null}

                    {mode === 'interval' ? (
<>

                        <div className="col-md-6">
                            <label className="form-label small">
                                {t('video-to-gif/settings/interval')}
                            </label>
                            <input type="number" className="form-control" value={interval} min="0.1" max="60" step="0.1" disabled={isGenerating} onInput={(e) => onIntervalChange(Math.max(0.1, parseFloat((e.target as HTMLInputElement).value) || 0.1))} />
                        </div>
                    
</>
) : null}

                    {mode === 'count' ? (
<>

                        <div className="col-md-6">
                            <label className="form-label small">
                                {t('video-to-gif/settings/count')}
                            </label>
                            <input type="number" className="form-control" value={count} min="1" max={MAX_FRAMES} step="1" disabled={isGenerating} onInput={(e) => onCountChange(Math.max(1, parseInt((e.target as HTMLInputElement).value, 10) || 1))} />
                        </div>
                    
</>
) : null}

                    <div className="col-md-6">
                        <label className="form-label small">
                            {t('video-to-gif/settings/width')}
                        </label>
                        <select className="form-select" value={width} disabled={isGenerating} onChange={(e) => onWidthChange(parseInt(e.target.value, 10) || 0)}>
                            {widthOptions.map((opt) => (
<>

                                <option value={opt.value}>
                                    {opt.label ? opt.label : t(opt.labelKey!)}
                                </option>
                            
</>
))}
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small">
                            {t('video-to-gif/settings/quality')}
                        </label>
                        <div className="btn-group w-100" role="group">
                            {QUALITIES.map((q) => (
<>

                                <button key={q.value} type="button" className={`btn btn-sm ${quality === q.value ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => onQualityChange(q.value)} disabled={isGenerating}>
                                    {t(q.labelKey)}
                                </button>
                            
</>
))}
                        </div>
                    </div>

                </div>
            </div>
            <div className="card-footer">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <span className="small text-muted">
                        {t('video-to-gif/settings/estimated_frames')}:
                        <strong className={overLimit ? 'text-danger' : 'text-body'}>{estimated}</strong>
                        {overLimit ? (
<>

                            <span className="badge bg-danger ms-2">max {MAX_FRAMES}</span>
                        
</>
) : null}
                    </span>
                    <button className="btn btn-success" onClick={onGenerate} disabled={!canGenerate}>
                        {isGenerating ? (
<>

                            <span className="spinner-border spinner-border-sm me-1"></span>
                            {t('video-to-gif/button/generating')}
                        
</>
) : (
<>

                            {t('video-to-gif/button/generate')}
                        
</>
)}
                    </button>
                </div>
            </div>
        </div>
    
</>
);
};

export default GifSettings;
