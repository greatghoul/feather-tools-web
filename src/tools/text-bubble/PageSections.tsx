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
                        <li><T k='text-bubble/how_to_use/step1' /></li>
                        <li><T k='text-bubble/how_to_use/step2' /></li>
                        <li><T k='text-bubble/how_to_use/step3' /></li>
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
                    <ul>
                        <li><T k='text-bubble/features/three_styles' /></li>
                        <li><T k='text-bubble/features/four_directions' /></li>
                        <li><T k='text-bubble/features/unicode_art' /></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    </>
);
