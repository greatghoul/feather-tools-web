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
                    <h2 className="h5 mb-0">{t('shape-image/how_to_use/title')}</h2>
                </div>
                <div className="card-body">
                    <ol className="mb-0">
                        <li><strong>{t('shape-image/how_to_use/select_image')}</strong> - {t('shape-image/how_to_use/select_image_desc')}</li>
                        <li>{t('shape-image/how_to_use/choose_shape')} - {t('shape-image/how_to_use/choose_shape_desc')}</li>
                        <li><strong>{t('shape-image/how_to_use/preview_generate')}</strong> - {t('shape-image/how_to_use/preview_generate_desc')}</li>
                        <li><strong>{t('shape-image/how_to_use/download')}</strong> - {t('shape-image/how_to_use/download_desc')}</li>
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
                        <li><strong>{t('shape-image/features/multiple_shapes')}</strong> - {t('shape-image/features/multiple_shapes_desc')}</li>
                        <li><strong>{t('shape-image/features/high_quality')}</strong> - {t('shape-image/features/high_quality_desc')}</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    </>
);
