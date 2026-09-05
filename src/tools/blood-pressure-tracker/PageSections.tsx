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
                        <li>{t('blood-pressure-tracker/how_to_use/step1')}</li>
                        <li>{t('blood-pressure-tracker/how_to_use/step2')}</li>
                        <li>{t('blood-pressure-tracker/how_to_use/step3')}</li>
                        <li>{t('blood-pressure-tracker/how_to_use/step4')}</li>
                        <li>{t('blood-pressure-tracker/how_to_use/step5')}</li>
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
                        <li><strong>{t('blood-pressure-tracker/features/custom_date_range')}</strong> – {t('blood-pressure-tracker/features/custom_date_range_desc')}</li>
                        <li><strong>{t('blood-pressure-tracker/features/personalized_safe_ranges')}</strong> – {t('blood-pressure-tracker/features/personalized_safe_ranges_desc')}</li>
                        <li><strong>{t('blood-pressure-tracker/features/printer_friendly')}</strong> – {t('blood-pressure-tracker/features/printer_friendly_desc')}</li>
                        <li><strong>{t('blood-pressure-tracker/features/reference_guide')}</strong> – {t('blood-pressure-tracker/features/reference_guide_desc')}</li>
                        <li><strong>{t('blood-pressure-tracker/features/one_click_export')}</strong> – {t('blood-pressure-tracker/features/one_click_export_desc')}</li>
                        <li><strong>{t('blood-pressure-tracker/features/daily_segments')}</strong> – {t('blood-pressure-tracker/features/daily_segments_desc')}</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    </>
);
