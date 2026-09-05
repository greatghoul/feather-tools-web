import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const ResultCard = ({ resultUrl, fileName, fileSize, onDownload, onClear }) => {
    return html`
        <div class="card border-success">
            <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <span><i class="bi bi-check-circle me-1"></i>${getText('gif-cut/result/title')}</span>
                <div>
                    <button class="btn btn-sm btn-light me-2" onClick=${onDownload}>
                        <i class="bi bi-download me-1"></i>${getText('gif-cut/button/download')}
                    </button>
                    <button class="btn btn-sm btn-outline-light" onClick=${onClear}>
                        ${getText('gif-cut/button/clear')}
                    </button>
                </div>
            </div>
            <div class="card-body text-center">
                <img src=${resultUrl} alt="cut result" class="img-fluid" style="max-height: 400px;" />
                <div class="mt-2 text-muted small">
                    ${fileName} (${formatSize(fileSize)})
                </div>
            </div>
        </div>
    `;
};

export default ResultCard;
