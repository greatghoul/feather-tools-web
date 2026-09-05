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
                    <h2 className="h5 mb-0"><T k='habit-tracker/how_to_use/title' /></h2>
                </div>
                <div className="card-body">
                    <ol className="mb-0">
                        <li><T k='habit-tracker/how_to_use/step1' /></li>
                        <li><T k='habit-tracker/how_to_use/step2' /></li>
                        <li><T k='habit-tracker/how_to_use/step3' /></li>
                        <li><T k='habit-tracker/how_to_use/step4' /></li>
                    </ol>
                </div>
            </div>
        </div>{/* How to Use */}

        <div className="col-lg-6">
            <div className="card h-100">
                <div className="card-header bg-light">
                    <h2 className="h5 mb-0"><T k='tool/features' /></h2>
                </div>
                <div className="card-body">
                    <ul className="mb-0">
                        <li><strong><T k='habit-tracker/features/flexible_layouts' /></strong> <T k='habit-tracker/features/flexible_layouts_desc' /></li>
                        <li><strong><T k='habit-tracker/features/smart_year_charts' /></strong> <T k='habit-tracker/features/smart_year_charts_desc' /></li>
                        <li><strong><T k='habit-tracker/features/generic_option' /></strong> <T k='habit-tracker/features/generic_option_desc' /></li>
                        <li><strong><T k='habit-tracker/features/print_ready' /></strong> <T k='habit-tracker/features/print_ready_desc' /></li>
                        <li><strong><T k='habit-tracker/features/privacy_first' /></strong> <T k='habit-tracker/features/privacy_first_desc' /></li>
                    </ul>
                </div>
            </div>
        </div>{/* Features */}
    </div>


    </>
);
