import { t } from '~/helpers/i18n';
import { T } from '~/helpers/T';

export const SectionsBefore = () => (
    <>

    </>
);

export const SectionsAfter = () => (
    <>


    <div className="row row-gap-4 mb-4">
        <div className="col-lg-12">
            <div className="card h-100">
                <div className="card-header">
                    <h2 className="h5 mb-0"><T k='tool/how_to_use' /></h2>
                </div>
                <div className="card-body">
                    <ol>
                        <li><T k='batch-qrcode/features/enter-urls' /></li>
                        <li><T k='batch-qrcode/features/generate' /></li>
                        <li><T k='batch-qrcode/features/download' /></li>
                    </ol>
                </div>
            </div>
        </div>
    </div>


    </>
);
