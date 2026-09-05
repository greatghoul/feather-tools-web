import { html } from 'htm/preact';
import { useRef } from 'preact/hooks';
import JSZip from 'jszip';
import InputNumber from '~/components/InputNumber.js';
import { downloadFile } from '~/helpers/files.js';
import { getText } from '~/helpers/utils.js';
import ImageCropPreview from './ImageCropPreview.js';

const ResultCard = ({ images = [], cropSize, onCropSizeChange }) => {
    const exporterMapRef = useRef({});

    const buildDownloadName = (image, index) => {
        const originalName = image.name || `image-${index + 1}`;
        const lastDot = originalName.lastIndexOf('.');
        const base = lastDot === -1 ? originalName : originalName.slice(0, lastDot);
        const ext = image.format || (lastDot === -1 ? 'png' : originalName.slice(lastDot + 1));
        return `${base}-cropped-${index + 1}.${ext}`;
    };

    const handleRegisterExporter = (index, exporter) => {
        if (typeof exporter === 'function') {
            exporterMapRef.current[index] = exporter;
            return;
        }
        delete exporterMapRef.current[index];
    };

    const handleDownloadAll = async () => {
        if (images.length === 0) return;

        const zip = new JSZip();
        for (const [index, image] of images.entries()) {
            const exporter = exporterMapRef.current[index];
            if (!exporter) continue;
            const result = await exporter();
            if (!result?.blob) continue;
            zip.file(buildDownloadName(image, index), result.blob);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        downloadFile(content, 'image-batch-crop.zip');
    };

    const handleSizeChange = (key, value) => {
        const next = Math.max(1, Math.round(value || 1));
        onCropSizeChange({
            ...cropSize,
            [key]: next,
        });
    };

    const renderBlankState = () => html`
        <div class="card-body text-center">
            <div class="text-muted">
                <i class="bi bi-image" style="font-size: 2rem;"></i>
                <p class="mt-2 fw-semibold">${getText('image-batch-crop/result/no_images')}</p>
                <small class="text-muted">${getText('image-batch-crop/result/upload_hint')}</small>
            </div>
        </div>
    `;

    return html`
        <div class="card mb-3">
            <div class="card-header d-flex align-items-center gap-2 flex-wrap">
                <span class="text-muted small">${getText('image-batch-crop/result/crop_size')}</span>
                <div class="d-flex align-items-center gap-2">
                    <${InputNumber}
                        min=${1}
                        max=${10000}
                        step=${1}
                        value=${cropSize.width}
                        onChange=${(value) => handleSizeChange('width', value)}
                    />
                    <span class="text-muted">×</span>
                    <${InputNumber}
                        min=${1}
                        max=${10000}
                        step=${1}
                        value=${cropSize.height}
                        onChange=${(value) => handleSizeChange('height', value)}
                    />
                </div>
                <div class="ms-auto">
                    <button
                        class="btn btn-outline-success btn-sm"
                        disabled=${images.length === 0}
                        onClick=${handleDownloadAll}
                    >
                        <i class="bi bi-download me-1"></i>
                        ${getText('image-batch-crop/result/download_all')}
                    </button>
                </div>
            </div>

            ${images.length > 0
                ? html`
                    <div class="card-body">
                        ${images.map((image, index) => html`
                            <${ImageCropPreview}
                                image=${image}
                                index=${index}
                                cropSize=${cropSize}
                                downloadName=${buildDownloadName(image, index)}
                                onRegisterExporter=${handleRegisterExporter}
                            />
                        `)}
                    </div>
                `
                : renderBlankState()
            }
        </div>
    `;
};

export default ResultCard;
