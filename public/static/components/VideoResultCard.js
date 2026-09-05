import { html } from 'htm/preact';

const VideoResultCard = ({ src, completeText, downloadText, onDownload }) => {
    if (!src) return null;

    return html`
        <div class="col-12">
            <div class="card border-success">
                <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-check-circle me-1"></i>${completeText}</span>
                    <button class="btn btn-sm btn-light" onClick=${onDownload}>
                        <i class="bi bi-download me-1"></i>${downloadText}
                    </button>
                </div>
                <div class="card-body p-0">
                    <video controls class="w-100 video-player" src=${src} preload="auto"></video>
                </div>
            </div>
        </div>
    `;
};

export default VideoResultCard;
