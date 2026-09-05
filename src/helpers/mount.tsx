import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * Mounts a tool's root element into the page's #app container.
 * Module scripts run after the DOM is parsed, so no ready-event wait is needed.
 */
export function mountApp(App: ReactElement): void {
    const container = document.getElementById('app');
    if (!container) {
        throw new Error('Mount point #app not found');
    }
    createRoot(container).render(App);
}
