import { t } from '~/helpers/i18n';

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
                    <h2 className="h5 mb-0">{t('tool/how_to_use')}</h2>
                </div>
                <div className="card-body">
                    <ol>
                        <li>{t('habitica-egg-hatcher/how_to_use/step1')}</li>
                        <li>{t('habitica-egg-hatcher/how_to_use/step2')}</li>
                        <li>{t('habitica-egg-hatcher/how_to_use/step3')}</li>
                        <li>{t('habitica-egg-hatcher/how_to_use/step4')}</li>
                        <li>{t('habitica-egg-hatcher/how_to_use/step5')}</li>
                    </ol>
                </div>
            </div>
        </div>
        <div className="col-lg-6">
            <div className="card h-100">
                <div className="card-header">
                    <h2 className="h5 mb-0">{t('tool/features')}</h2>
                </div>
                <div className="card-body">
                    <ul>
                        <li>{t('habitica-egg-hatcher/features/batch')}</li>
                        <li>{t('habitica-egg-hatcher/features/skip_owned')}</li>
                        <li>{t('habitica-egg-hatcher/features/auto_retry')}</li>
                        <li>{t('habitica-egg-hatcher/features/privacy')}</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    </>
);
