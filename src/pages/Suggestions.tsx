import { t } from '~/helpers/i18n';
import type { Locale } from '~/data/site';
import { ToolCard } from './ToolCard';

interface SuggestionsProps {
    current: string;
    locale: Locale;
    /** Slugs of same-category tools to suggest. */
    pool: string[];
}

export const Suggestions = ({ current, locale, pool }: SuggestionsProps) => {
    const suggestions = pool.filter((slug) => slug !== current);
    if (suggestions.length === 0) return null;
    return (
        <>
            <h2 className="h5 mb-3">{t('tool/you_may_also_like')}</h2>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3 mb-3">
                {suggestions.map((slug) => (
                    <div className="col" key={slug}>
                        <ToolCard slug={slug} locale={locale} />
                    </div>
                ))}
            </div>
        </>
    );
};
