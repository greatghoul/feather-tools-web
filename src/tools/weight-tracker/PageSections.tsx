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
                        <li><T k='weight-tracker/how_to_use/step1' /></li>
                        <li><T k='weight-tracker/how_to_use/step2' /></li>
                        <li><T k='weight-tracker/how_to_use/step3' /></li>
                        <li><T k='weight-tracker/how_to_use/step4' /></li>
                        <li><T k='weight-tracker/how_to_use/step5' /></li>
                        <li><T k='weight-tracker/how_to_use/step6' /></li>
                        <li><T k='weight-tracker/how_to_use/step7' /></li>
                        <li><T k='weight-tracker/how_to_use/step8' /></li>
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
                        <li><strong><T k='weight-tracker/features/custom_date_range' /></strong> – <T k='weight-tracker/features/custom_date_range_desc' /></li>
                        <li><strong><T k='weight-tracker/features/weight_unit_selection' /></strong> – <T k='weight-tracker/features/weight_unit_selection_desc' /></li>
                        <li><strong><T k='weight-tracker/features/custom_weight_range' /></strong> – <T k='weight-tracker/features/custom_weight_range_desc' /></li>
                        <li><strong><T k='weight-tracker/features/target_weight_tracking' /></strong> – <T k='weight-tracker/features/target_weight_tracking_desc' /></li>
                        <li><strong><T k='weight-tracker/features/custom_chart_title' /></strong> – <T k='weight-tracker/features/custom_chart_title_desc' /></li>
                        <li><strong><T k='weight-tracker/features/print_optimized_design' /></strong> – <T k='weight-tracker/features/print_optimized_design_desc' /></li>
                        <li><strong><T k='weight-tracker/features/one_click_export' /></strong> – <T k='weight-tracker/features/one_click_export_desc' /></li>
                        <li><strong><T k='weight-tracker/features/privacy_first' /></strong> – <T k='weight-tracker/features/privacy_first_desc' /></li>
                        <li><strong><T k='weight-tracker/features/dynamic_scale_adjustment' /></strong> – <T k='weight-tracker/features/dynamic_scale_adjustment_desc' /></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    </>
);
