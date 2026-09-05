import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { initMessages } from '../helpers/i18n';
import type { Locale } from '../data/site';

interface ToolIslandProps {
    locale: Locale;
}

/**
 * Builds the client island for one tool. Each tool gets its own wrapper
 * (src/tools/<slug>/ToolIsland.tsx) that statically imports its App + i18n,
 * so Astro only bundles and links that tool's CSS — the same per-tool chunk
 * model as the legacy pipeline. On hydration it sets window.LOCALE, merges the
 * common + tool messages into the shared store, then renders the App.
 *
 * The loading placeholder mirrors the legacy #app shell and is what SSR
 * renders before hydration swaps in the tool.
 */
export function createToolIsland(
    App: ComponentType,
    messages: Record<Locale, Record<string, string>>
) {
    return function ToolIsland({ locale }: ToolIslandProps) {
        const [ready, setReady] = useState(false);

        useEffect(() => {
            (window as any).LOCALE = locale;
            initMessages(messages[locale]);
            setReady(true);
        }, [locale]);

        if (!ready) {
            return (
                <div className="d-flex align-items-center">
                    <strong role="status">Loading...</strong>
                    <div className="spinner-border ms-auto" aria-hidden="true" />
                </div>
            );
        }
        return <App />;
    };
}
