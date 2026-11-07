import { useMemo, useState } from 'react';
import { downloadFile } from '~/helpers/files';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';
import type { ExportProgress, LoadedPdf, PageSetting } from '../services/types';
import { exportSinglePdf, exportZip } from '../services/PdfExporter';

interface Props {
    pdf: LoadedPdf;
    pages: PageSetting[];
}

const ExportCard = ({ pdf, pages }: Props) => {
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState<ExportProgress>({ current: 0, total: 0 });
    const [error, setError] = useState('');

    const cutCount = useMemo(() => pages.filter((page) => page.mode !== 'none').length, [pages]);
    const outputCount = useMemo(
        () => pages.reduce((sum, page) => sum + (page.mode === 'none' ? 1 : 2), 0),
        [pages]
    );

    const run = async (kind: 'pdf' | 'zip') => {
        if (busy || !pages.length) return;
        setBusy(true);
        setError('');
        setProgress({ current: 0, total: outputCount });
        try {
            const exporter = kind === 'pdf' ? exportSinglePdf : exportZip;
            const result = await exporter(pdf.bytes, pdf.doc, pages, pdf.name, setProgress);
            downloadFile(result.blob, result.fileName);
            notify(t('pdf-page-splitter/export/success'), '', 'success');
        } catch (err: any) {
            console.error('[pdf-page-splitter] export failed', err);
            setError(t('pdf-page-splitter/export/error'));
            notify(t('pdf-page-splitter/export/error'), err?.message ?? '', 'error');
        } finally {
            setBusy(false);
        }
    };

    const percent = progress.total ? Math.round((progress.current / progress.total) * 100) : 0;

    return (
        <div className="card mb-3">
            <div className="card-header">
                <h2 className="h6 mb-0">
                    <i className="bi bi-download me-1" aria-hidden="true" />
                    {t('pdf-page-splitter/export/title')}
                </h2>
            </div>
            <div className="card-body">
                <div className="d-flex justify-content-between small mb-1">
                    <span className="text-muted">{t('pdf-page-splitter/export/source_pages')}</span>
                    <span className="fw-semibold">{pdf.pageCount}</span>
                </div>
                <div className="d-flex justify-content-between small mb-1">
                    <span className="text-muted">{t('pdf-page-splitter/export/cut_pages')}</span>
                    <span className="fw-semibold">{cutCount}</span>
                </div>
                <div className="d-flex justify-content-between small mb-3">
                    <span className="text-muted">{t('pdf-page-splitter/export/output_pages')}</span>
                    <span className="fw-semibold text-primary">{outputCount}</span>
                </div>

                <button
                    type="button"
                    className="btn btn-primary w-100 mb-2"
                    disabled={busy || outputCount === 0}
                    onClick={() => run('pdf')}
                >
                    <i className="bi bi-file-earmark-arrow-down me-1" aria-hidden="true" />
                    {t('pdf-page-splitter/export/pdf')}
                </button>
                <button
                    type="button"
                    className="btn btn-outline-primary w-100"
                    disabled={busy || outputCount === 0}
                    onClick={() => run('zip')}
                >
                    <i className="bi bi-file-earmark-zip me-1" aria-hidden="true" />
                    {t('pdf-page-splitter/export/zip')}
                </button>

                {busy && (
                    <div className="mt-3">
                        <div className="progress" style={{ height: 8 }}>
                            <div
                                className="progress-bar progress-bar-striped progress-bar-animated"
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                        <div className="small text-muted text-center mt-1">
                            {t('pdf-page-splitter/export/working')} {progress.current} / {progress.total}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger py-2 px-3 mt-3 mb-0 small" role="alert">
                        {error}
                    </div>
                )}

                <hr />
                <p className="small text-muted mb-2">{t('pdf-page-splitter/export/pdf_hint')}</p>
                <p className="small text-muted mb-2">{t('pdf-page-splitter/export/zip_hint')}</p>
                <p className="small text-muted mb-0">{t('pdf-page-splitter/export/annotations_hint')}</p>

            </div>
        </div>
    );
};

export default ExportCard;
