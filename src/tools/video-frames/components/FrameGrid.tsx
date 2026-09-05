import { t } from '~/helpers/i18n';
import { formatTimestamp } from '../services/VideoFramesService';

const FrameGrid = ({
    frames,
    selectedIndices,
    onToggleSelect,
    onSelectAll,
    onDeselectAll,
    onDownloadFrame,
    onDownloadSelected,
    onPlaySelected,
}) => {
    const allSelected = frames.length > 0 && selectedIndices.size === frames.length;
    const someSelected = selectedIndices.size > 0;

    return (
<>

        <div className="card frames-card">
            <div className="card-header bg-light">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <span>
                        {t('video-frames/result/title')}
                        ({frames.length})
                    </span>
                    <div className="d-flex flex-wrap gap-2">
                        <button className="btn btn-sm btn-outline-secondary" onClick={allSelected ? onDeselectAll : onSelectAll}>
                            {allSelected
                                ? t('video-frames/button/deselect_all')
                                : t('video-frames/button/select_all')}
                        </button>
                        <button className="btn btn-sm btn-outline-primary" onClick={onDownloadSelected} disabled={!someSelected}>
                            <i className="bi bi-download me-1"></i>
                            {t('video-frames/button/download_selected')}
                            {someSelected ? (
<>
<span className="badge bg-primary ms-1">{selectedIndices.size}</span>
</>
) : null}
                        </button>
                        <button className="btn btn-sm btn-success" onClick={onPlaySelected} disabled={!someSelected}>
                            <i className="bi bi-play-fill me-1"></i>
                            {t('video-frames/button/play_selected')}
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-body">
                <div className="frame-grid">
                    {frames.map((frame) => (
<>

                        <div key={frame.index} className={`frame-card ${selectedIndices.has(frame.index) ? 'selected' : ''}`}>
                            <div className="frame-thumbnail" onClick={() => onToggleSelect(frame.index)}>
                                <img className="frame-image" src={frame.url} alt={`Frame ${frame.index + 1}`} />
                                <div className={`frame-checkbox ${selectedIndices.has(frame.index) ? 'checked' : ''}`}>
                                    {selectedIndices.has(frame.index) ? (
<>
<i className="bi bi-check-lg"></i>
</>
) : null}
                                </div>
                            </div>
                            <div className="frame-body">
                                <div className="frame-info">
                                    <span className="frame-label">
                                        {t('video-frames/result/frame')} {frame.index + 1}
                                    </span>
                                    <span className="frame-timestamp">
                                        {formatTimestamp(frame.timestamp)}
                                    </span>
                                </div>
                                <button className="btn btn-sm btn-outline-primary w-100" onClick={() => onDownloadFrame(frame.index)}>
                                    <i className="bi bi-download me-1"></i>
                                    {t('video-frames/button/download')}
                                </button>
                            </div>
                        </div>
                    
</>
))}
                </div>
            </div>
        </div>
    
</>
);
};

export default FrameGrid;
