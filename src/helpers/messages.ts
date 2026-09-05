import Notify from 'simple-notify';

export type NotifyStatus = 'info' | 'success' | 'warning' | 'error';

/**
 * Displays a notification message.
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
}
