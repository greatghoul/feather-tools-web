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
                    <h2 className="h5 mb-0">{t('merge-images/how_to_use/title')}</h2>
                </div>
                <div className="card-body">
                    <ol>
                        <li><strong>{t('merge-images/how_to_use/upload_images')}</strong> {t('merge-images/how_to_use/upload_images_desc')}</li>
                        <li>{t('merge-images/how_to_use/merge_direction')} <strong>{t('merge-images/how_to_use/merge_direction_desc')}</strong></li>
                        <li><strong>{t('merge-images/how_to_use/image_dimensions')}</strong>:
                            <ul className="mt-2 mb-2">
                                <li><strong>{t('merge-images/how_to_use/image_dimensions_vertical')}</strong></li>
                                <li><strong>{t('merge-images/how_to_use/image_dimensions_horizontal')}</strong></li>
                            </ul>
                        </li>
                        <li><strong>{t('merge-images/how_to_use/spacing_settings')}</strong> {t('merge-images/how_to_use/spacing_settings_desc')}</li>
                        <li><strong>{t('merge-images/how_to_use/background_color')}</strong> {t('merge-images/how_to_use/background_color_desc')}</li>
                        <li><strong>{t('merge-images/how_to_use/merge_button')}</strong> {t('merge-images/how_to_use/merge_button_desc')}</li>
                        <li><strong>{t('merge-images/how_to_use/download')}</strong> {t('merge-images/how_to_use/download_desc')}</li>
                    </ol>
                </div>
            </div>
        </div>
        <div className="col-lg-6">
            <div className="card h-100">
                <div className="card-header">
                    <h2 className="h5 mb-0">{t('merge-images/tips/title')}</h2>
                </div>
                <div className="card-body">
                    <ul className="list-unstyled">
                        <li className="mb-2"><i className="bi bi-info-circle text-primary me-1"></i> {t('merge-images/tips/similar_dimensions')}</li>
                        <li className="mb-2"><i className="bi bi-info-circle text-primary me-1"></i> {t('merge-images/tips/formats')}</li>
                        <li><i className="bi bi-info-circle text-primary me-1"></i> {t('merge-images/tips/reorder')}</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    </>
);
