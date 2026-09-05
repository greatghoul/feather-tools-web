import type { ReactNode } from 'react';
import { t } from '~/helpers/i18n';
import { TOOL_MAP } from '~/data/tools';
import type { Locale } from '~/data/site';
import { Suggestions } from './Suggestions';

interface ToolPageProps {
    slug: string;
    locale: Locale;
    /** Slugs of same-category tools suggested below the tool. */
    suggested: string[];
    /** Static sections (how-to-use etc.) rendered above the tool. */
    before?: ReactNode;
    /** Static sections rendered below the tool. */
    after?: ReactNode;
}

export const ToolPage = ({ slug, locale, suggested, before, after }: ToolPageProps) => (
    <>
        {!TOOL_MAP[slug]?.serverSide ? (
            <div className="mb-1">
                <p className="text-success mb-0" style={{ fontSize: '0.9em' }}>
                    <i className="bi bi-shield-fill-check" />
                    <span className="ms-1">{t('common/security')}</span>
                </p>
            </div>
        ) : null}
        <h1 className="mb-4 d-flex align-items-center gap-2">
            {TOOL_MAP[slug]?.logo ? (
                <img src={`/static/${TOOL_MAP[slug]!.logo}`} alt="" width={32} height={32} className="rounded" />
            ) : null}
            <span>{t(`${slug}/name`)}</span>
        </h1>
        <p className="lead mb-5">{t(`${slug}/note`)}</p>
        {before}
        <div id="app" className="mb-5">
            <div className="d-flex align-items-center">
                <strong role="status">Loading...</strong>
                <div className="spinner-border ms-auto" aria-hidden="true" />
            </div>
        </div>
        {after}
        <Suggestions current={slug} locale={locale} pool={suggested} />
    </>
);
