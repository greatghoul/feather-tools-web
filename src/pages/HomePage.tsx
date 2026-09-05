import { t } from '~/helpers/i18n';
import { CATEGORY_ORDER, TOOL_MAP } from '~/data/tools';
import type { Locale } from '~/data/site';
import { ToolCard } from './ToolCard';

interface HomePageProps {
    locale: Locale;
    /** Slugs of migrated tools to show on the home page. */
    tools: string[];
}

export const HomePage = ({ locale, tools }: HomePageProps) => (
    <>
        <h1 className="mb-4">{t('home/welcome_title')}</h1>
        <p className="lead mb-5" dangerouslySetInnerHTML={{ __html: t('home/welcome_note') }} />
        {CATEGORY_ORDER.map((category) => {
            const categoryTools = tools.filter((slug) => TOOL_MAP[slug]?.category === category);
            if (categoryTools.length === 0) return null;
            return (
                <div key={category}>
                    <h2 className="fs-3 mb-2" id={`${category}-tools`}>{t(`category/${category}/name`)}</h2>
                    <p className="lead" dangerouslySetInnerHTML={{ __html: t(`category/${category}/note`) }} />
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3 mb-3">
                        {categoryTools.map((slug) => (
                            <div className="col" key={slug}>
                                <ToolCard slug={slug} locale={locale} />
                            </div>
                        ))}
                    </div>
                </div>
            );
        })}
    </>
);
