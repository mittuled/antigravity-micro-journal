/* ===========================================
   DATE UTILITIES
   Formatting and relative date helpers
   =========================================== */

/**
 * Format a date as relative (Today, Yesterday, etc.)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatRelativeDate(date) {
    const d = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.floor((today - dateDay) / (1000 * 60 * 60 * 24));

    const timeStr = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    if (diffDays === 0) {
        return `Today, ${timeStr}`;
    } else if (diffDays === 1) {
        return `Yesterday, ${timeStr}`;
    } else if (diffDays < 7) {
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
        return `${dayName}, ${timeStr}`;
    } else {
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        }) + `, ${timeStr}`;
    }
}

/**
 * Get date group label (Today, Yesterday, This Week, Earlier)
 * @param {string|Date} date - Date to categorize
 * @returns {string} Group label
 */
export function getDateGroup(date) {
    const d = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.floor((today - dateDay) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return 'This Week';
    return 'Earlier';
}

/**
 * Format date for display in entries
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Format time only
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted time
 */
export function formatTime(date) {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

/**
 * Get month name from date
 * @param {string|Date} date - Date
 * @returns {string} Month name (short)
 */
export function getMonthName(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short' });
}
