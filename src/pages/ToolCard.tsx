import { t } from '~/helpers/i18n';
import { TOOL_MAP } from '~/data/tools';
import type { Locale } from '~/data/site';

interface ToolCardProps {
    slug: string;
    locale: Locale;
}

export const ToolCard = ({ slug, locale }: ToolCardProps) => {
    const tool = TOOL_MAP[slug];
    const name = t(`${slug}/name`);
    const note = t(`${slug}/note`);
    return (
        <div className="card card-tool h-100 position-relative overflow-hidden">
            {tool?.logo ? (
                <img
                    src={`/static/${tool.logo}`}
                    alt=""
                    aria-hidden="true"
                    className="position-absolute top-50 end-0 translate-middle-y"
                    style={{ height: '100%', opacity: 0.12, pointerEvents: 'none' }}
                />
            ) : null}
            <div className="card-body py-2 px-3 position-relative z-1">
                <h2 className="h6 card-title mb-1">
                    <a href={`/${locale}/${slug}/`} className="stretched-link" title={note}>
                        {name}
                    </a>
                </h2>
                <p className="card-text card-text-clamp mb-0">{note}</p>
            </div>
        </div>
    );
};
