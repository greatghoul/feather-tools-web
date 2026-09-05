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
                        <li>{t('csv-sample/how_to_use/step1')}</li>
                        <li>{t('csv-sample/how_to_use/step2')}</li>
                        <li>{t('csv-sample/how_to_use/step3')}</li>
                        <li>{t('csv-sample/how_to_use/step4')}</li>
                        <li>{t('csv-sample/how_to_use/step5')}</li>
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
                    <ul>
                        <li>{t('csv-sample/features/column_types')}</li>
                        <li>{t('csv-sample/features/person_groups')}</li>
                        <li>{t('csv-sample/features/templates')}</li>
                        <li>{t('csv-sample/features/row_count')}</li>
                        <li>{t('csv-sample/features/locale_support')}</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    </>
);
