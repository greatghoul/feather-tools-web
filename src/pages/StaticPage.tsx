import { t } from '~/helpers/i18n';
import type { StaticPageDef } from '~/data/pages';

export const StaticPage = ({ page }: { page: StaticPageDef }) => (
    <div className="row justify-content-center">
        <div className="col-lg-8">
            <h1 className="mb-4">{t(page.titleKey)}</h1>
            <p className={page.headingNoteStyle === 'muted' ? 'text-muted mb-4' : 'lead mb-4'}>
                {t(page.headingNoteKey)}
            </p>
            {page.sections.map((section) => (
                <div key={section.titleKey}>
                    <h2 className="h5 mb-2">{t(section.titleKey)}</h2>
                    <p>{t(section.bodyKey)}</p>
                    {section.itemKeys ? (
                        <ul className="mb-4">
                            {section.itemKeys.map((itemKey) => (
                                <li key={itemKey}>{t(itemKey)}</li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            ))}
        </div>
    </div>
);
