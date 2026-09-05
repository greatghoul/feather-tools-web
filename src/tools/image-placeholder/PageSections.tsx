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
                    <h2 className="h5 mb-0"><T k='tool/how_to_use' /></h2>
                </div>
                <div className="card-body">
                    <ol>
                        <li><T k='image-placeholder/features/set-dimensions' /></li>
                        <li><T k='image-placeholder/features/choose-colors' /></li>
                        <li><T k='image-placeholder/features/customize-text' /></li>
                        <li><T k='image-placeholder/features/download-or-copy' /></li>
                    </ol>
                </div>
            </div>
        </div>
        <div className="col-lg-6">
            <div className="card h-100">
                <div className="card-header">
                    <h2 className="h5 mb-0"><T k='tool/features' /></h2>
                </div>
                <div className="card-body">
                    <ul className="mb-0">
                        <li><T k='image-placeholder/features/custom-dimensions' /></li>
                        <li><T k='image-placeholder/features/custom-colors' /></li>
                        <li><T k='image-placeholder/features/custom-text' /></li>
                        <li><T k='image-placeholder/features/multiple-formats' /></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    </>
);
