import { t } from '~/helpers/i18n';

const PreviewPanel = ({ previews, truncated, empty, onPrint, onDownloadPdf, isExporting }) => {
    return (
<>

        <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{t('sign-in-sheet/preview/card_title')}</h5>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={onDownloadPdf} disabled={isExporting}>
                        {isExporting ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="bi bi-download me-1"></i>}
                        {t('sign-in-sheet/button/download_pdf')}
                    </button>
                    <button className="btn btn-sm btn-primary" onClick={onPrint} disabled={empty}>
                        <i className="bi bi-printer me-1"></i>{t('common/print')}
                    </button>
                </div>
            </div>
            <div className="card-body">
                {empty ? (
<>

                    <div className="text-muted text-center py-5">{t('sign-in-sheet/preview/empty')}</div>

</>
) : (
<>

                    {previews.map((src, i) => (
                        <div key={i} className="mb-4">
                            <div className="text-muted text-center mb-1" style={{ fontSize: '0.82rem' }}>
                                {t('sign-in-sheet/preview/page_label').replace('{n}', String(i + 1))}
                            </div>
                            <img
                                src={src}
                                alt={`page ${i + 1}`}
                                style={{
                                    display: 'block',
                                    margin: '0 auto',
                                    maxWidth: '420px',
                                    width: '100%',
                                    border: '1px solid #dee2e6',
                                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.12)',
                                    backgroundColor: '#ffffff',
                                }}
                            />
                        </div>
                    ))}
                    {truncated ? (
                        <div className="alert alert-warning py-2" style={{ fontSize: '0.85rem' }}>
                            {t('sign-in-sheet/preview/truncated')}
                        </div>
                    ) : null}

</>
)
                }
            </div>
        </div>

</>
    );
};

export default PreviewPanel;
