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
                <div className="card-header">
                    <h2 className="h5 mb-0"><T k='tool/how_to_use' /></h2>
                </div>
                <div className="card-body">
                    <ol className="mb-0">
                        <li><T k='video-speed/how_to_use/step1' /></li>
                        <li><T k='video-speed/how_to_use/step2' /></li>
                        <li><T k='video-speed/how_to_use/step3' /></li>
                        <li><T k='video-speed/how_to_use/step4' /></li>
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
                        <li><T k='video-speed/features/speed_range' /></li>
                        <li><T k='video-speed/features/pitch_preservation' /></li>
                        <li><T k='video-speed/features/realtime_preview' /></li>
                        <li><T k='video-speed/features/privacy_first' /></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    </>
);
