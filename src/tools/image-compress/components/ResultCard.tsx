import { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { downloadFile } from '~/helpers/files';
import ImageCompressService from '../services/ImageCompress';
import type { CompressResult } from '../services/ImageCompress';
import type { CompressSetting, UploadedImage } from '../types';
import ProgressBar from '~/components/ProgressBar';
import { t } from '~/helpers/i18n';
import styles from './ResultCard.module.css';

const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const BlankResult = () => (
    <div className="card-body text-center">
        <div className="text-muted">
            <i className="bi bi-image" style={{ fontSize: '2rem' }} />
            <p className="mt-2 fw-semibold">{t('image-compress/result/not_processed')}</p>
            <small className="text-muted">{t('image-compress/result/upload_hint')}</small>
        </div>
    </div>
);

interface ResultCardProps {
    images?: UploadedImage[];
    setting: CompressSetting;
    processingKey?: number;
}

const ResultCard = ({ images = [], setting, processingKey = 0 }: ResultCardProps) => {
    const [compressResults, setCompressResults] = useState<CompressResult[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleDownloadAll = async () => {
        const zip = new JSZip();

        for (const [index, result] of compressResults.entries()) {
            const response = await fetch(result.url);
            const blob = await response.blob();

            const number = (index + 1).toString().padStart(2, '0');
            const newName = `Compressed_${number}_${result.name}`;

            zip.file(newName, blob);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        downloadFile(content, 'compressed-images.zip');
    };

    const handleDownloadSingle = async (result: CompressResult, index: number) => {
        const response = await fetch(result.url);
        const blob = await response.blob();

        const number = (index + 1).toString().padStart(2, '0');
        const newName = `Compressed_${number}_${result.name}`;

        downloadFile(blob, newName);
    };

    const handleProcess = async () => {
        if (images.length === 0) return;

        setCompressResults([]);
        setIsProcessing(true);

        const results: CompressResult[] = [];
        const totalSteps = images.length;
        let completedSteps = 0;

        try {
            for (const image of images) {
                const compressor = new ImageCompressService(image, setting);
                const result = await compressor.process();
                completedSteps++;
                setProgress(Math.round((completedSteps / totalSteps) * 100));
                results.push(result);
                setCompressResults(results);
            }
        } catch (error) {
            console.error('Error compressing image:', error);
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    useEffect(() => {
        if (images.length > 0) {
            handleProcess();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [processingKey]);

    const renderResult = (result: CompressResult, index: number) => {
        const savedColor = result.compressionRatio > 0 ? 'text-success' : 'text-danger';
        const savedIcon = result.compressionRatio > 0 ? 'bi-arrow-down' : 'bi-arrow-up';

        return (
            <div className={`card-body ${index % 2 === 0 ? '' : 'bg-light'}`} key={result.name + index}>
                <div className="row align-items-center">
                    <div className="col-md-6 text-center mb-3 mb-md-0">
                        <img src={result.url} className={styles.image} alt={result.name} />
                    </div>
                    <div className="col-md-6">
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small">
                                {result.width} x {result.height}px
                            </span>
                            <span className="badge bg-secondary">{result.format.toUpperCase()}</span>
                        </div>
                        <table className="table table-sm table-borderless mb-2">
                            <tbody>
                                <tr>
                                    <td className="text-muted ps-0">{t('image-compress/result/original_size')}</td>
                                    <td className="text-end pe-0">{formatSize(result.originalSize)}</td>
                                </tr>
                                <tr>
                                    <td className="text-muted ps-0">{t('image-compress/result/compressed_size')}</td>
                                    <td className="text-end pe-0">{formatSize(result.compressedSize)}</td>
                                </tr>
                                <tr>
                                    <td className="text-muted ps-0">{t('image-compress/result/compression_ratio')}</td>
                                    <td className={`text-end pe-0 ${savedColor}`}>
                                        <i className={`bi ${savedIcon} me-1`} />
                                        {Math.abs(result.compressionRatio)}%
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <button
                            className="btn btn-sm btn-outline-primary w-100"
                            onClick={() => handleDownloadSingle(result, index)}
                        >
                            <i className="bi bi-download me-1" />
                            {t('image-compress/result/download')}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
                <button
                    className="btn btn-outline-primary btn-sm me-2"
                    onClick={handleProcess}
                    disabled={isProcessing || images.length === 0}
                >
                    {isProcessing ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                    {t('image-compress/result/compress_images')}
                </button>

                <button
                    className="btn btn-outline-success btn-sm"
                    disabled={compressResults.length === 0}
                    onClick={handleDownloadAll}
                >
                    <i className="bi bi-download me-1" />
                    {t('image-compress/result/download_all')}
                </button>
            </div>

            <div className="card-body p-0">
                {isProcessing ? <ProgressBar value={progress} /> : null}
            </div>

            {compressResults.length > 0
                ? compressResults.map(renderResult)
                : <BlankResult />}
        </div>
    );
};

export default ResultCard;
