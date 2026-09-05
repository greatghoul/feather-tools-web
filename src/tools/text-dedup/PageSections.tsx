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
                        <li><T k='text-dedup/how_to_use/step1' /></li>
                        <li><T k='text-dedup/how_to_use/step2' /></li>
                        <li><T k='text-dedup/how_to_use/step3' /></li>
                        <li><T k='text-dedup/how_to_use/step4' /></li>
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
                        <li><T k='text-dedup/features/real_time_highlighting' /></li>
                        <li><T k='text-dedup/features/ignore_whitespace' /></li>
                        <li><T k='text-dedup/features/simple_fast' /></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    </>
);
