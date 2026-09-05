import { t } from '~/helpers/i18n';

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
                    <h2 className="h5 mb-0">{t('tool/how_to_use')}</h2>
                </div>
                <div className="card-body">
                    <ol className="mb-0">
                        <li>{t('meal-planner/how_to_use/step1')}</li>
                        <li>{t('meal-planner/how_to_use/step2')}</li>
                        <li>{t('meal-planner/how_to_use/step3')}</li>
                        <li>{t('meal-planner/how_to_use/step4')}</li>
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
                        <li><strong>{t('meal-planner/features/weekly_grid')}</strong> – {t('meal-planner/features/weekly_grid_desc')}</li>
                        <li><strong>{t('meal-planner/features/custom_meals')}</strong> – {t('meal-planner/features/custom_meals_desc')}</li>
                        <li><strong>{t('meal-planner/features/shopping_list')}</strong> – {t('meal-planner/features/shopping_list_desc')}</li>
                        <li><strong>{t('meal-planner/features/print_ready')}</strong> – {t('meal-planner/features/print_ready_desc')}</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    </>
);
