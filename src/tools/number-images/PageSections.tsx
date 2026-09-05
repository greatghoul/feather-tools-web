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
                <div className="card-header bg-light">
                    <h2 className="h5 mb-0">{t('tool/how_to_use')}</h2>
                </div>
                <div className="card-body">
                    <ol className="mb-0">
                        <li>{t('number-images/how_to_use/step1')}</li>
                        <li>{t('number-images/how_to_use/step2')}</li>
                        <li>{t('number-images/how_to_use/step3')}</li>
                        <li>{t('number-images/how_to_use/step4')}</li>
                        <li>{t('number-images/how_to_use/step5')}</li>
                        <li>{t('number-images/how_to_use/step6')}</li>
                    </ol>
                </div>
            </div>
        </div>

        <div className="col-lg-6">
            <div className="card h-100">
                <div className="card-header bg-light">
                    <h2 className="h5 mb-0">{t('tool/features')}</h2>
                </div>
                <div className="card-body">
                    <ul className="mb-0">
                        <li>{t('number-images/features/customizable')}</li>
                        <li>{t('number-images/features/numbering')}</li>
                        <li>{t('number-images/features/formats')}</li>
                        <li>{t('number-images/features/batch')}</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    </>
);
