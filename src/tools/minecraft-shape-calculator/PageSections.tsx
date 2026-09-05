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
                        <li>{t('minecraft-shape-calculator/how_to_use/step1')}</li>
                        <li>{t('minecraft-shape-calculator/how_to_use/step2')}</li>
                        <li>{t('minecraft-shape-calculator/how_to_use/step3')}</li>
                        <li>{t('minecraft-shape-calculator/how_to_use/step4')}</li>
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
                        <li>{t('minecraft-shape-calculator/features/accuracy')}</li>
                        <li>{t('minecraft-shape-calculator/features/coordinates')}</li>
                        <li>{t('minecraft-shape-calculator/features/preview')}</li>
                        <li>{t('minecraft-shape-calculator/features/privacy')}</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    </>
);
