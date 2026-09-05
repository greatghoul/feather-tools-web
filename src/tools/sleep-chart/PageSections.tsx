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
                        <li>{t('sleep-chart/how_to_use/step1')}</li>
                        <li>{t('sleep-chart/how_to_use/step2')}</li>
                        <li>{t('sleep-chart/how_to_use/step3')}</li>
                        <li>{t('sleep-chart/how_to_use/step4')}</li>
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
                        <li><strong>{t('sleep-chart/features/date_range_options')}</strong> – {t('sleep-chart/features/date_range_options_desc')}</li>
                        <li><strong>{t('sleep-chart/features/visual_sleep_timeline')}</strong> – {t('sleep-chart/features/visual_sleep_timeline_desc')}</li>
                        <li><strong>{t('sleep-chart/features/printer_friendly')}</strong> – {t('sleep-chart/features/printer_friendly_desc')}</li>
                        <li><strong>{t('sleep-chart/features/grayscale_optimized')}</strong> – {t('sleep-chart/features/grayscale_optimized_desc')}</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    </>
);
