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
                        <li>{t('todo-paper/how_to_use/step1')}</li>
                        <li>{t('todo-paper/how_to_use/step2')}</li>
                        <li>{t('todo-paper/how_to_use/step3')}</li>
                        <li>{t('todo-paper/how_to_use/step4')}</li>
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
                        <li><strong>{t('todo-paper/features/customizable_title')}</strong> – {t('todo-paper/features/customizable_title_desc')}</li>
                        <li><strong>{t('todo-paper/features/flexible_group_size')}</strong> – {t('todo-paper/features/flexible_group_size_desc')}</li>
                        <li><strong>{t('todo-paper/features/minor_tasks')}</strong> – {t('todo-paper/features/minor_tasks_desc')}</li>
                        <li><strong>{t('todo-paper/features/print_ready')}</strong> – {t('todo-paper/features/print_ready_desc')}</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    </>
);
