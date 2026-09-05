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
                <div className="card-header bg-light">
                    <h2 className="h5 mb-0">{t('tool/how_to_use')}</h2>
                </div>
                <div className="card-body">
                    <ol className="mb-0">
                        <li>{t('rich-qrcode/how_to_use/step1')}</li>
                        <li>{t('rich-qrcode/how_to_use/step2')}</li>
                        <li>{t('rich-qrcode/how_to_use/step3')}</li>
                        <li>{t('rich-qrcode/how_to_use/step4')}</li>
                    </ol>
                </div>
            </div>
        </div>

        <div className="col-lg-6">
            <div className="card h-100">
                <div className="card-header bg-light">
                    <h2 className="h5 mb-0">{t('tool/bookmarklet')}</h2>
                </div>
                <div className="card-body">
                    <p>{t('rich-qrcode/bookmarklet/drag-to-bookmarks')}</p>
                    <a className="btn btn-outline-primary" href="javascript:(function(){window.open('https://feather-tools.com/rich-qrcode?url='+encodeURIComponent(location.href),'_blank');})();" draggable="true">
                        {t('rich-qrcode/name')}
                    </a>
                    <div className="mt-3 text-muted small">
                        <i className="bi bi-info-circle me-1"></i>
                        {t('rich-qrcode/bookmarklet/info-text')}
                    </div>
                </div>
            </div>
        </div>
    </div>


    </>
);
