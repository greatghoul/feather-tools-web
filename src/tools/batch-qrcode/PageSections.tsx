import { t } from '~/helpers/i18n';

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
                    <h2 className="h5 mb-0">{t('tool/how_to_use')}</h2>
                </div>
                <div className="card-body">
                    <ol>
                        <li>{t('batch-qrcode/features/enter-urls')}</li>
                        <li>{t('batch-qrcode/features/generate')}</li>
                        <li>{t('batch-qrcode/features/download')}</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>


    </>
);
