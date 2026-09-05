import { useRef } from 'react';
import JSZip from 'jszip';
import InputNumber from '~/components/InputNumber';
import { downloadFile } from '~/helpers/files';
import { t } from '~/helpers/i18n';
import ImageCropPreview from './ImageCropPreview';

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

    const renderBlankState = () => (
<>

        <div className="card-body text-center">
            <div className="text-muted">
                <i className="bi bi-image" style={{ fontSize: '2rem' }}></i>
                <p className="mt-2 fw-semibold">{t('image-batch-crop/result/no_images')}</p>
                <small className="text-muted">{t('image-batch-crop/result/upload_hint')}</small>
            </div>
        </div>
    
</>
);

    return (
<>

        <div className="card mb-3">
            <div className="card-header d-flex align-items-center gap-2 flex-wrap">
                <span className="text-muted small">{t('image-batch-crop/result/crop_size')}</span>
                <div className="d-flex align-items-center gap-2">
                    <InputNumber min={1} max={10000} step={1} value={cropSize.width} onChange={(value) => handleSizeChange('width', value)} />
                    <span className="text-muted">×</span>
                    <InputNumber min={1} max={10000} step={1} value={cropSize.height} onChange={(value) => handleSizeChange('height', value)} />
                </div>
                <div className="ms-auto">
                    <button className="btn btn-outline-success btn-sm" disabled={images.length === 0} onClick={handleDownloadAll}>
                        <i className="bi bi-download me-1"></i>
                        {t('image-batch-crop/result/download_all')}
                    </button>
                </div>
            </div>

            {images.length > 0
                ? (
<>

                    <div className="card-body">
                        {images.map((image, index) => (
                            <ImageCropPreview key={index} image={image} index={index} cropSize={cropSize} downloadName={buildDownloadName(image, index)} onRegisterExporter={handleRegisterExporter} />
))}
                    </div>
                
</>
)
                : renderBlankState()
            }
        </div>
    
</>
);
};

export default ResultCard;
