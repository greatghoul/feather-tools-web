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
                        <li><T k='monthly-planner/how_to_use/step1' /></li>
                        <li><T k='monthly-planner/how_to_use/step2' /></li>
                        <li><T k='monthly-planner/how_to_use/step3' /></li>
                        <li><T k='monthly-planner/how_to_use/step4' /></li>
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
                        <li><strong><T k='monthly-planner/features/auto_calendar' /></strong> – <T k='monthly-planner/features/auto_calendar_desc' /></li>
                        <li><strong><T k='monthly-planner/features/customizable' /></strong> – <T k='monthly-planner/features/customizable_desc' /></li>
                        <li><strong><T k='monthly-planner/features/print_ready' /></strong> – <T k='monthly-planner/features/print_ready_desc' /></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    </>
);
