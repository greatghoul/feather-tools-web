import type { ReactElement } from 'react';
import { t } from '~/helpers/i18n';

/**
 * Renders a translation string as plain text, or as HTML when it contains
 * markup (some how-to-use strings embed <strong> and similar tags).
 */
export function T({ k }: { k: string }): ReactElement {
    const text = t(k);
    if (/<[a-z][^>]*>/i.test(text)) {
        return <span dangerouslySetInnerHTML={{ __html: text }} />;
    }
    return <>{text}</>;
}
