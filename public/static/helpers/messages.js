/**
 * Displays a notification message using the global Notify class.
 *
 * @param {string} title - The title of the notification.
 * @param {string} message - The message content of the notification.
 * @param {'info'|'success'|'warning'|'error'} [status='info'] - The status type of the notification.
 */
export function notify(title, message, status = 'info') {
    // Ensure at least one of title or message is provided
    const hasTitle = typeof title === 'string' && title.trim() !== '';
    const hasMessage = typeof message === 'string' && message.trim() !== '';
    
    if (!hasTitle && !hasMessage) {
        console.warn('Notify called without title or message');
        return;
    }
    
    new window.Notify({
        status: status,
        title: hasTitle ? title : 'Notification',
        text: hasMessage ? message : '',
        effect: 'fade',
        speed: 300,
        autoclose: true,
        autotimeout: 3000,
        position: 'x-center top'
    });
}