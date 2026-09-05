import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const MIN_SIZE = 16;

const ASPECTS = [
    { value: 0, labelKey: 'video-crop/aspect/free' },
    { value: 1, labelKey: 'video-crop/aspect/square' },
    { value: 4 / 3, labelKey: 'video-crop/aspect/4_3' },
    { value: 16 / 9, labelKey: 'video-crop/aspect/16_9' },
    { value: 9 / 16, labelKey: 'video-crop/aspect/9_16' },
];

const round = (n) => Math.round(n);

const CropControls = ({
    aspect,
    crop,
    videoWidth,
    videoHeight,
    isProcessing,
    onAspectChange,
    onReset,
    onCrop,
}) => {
    const canCrop = crop && crop.width >= MIN_SIZE && crop.height >= MIN_SIZE && !isProcessing;

    return html`
        <div class="card">
            <div class="card-header bg-light">
                <span>${getText('video-crop/settings/title')}</span>
            </div>
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-12">
                        <label class="form-label small">
                            ${getText('video-crop/settings/aspect')}
                        </label>
                        <div class="btn-group w-100" role="group">
                            ${ASPECTS.map((a) => html`
                                <button
                                    key=${a.value}
                                    type="button"
                                    class="btn btn-sm ${aspect === a.value ? 'btn-primary' : 'btn-outline-primary'}"
                                    onClick=${() => onAspectChange(a.value)}
                                    disabled=${isProcessing}
                                >
                                    ${getText(a.labelKey)}
                                </button>
                            `)}
                        </div>
                    </div>

                    ${crop ? html`
                        <div class="col-12">
                            <label class="form-label small mb-2">
                                ${getText('video-crop/settings/region')}
                            </label>
                            <div class="row g-2">
                                <div class="col-6 col-md-3">
                                    <label class="form-label text-muted tiny mb-1">${getText('video-crop/settings/x')}</label>
                                    <input
                                        type="text"
                                        class="form-control form-control-sm"
                                        value=${round(crop.x)}
                                        readOnly
                                    />
                                </div>
                                <div class="col-6 col-md-3">
                                    <label class="form-label text-muted tiny mb-1">${getText('video-crop/settings/y')}</label>
                                    <input
                                        type="text"
                                        class="form-control form-control-sm"
                                        value=${round(crop.y)}
                                        readOnly
                                    />
                                </div>
                                <div class="col-6 col-md-3">
                                    <label class="form-label text-muted tiny mb-1">${getText('video-crop/settings/width')}</label>
                                    <input
                                        type="text"
                                        class="form-control form-control-sm"
                                        value=${round(crop.width)}
                                        readOnly
                                    />
                                </div>
                                <div class="col-6 col-md-3">
                                    <label class="form-label text-muted tiny mb-1">${getText('video-crop/settings/height')}</label>
                                    <input
                                        type="text"
                                        class="form-control form-control-sm"
                                        value=${round(crop.height)}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div class="small text-muted mt-1">
                                ${getText('video-crop/message/select_hint')}
                            </div>
                        </div>
                    ` : null}
                </div>
            </div>
            <div class="card-footer">
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <button
                        class="btn btn-sm btn-outline-secondary"
                        onClick=${onReset}
                        disabled=${isProcessing || !crop}
                    >
                        <i class="bi bi-arrow-counterclockwise me-1"></i>
                        ${getText('video-crop/button/reset')}
                    </button>
                    <button
                        class="btn btn-success"
                        onClick=${onCrop}
                        disabled=${!canCrop}
                    >
                        ${isProcessing ? html`
                            <span class="spinner-border spinner-border-sm me-1"></span>
                            ${getText('video-crop/message/processing')}
                        ` : html`
                            <i class="bi bi-crop me-1"></i>
                            ${getText('video-crop/button/crop')}
                        `}
                    </button>
                </div>
            </div>
        </div>
    `;
};

export default CropControls;