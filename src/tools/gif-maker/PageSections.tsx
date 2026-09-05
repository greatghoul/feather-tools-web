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
                <div className="card-header">
                    <h2 className="h5 mb-0"><T k='gif-maker/how_to_use/title' /></h2>
                </div>
                <div className="card-body">
                    <ol>
                        <li><strong><T k='gif-maker/how_to_use/upload_images' /></strong> <T k='gif-maker/how_to_use/upload_images_desc' /></li>
                        <li><strong><T k='gif-maker/how_to_use/order' /></strong> <T k='gif-maker/how_to_use/order_desc' /></li>
                        <li><strong><T k='gif-maker/how_to_use/settings' /></strong> <T k='gif-maker/how_to_use/settings_desc' /></li>
                        <li><strong><T k='gif-maker/how_to_use/delay' /></strong> <T k='gif-maker/how_to_use/delay_desc' /></li>
                        <li><strong><T k='gif-maker/how_to_use/generate' /></strong> <T k='gif-maker/how_to_use/generate_desc' /></li>
                        <li><strong><T k='gif-maker/how_to_use/download' /></strong> <T k='gif-maker/how_to_use/download_desc' /></li>
                    </ol>
                </div>
            </div>
        </div>
        <div className="col-lg-6">
            <div className="card h-100">
                <div className="card-header">
                    <h2 className="h5 mb-0"><T k='gif-maker/tips/title' /></h2>
                </div>
                <div className="card-body">
                    <ul className="list-unstyled">
                        <li className="mb-2"><i className="bi bi-info-circle text-primary me-1"></i> <T k='gif-maker/tips/frame_size' /></li>
                        <li className="mb-2"><i className="bi bi-info-circle text-primary me-1"></i> <T k='gif-maker/tips/transparency' /></li>
                        <li className="mb-2"><i className="bi bi-info-circle text-primary me-1"></i> <T k='gif-maker/tips/format' /></li>
                        <li><i className="bi bi-info-circle text-primary me-1"></i> <T k='gif-maker/tips/quality' /></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    </>
);
