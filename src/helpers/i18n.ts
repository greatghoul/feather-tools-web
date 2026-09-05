// Minimal i18n runtime shared by server-side page generation and client bundles.
// Translations are plain flat key -> string maps converted from the old gettext
// .po catalogs (see scripts/convert-i18n.mjs). A tool bundle initializes its
// messages before mounting; page generation does the same before rendering.

let messages: Record<string, string> = {};

export function initMessages(data: Record<string, string>): void {
    messages = { ...data };
}

export function t(key: string): string {
    return messages[key] ?? key;
}

/** Returns all currently loaded messages (used to debug missing keys). */
export function getMessages(): Record<string, string> {
    return messages;
}
