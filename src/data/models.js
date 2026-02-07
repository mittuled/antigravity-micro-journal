/* ===========================================
   DATA MODELS
   =========================================== */

/**
 * System entry types with predefined colors and prompts
 */
export const SYSTEM_ENTRY_TYPES = [
    {
        id: 'dream',
        name: 'dream',
        label: 'Dream',
        color: '#a78bfa',
        icon: '🌙',
        prompt: 'What did you dream about?',
        isSystem: true
    },
    {
        id: 'idea',
        name: 'idea',
        label: 'Idea',
        color: '#fbbf24',
        icon: '💡',
        prompt: 'What idea came to mind?',
        isSystem: true
    },
    {
        id: 'question',
        name: 'question',
        label: 'Question',
        color: '#38bdf8',
        icon: '❓',
        prompt: 'What are you wondering about?',
        isSystem: true
    },
    {
        id: 'fear',
        name: 'fear',
        label: 'Fear',
        color: '#f87171',
        icon: '😰',
        prompt: 'What is on your mind?',
        isSystem: true
    },
    {
        id: 'wisdom',
        name: 'wisdom',
        label: 'Wisdom',
        color: '#34d399',
        icon: '🌿',
        prompt: 'What wisdom did you discover?',
        isSystem: true
    },
    {
        id: 'memory',
        name: 'memory',
        label: 'Memory',
        color: '#fb923c',
        icon: '📸',
        prompt: 'What memory surfaced?',
        isSystem: true
    },
    {
        id: 'note',
        name: 'note',
        label: 'Note',
        color: '#94a3b8',
        icon: '📝',
        prompt: 'What would you like to note?',
        isSystem: true
    }
];

/**
 * Create a new entry object
 * @param {Object} data - Entry data
 * @returns {Object} Entry object
 */
export function createEntry({ content, typeId = 'note' }) {
    const now = new Date().toISOString();
    return {
        id: crypto.randomUUID(),
        content: content.trim(),
        typeId,
        createdAt: now,
        updatedAt: now
    };
}

/**
 * Create a custom entry type
 * @param {Object} data - Type data
 * @returns {Object} Entry type object
 */
export function createEntryType({ name, label, color, icon, prompt }) {
    return {
        id: crypto.randomUUID(),
        name: name.toLowerCase().replace(/\s+/g, '-'),
        label,
        color,
        icon: icon || '📌',
        prompt: prompt || `Write a ${label.toLowerCase()}...`,
        isSystem: false
    };
}

/**
 * Default settings
 */
export const DEFAULT_SETTINGS = {
    theme: 'dark', // 'light' | 'dark' | 'system'
    customTypes: []
};
