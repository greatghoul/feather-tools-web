import { t } from '~/helpers/i18n';

const FrameGrid = ({
    frames,
    selectedIndices,
    onToggleSelect,
    onSelectAll,
    onDeselectAll,
    onDownloadFrame,
    onCopyFrame,
    onDownloadAll,
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
                        {t('gif-frames/result/title')}
                        ({frames.length})
                    </span>
                    <div className="d-flex flex-wrap gap-2">
                        <button className="btn btn-sm btn-outline-secondary" onClick={allSelected ? onDeselectAll : onSelectAll}>
                            {allSelected
                                ? t('gif-frames/button/deselect_all')
                                : t('gif-frames/button/select_all')}
                        </button>
                        <button className="btn btn-sm btn-outline-primary" onClick={onDownloadAll}>
                            <i className="bi bi-download me-1"></i>
                            {t('gif-frames/button/download_all')}
                        </button>
                        <button className="btn btn-sm btn-outline-primary" onClick={onDownloadSelected} disabled={!someSelected}>
                            <i className="bi bi-download me-1"></i>
                            {t('gif-frames/button/download_selected')}
                            {someSelected ? (
<>
<span className="badge bg-primary ms-1">{selectedIndices.size}</span>
</>
) : null}
                        </button>
                        <button className="btn btn-sm btn-success" onClick={onPlaySelected} disabled={!someSelected}>
                            <i className="bi bi-play-fill me-1"></i>
                            {t('gif-frames/button/play_selected')}
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
                                        {t('gif-frames/result/frame')} {frame.index + 1}
                                    </span>
                                    <span className="frame-delay">
                                        {frame.delay}ms
                                    </span>
                                </div>
                                <div className="frame-actions">
                                    <button className="btn btn-sm btn-outline-primary" onClick={() => onDownloadFrame(frame.index)} title={t('gif-frames/result/download_frame')}>
                                        {t('gif-frames/button/download')}
                                    </button>
                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => onCopyFrame(frame.index)} title={t('gif-frames/result/copy_frame')}>
                                        {t('gif-frames/button/copy')}
                                    </button>
                                </div>
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
