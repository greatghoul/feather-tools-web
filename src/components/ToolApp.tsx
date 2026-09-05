import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { initMessages } from '../helpers/i18n';
import type { Locale } from '../data/site';

// Lazy-load every tool's App + per-tool i18n as its own chunk, mirroring the
// legacy per-tool entry bundles. On the server the island renders only the
// loading placeholder (the tool module is never imported during SSR), then on
// hydration the matching chunk is fetched and mounted into #app.
const apps = import.meta.glob('../tools/*/App.tsx');
const toolMessages = import.meta.glob('../tools/*/i18n/{en,zh}.json');
const commonMessages = import.meta.glob('../i18n/client/{en,zh}.json');

interface Props {
    slug: string;
    locale: Locale;
}

export default function ToolApp({ slug, locale }: Props) {
    const [App, setApp] = useState<ComponentType | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const appMod = (await apps[`../tools/${slug}/App.tsx`]()) as {
                default: ComponentType;
            };
            const toolMod = (await toolMessages[`../tools/${slug}/i18n/${locale}.json`]()) as {
                default: Record<string, string>;
            };
            const commonMod = (await commonMessages[`../i18n/client/${locale}.json`]()) as {
                default: Record<string, string>;
            };
            (window as any).LOCALE = locale;
            initMessages({ ...commonMod.default, ...toolMod.default });
            if (!cancelled) setApp(() => appMod.default);
        })();
        return () => {
            cancelled = true;
        };
    }, [slug, locale]);

    if (!App) {
        // Mirrors the legacy #app loading placeholder.
        return (
            <div className="d-flex align-items-center">
                <strong role="status">Loading...</strong>
                <div className="spinner-border ms-auto" aria-hidden="true" />
            </div>
        );
    }
    return <App />;
}
