import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';
import { formatFileSize } from '@/services/GifMakerService.js';

const ResultCard = ({ result, isGenerating, progress, progressLabel, canGenerate, onGenerate, onDownload }) => {
    return html`
        <div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
                <ul class="nav nav-tabs card-header-tabs">
                    <li class="nav-item">
                        <a class="nav-link active" href="#">
                            <i class="bi bi-film me-1"></i>
                            ${getText('gif-maker/tab/result')}
                        </a>
                    </li>
                </ul>
                <button
                    class="btn btn-success btn-sm"
                    onClick=${onGenerate}
                    disabled=${!canGenerate}
                >
                    ${isGenerating ? html`
                        <span class="spinner-border spinner-border-sm me-1"></span>
                        ${getText('gif-maker/button/generating')}
                    ` : html`
                        <i class="bi bi-magic me-1"></i>
                        ${getText('gif-maker/button/generate')}
                    `}
                </button>
            </div>

            <div class="card-body">
                ${isGenerating ? html`
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="small text-muted">
                            ${progressLabel || getText('gif-maker/message/processing')}
                        </span>
                        <span class="small fw-bold">${progress}%</span>
                    </div>
                    <div class="progress" role="progressbar" aria-valuenow=${progress} aria-valuemin="0" aria-valuemax="100">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" style=${{ width: `${progress}%` }}></div>
                    </div>
                ` : result ? html`
                    <div class="text-center mb-3 gif-preview-wrapper">
                        <img
                            src=${result.url}
                            alt="Generated GIF"
                            class="img-fluid gif-preview-image"
                        />
                    </div>
                    <div class="row text-center small g-2">
                        <div class="col-6 col-md-3">
                            <div class="text-muted">${getText('gif-maker/result/dimensions')}</div>
                            <strong>${result.width}×${result.height}</strong>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="text-muted">${getText('gif-maker/result/frames')}</div>
                            <strong>${result.frames}</strong>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="text-muted">${getText('gif-maker/result/duration')}</div>
                            <strong>${(result.duration / 1000).toFixed(1)}s</strong>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="text-muted">${getText('gif-maker/result/file_size')}</div>
                            <strong>${formatFileSize(result.size)}</strong>
                        </div>
                    </div>
                ` : html`
                    <p class="text-muted text-center py-5 mb-0">${getText('gif-maker/message/no_images')}</p>
                `}
            </div>

            ${result && !isGenerating ? html`
                <div class="card-footer text-center py-3">
                    <button class="btn btn-primary" onClick=${onDownload}>
                        <i class="bi bi-download me-1"></i>
                        ${getText('gif-maker/button/download')}
                    </button>
                </div>
            ` : null}
        </div>
    `;
};

export default ResultCard;
