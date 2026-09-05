import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';
import { downloadFile } from '~/helpers/files.js';
import { formatFileSize } from '@/services/VideoGifService.js';

const GifPreview = ({ result, baseName, onDownload }) => {
    if (!result) return null;

    const fileName = `${baseName}.gif`;

    const handleDownload = () => {
        downloadFile(result.blob, fileName);
        onDownload();
    };

    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <span>${getText('video-to-gif/result/title')}</span>
                <button
                    class="btn btn-sm btn-primary"
                    onClick=${handleDownload}
                >
                    <i class="bi bi-download me-1"></i>
                    ${getText('video-to-gif/button/download')}
                </button>
            </div>
            <div class="card-body">
                <div class="text-center mb-3 gif-preview-wrapper">
                    <img
                        src=${result.url}
                        alt=${fileName}
                        class="img-fluid gif-preview-image"
                    />
                </div>
                <div class="row text-center small g-2">
                    <div class="col-4">
                        <div class="text-muted">${getText('video-to-gif/result/dimensions')}</div>
                        <strong>${result.width}×${result.height}</strong>
                    </div>
                    <div class="col-4">
                        <div class="text-muted">${getText('video-to-gif/result/frames')}</div>
                        <strong>${result.frames}</strong>
                    </div>
                    <div class="col-4">
                        <div class="text-muted">${getText('video-to-gif/result/file_size')}</div>
                        <strong>${formatFileSize(result.size)}</strong>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default GifPreview;
