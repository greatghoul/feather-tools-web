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
                        <li><T k='blood-pressure-tracker/how_to_use/step1' /></li>
                        <li><T k='blood-pressure-tracker/how_to_use/step2' /></li>
                        <li><T k='blood-pressure-tracker/how_to_use/step3' /></li>
                        <li><T k='blood-pressure-tracker/how_to_use/step4' /></li>
                        <li><T k='blood-pressure-tracker/how_to_use/step5' /></li>
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
                        <li><strong><T k='blood-pressure-tracker/features/custom_date_range' /></strong> – <T k='blood-pressure-tracker/features/custom_date_range_desc' /></li>
                        <li><strong><T k='blood-pressure-tracker/features/personalized_safe_ranges' /></strong> – <T k='blood-pressure-tracker/features/personalized_safe_ranges_desc' /></li>
                        <li><strong><T k='blood-pressure-tracker/features/printer_friendly' /></strong> – <T k='blood-pressure-tracker/features/printer_friendly_desc' /></li>
                        <li><strong><T k='blood-pressure-tracker/features/reference_guide' /></strong> – <T k='blood-pressure-tracker/features/reference_guide_desc' /></li>
                        <li><strong><T k='blood-pressure-tracker/features/one_click_export' /></strong> – <T k='blood-pressure-tracker/features/one_click_export_desc' /></li>
                        <li><strong><T k='blood-pressure-tracker/features/daily_segments' /></strong> – <T k='blood-pressure-tracker/features/daily_segments_desc' /></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    </>
);
