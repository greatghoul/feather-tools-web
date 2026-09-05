// simple-notify is a browser-only library whose module top-level parses SVG
// via DOMParser (SSR crashes with "DOMParser is not defined"). Tools import
// this helper at module top level, so importing simple-notify eagerly would
// break Astro's server-side render. Load it lazily: the module only enters
// the graph on the client, when a notification is actually shown.
let Notify: { new (options: Record<string, unknown>): unknown } | null = null;
let loading: Promise<void> | null = null;

function ensureNotify(): Promise<void> {
    if (!loading) {
        loading = import('simple-notify').then((m) => {
            Notify = m.default;
        });
    }
    return loading;
}

export type NotifyStatus = 'info' | 'success' | 'warning' | 'error';

/**
 * Displays a notification message. simple-notify loads asynchronously on
 * first use, so the first notification may appear a moment after the click.
 *
 * @param title - The title of the notification
 * @param message - The message content of the notification
 * @param status - The status type of the notification
 */
export function notify(title: string, message: string, status: NotifyStatus = 'info'): void {
    const hasTitle = typeof title === 'string' && title.trim() !== '';
    const hasMessage = typeof message === 'string' && message.trim() !== '';

    if (!hasTitle && !hasMessage) {
        console.warn('Notify called without title or message');
        return;
    }

    void ensureNotify().then(() => {
        if (!Notify) return;
        new Notify({
            status: status,
            title: hasTitle ? title : 'Notification',
            text: hasMessage ? message : '',
            effect: 'fade',
            speed: 300,
            autoclose: true,
            autotimeout: 3000,
            position: 'x-center top',
        });
    });
}
