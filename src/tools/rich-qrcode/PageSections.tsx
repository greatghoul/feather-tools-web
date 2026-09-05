import { t } from '~/helpers/i18n';
import { T } from '~/helpers/T';

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
                    <h2 className="h5 mb-0"><T k='tool/how_to_use' /></h2>
                </div>
                <div className="card-body">
                    <ol className="mb-0">
                        <li><T k='rich-qrcode/how_to_use/step1' /></li>
                        <li><T k='rich-qrcode/how_to_use/step2' /></li>
                        <li><T k='rich-qrcode/how_to_use/step3' /></li>
                        <li><T k='rich-qrcode/how_to_use/step4' /></li>
                    </ol>
                </div>
            </div>
        </div>

        <div className="col-lg-6">
            <div className="card h-100">
                <div className="card-header bg-light">
                    <h2 className="h5 mb-0"><T k='tool/bookmarklet' /></h2>
                </div>
                <div className="card-body">
                    <p><T k='rich-qrcode/bookmarklet/drag-to-bookmarks' /></p>
                    <a className="btn btn-outline-primary" href="javascript:(function(){window.open('https://feather-tools.com/rich-qrcode?url='+encodeURIComponent(location.href),'_blank');})();" draggable="true">
                        <T k='rich-qrcode/name' />
                    </a>
                    <div className="mt-3 text-muted small">
                        <i className="bi bi-info-circle me-1"></i>
                        <T k='rich-qrcode/bookmarklet/info-text' />
                    </div>
                </div>
            </div>
        </div>
    </div>


    </>
);
