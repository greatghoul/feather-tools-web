/**
 * Returns the trimmed string if it's not blank, otherwise returns the default value.
 *
 * @param {string} value - The input string.
 * @param {string} defaultValue - The value to return if input is blank, default to ''.
 * @returns {string}
 */
export function defaultText(value, defaultValue = '') {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed !== '') {
            return trimmed;
        }
    }

    return defaultValue;
}

/**
 * Returns the translated message for the given key from window.MESSAGES.
 *
 * @param {string} key - The translation key.
 * @returns {string}
 */
export function getText(key) {
    return window.MESSAGES[key];
}
