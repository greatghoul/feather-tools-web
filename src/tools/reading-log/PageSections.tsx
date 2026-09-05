import { t } from '~/helpers/i18n';
import { T } from '~/helpers/T';

export const SectionsBefore = () => (
    <>

    </>
);

export const SectionsAfter = () => (
    <>


    <div className="row row-gap-4 my-4">
        <div className="col-lg-6">
            <div className="card h-100">
                <div className="card-header bg-light">
                    <h2 className="h5 mb-0"><T k='tool/how_to_use' /></h2>
                </div>
                <div className="card-body">
                    <ol className="mb-0">
                        <li><T k='reading-log/how_to_use/step1' /></li>
                        <li><T k='reading-log/how_to_use/step2' /></li>
                        <li><T k='reading-log/how_to_use/step3' /></li>
                        <li><T k='reading-log/how_to_use/step4' /></li>
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
                        <li><strong><T k='reading-log/features/customizable_title' /></strong> – <T k='reading-log/features/customizable_title_desc' /></li>
                        <li><strong><T k='reading-log/features/preprinted_fields' /></strong> – <T k='reading-log/features/preprinted_fields_desc' /></li>
                        <li><strong><T k='reading-log/features/handwriting_fields' /></strong> – <T k='reading-log/features/handwriting_fields_desc' /></li>
                        <li><strong><T k='reading-log/features/print_ready' /></strong> – <T k='reading-log/features/print_ready_desc' /></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    </>
);
