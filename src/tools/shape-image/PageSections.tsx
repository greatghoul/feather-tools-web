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
                    <h2 className="h5 mb-0"><T k='shape-image/how_to_use/title' /></h2>
                </div>
                <div className="card-body">
                    <ol className="mb-0">
                        <li><strong><T k='shape-image/how_to_use/select_image' /></strong> - <T k='shape-image/how_to_use/select_image_desc' /></li>
                        <li><T k='shape-image/how_to_use/choose_shape' /> - <T k='shape-image/how_to_use/choose_shape_desc' /></li>
                        <li><strong><T k='shape-image/how_to_use/preview_generate' /></strong> - <T k='shape-image/how_to_use/preview_generate_desc' /></li>
                        <li><strong><T k='shape-image/how_to_use/download' /></strong> - <T k='shape-image/how_to_use/download_desc' /></li>
                    </ol>
                </div>
            </div>
        </div>

        <div className="col-lg-6">
            <div className="card h-100">
                <div className="card-header bg-light">
                    <h2 className="h5 mb-0"><T k='tool/features' /></h2>
                </div>
                <div className="card-body">
                    <ul className="mb-0">
                        <li><strong><T k='shape-image/features/multiple_shapes' /></strong> - <T k='shape-image/features/multiple_shapes_desc' /></li>
                        <li><strong><T k='shape-image/features/high_quality' /></strong> - <T k='shape-image/features/high_quality_desc' /></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    </>
);
