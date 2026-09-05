import { t } from '~/helpers/i18n';

export const SectionsBefore = () => (
    <>

    </>
);

export const SectionsAfter = () => (
    <>


    <div className="row row-gap-4 mb-4">
        <div className="col-lg-6">
            <div className="card h-100">
                <div className="card-header">
                    <h2 className="h5 mb-0">{t('tool/how_to_use')}</h2>
                </div>
                <div className="card-body">
                    <ol>
                        <li>{t('simple-qrcode/features/enter-url')}</li>
                        <li>{t('simple-qrcode/features/customize-appearance')}</li>
                        <li>{t('simple-qrcode/features/generate-qrcode')}</li>
                        <li>{t('simple-qrcode/features/download-buttons')}</li>
                    </ol>
                </div>
            </div>
        </div>
        <div className="col-lg-6">
            <div className="card h-100">
                <div className="card-header">
                    <h2 className="h5 mb-0">{t('tool/bookmarklet')}</h2>
                </div>
                <div className="card-body">
                    <div className="card-text">
                        <p>{t('simple-qrcode/bookmarklet/drag-to-bookmarks')}</p>
                        <a className="btn btn-outline-primary" href="javascript:document.location='{/* TODO jinja: {{ request.url_root }} */}simple-qrcode?url='+encodeURIComponent(document.location.href);"></a>
                        <div className="mt-3 text-muted small">
                            <i className="bi bi-info-circle me-1"></i>
                            {t('simple-qrcode/bookmarklet/info-text')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    </>
);
