import { useEffect, useRef, useState } from 'react';
import { t } from '~/helpers/i18n';
import type { LoadedPdf } from '../services/types';
import styles from './FileInputCard.module.css';

interface Props {
    pdf: LoadedPdf | null;
    loading: boolean;
    error: string;
    onSelectFile: (file: File) => void;
    onRemove: () => void;
}

function formatSize(bytes: number): string {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${bytes} B`;
}

const isPdfFile = (file: File | null): file is File =>
    !!file && (file.type === 'application/pdf' || /\.pdf$/i.test(file.name));

const FileInputCard = ({ pdf, loading, error, onSelectFile, onRemove }: Props) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [dragging, setDragging] = useState(false);

    const pickFile = (files: FileList | null) => {
        const file = files?.[0] ?? null;
        if (isPdfFile(file)) onSelectFile(file);
    };

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const items = event.clipboardData?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                const file = items[i].getAsFile();
                if (isPdfFile(file)) {
                    onSelectFile(file);
                    break;
                }
            }
        };
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [onSelectFile]);

    const openPicker = () => inputRef.current?.click();

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setDragging(false);
        pickFile(event.dataTransfer.files);
    };

    return (
        <div className="card mb-3">
            <div className="card-header">
                <h2 className="h6 mb-0">
                    <i className="bi bi-file-earmark-pdf me-1" aria-hidden="true" />
                    {t('pdf-page-splitter/upload/title')}
                </h2>
            </div>
            <div className="card-body">
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="d-none"
                    onChange={(event) => {
                        pickFile(event.target.files);
                        event.target.value = '';
                    }}
                />

                {loading ? (
                    <div className="text-center py-4">
                        <div className="spinner-border text-primary mb-2" role="status" />
                        <div className="text-muted small">{t('pdf-page-splitter/upload/loading')}</div>
                    </div>
                ) : pdf ? (
                    <div
                        className={styles.fileBox}
                        onDragOver={(event) => {
                            event.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                    >
                        <div className="d-flex align-items-start gap-2">
                            <i className="bi bi-file-earmark-check text-success fs-4" aria-hidden="true" />
                            <div className="flex-grow-1 min-w-0">
                                <div className="fw-semibold text-break">{pdf.name}</div>
                                <div className="text-muted small">
                                    {formatSize(pdf.size)}
                                    <span className="mx-1">·</span>
                                    {t('pdf-page-splitter/upload/page_count')}: {pdf.pageCount}
                                </div>
                            </div>
                        </div>
                        <div className="d-flex gap-2 mt-3">
                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={openPicker}>
                                {t('pdf-page-splitter/upload/replace')}
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onRemove}>
                                {t('pdf-page-splitter/upload/remove')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className={`${styles.dropZone} ${dragging ? styles.dragging : ''}`}
                        role="button"
                        tabIndex={0}
                        onClick={openPicker}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                openPicker();
                            }
                        }}
                        onDragOver={(event) => {
                            event.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                    >
                        <i className="bi bi-file-earmark-pdf fs-1 text-primary" aria-hidden="true" />
                        <p className="mb-1 mt-2 fw-semibold">{t('pdf-page-splitter/upload/hint')}</p>
                        <small className="text-muted">{t('pdf-page-splitter/upload/formats')}</small>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger py-2 px-3 mt-3 mb-0 small" role="alert">
                        <i className="bi bi-exclamation-triangle me-1" aria-hidden="true" />
                        {error}
                    </div>
                )}

                <div className="alert alert-success py-2 px-3 mt-3 mb-0">
                    <small>
                        <i className="bi bi-shield-fill-check me-1" aria-hidden="true" />
                        {t('pdf-page-splitter/upload/privacy')}
                    </small>
                </div>
            </div>
        </div>
    );
};

export default FileInputCard;
