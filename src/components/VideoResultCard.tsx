
const VideoResultCard = ({ src, completeText, downloadText, onDownload }) => {
    if (!src) return null;

    return (
<>

        <div className="col-12">
            <div className="card border-success">
                <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                    <span><i className="bi bi-check-circle me-1"></i>{completeText}</span>
                    <button className="btn btn-sm btn-light" onClick={onDownload}>
                        <i className="bi bi-download me-1"></i>{downloadText}
                    </button>
                </div>
                <div className="card-body p-0">
                    <video controls className="w-100 video-player" src={src} preload="auto"></video>
                </div>
            </div>
        </div>
    
</>
);
};

export default VideoResultCard;
