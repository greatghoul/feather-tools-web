import type { Locale } from '~/data/site';
import { SITE } from '~/data/site';
import { t } from '~/helpers/i18n';
import { T } from '~/helpers/T';

interface PageSectionsProps {
    locale: Locale;
}

export const SectionsBefore = (_props: PageSectionsProps) => (
    <>

    </>
);

export const SectionsAfter = ({ locale }: PageSectionsProps) => (
    <>


    <div className="row row-gap-4 mb-4">
        <div className="col-lg-6">
            <div className="card h-100">
                <div className="card-header">
                    <h2 className="h5 mb-0"><T k='tool/how_to_use' /></h2>
                </div>
                <div className="card-body">
                    <ol>
                        <li><T k='simple-qrcode/features/enter-url' /></li>
                        <li><T k='simple-qrcode/features/customize-appearance' /></li>
                        <li><T k='simple-qrcode/features/generate-qrcode' /></li>
                        <li><T k='simple-qrcode/features/download-buttons' /></li>
                    </ol>
                </div>
            </div>
        </div>
        <div className="col-lg-6">
            <div className="card h-100">
                <div className="card-header">
                    <h2 className="h5 mb-0"><T k='tool/bookmarklet' /></h2>
                </div>
                <div className="card-body">
                    <div className="card-text">
                        <p><T k='simple-qrcode/bookmarklet/drag-to-bookmarks' /></p>
                        <a className="btn btn-outline-primary" href={`javascript:document.location='${SITE.baseUrl}/${locale}/simple-qrcode?url='+encodeURIComponent(document.location.href);`}><T k='simple-qrcode/name' /></a>
                        <div className="mt-3 text-muted small">
                            <i className="bi bi-info-circle me-1"></i>
                            <T k='simple-qrcode/bookmarklet/info-text' />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    </>
);
