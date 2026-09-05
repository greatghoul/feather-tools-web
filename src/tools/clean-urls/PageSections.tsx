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
                        <li><T k='clean-urls/how_to_use/step1' /></li>
                        <li><T k='clean-urls/how_to_use/step2' /></li>
                        <li><T k='clean-urls/how_to_use/step3' /></li>
                        <li><T k='clean-urls/how_to_use/step4' /></li>
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
                    <ul>
                        <li><T k='clean-urls/features/remove_tracking' /></li>
                        <li><T k='clean-urls/features/utm_parameters' /></li>
                        <li><T k='clean-urls/features/common_tracking' /></li>
                        <li><T k='clean-urls/features/custom_filters' /></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <div className="row mb-4">
        <div className="col-12">
            <div className="card">
                <div className="card-header">
                    <h2 className="h5 mb-0"><T k='clean-urls/tracking_parameters/title' /></h2>
                </div>
                <div className="card-body">
                    <p className="mb-2"><T k='clean-urls/tracking_parameters/remove_common' /></p>
                    <div className="row">
                        <div className="col-md-4">
                            <strong>Google Analytics:</strong>
                            <ul className="small">
                                <li>utm_source</li>
                                <li>utm_medium</li>
                                <li>utm_campaign</li>
                                <li>utm_term</li>
                                <li>utm_content</li>
                            </ul>
                        </div>
                        <div className="col-md-4">
                            <strong>Facebook:</strong>
                            <ul className="small">
                                <li>fbclid</li>
                                <li>fb_action_ids</li>
                                <li>fb_action_types</li>
                                <li>fb_source</li>
                            </ul>
                        </div>
                        <div className="col-md-4">
                            <strong>Others:</strong>
                            <ul className="small">
                                <li>gclid (Google Ads)</li>
                                <li>msclkid (Microsoft)</li>
                                <li>ref (Referrer)</li>
                                <li>source</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    </>
);
