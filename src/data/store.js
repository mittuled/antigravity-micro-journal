/* ===========================================
   DATA STORE
   IndexedDB wrapper for persistent storage
   =========================================== */

import { get, set, del, keys, clear } from 'idb-keyval';
import { createEntry, SYSTEM_ENTRY_TYPES, DEFAULT_SETTINGS } from './models.js';
import { parseContent } from './parser.js';

const ENTRIES_KEY = 'journal_entries';
const SETTINGS_KEY = 'journal_settings';
const CUSTOM_TYPES_KEY = 'journal_custom_types';

/* ---- Entries ---- */

/**
 * Get all entries, sorted by createdAt descending
 * @returns {Promise<Array>} Array of entries
 */
export async function getAllEntries() {
    const entries = await get(ENTRIES_KEY) || [];
    return entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Get entries with pagination
 * @param {number} page - Page number (0-indexed)
 * @param {number} limit - Entries per page
 * @returns {Promise<Object>} { entries, hasMore }
 */
export async function getEntriesPaginated(page = 0, limit = 20) {
    const allEntries = await getAllEntries();
    const start = page * limit;
    const entries = allEntries.slice(start, start + limit);
    const hasMore = start + limit < allEntries.length;
    return { entries, hasMore };
}

/**
 * Get a single entry by ID
 * @param {string} id - Entry ID
 * @returns {Promise<Object|null>} Entry or null
 */
export async function getEntry(id) {
    const entries = await getAllEntries();
    return entries.find(e => e.id === id) || null;
}

/**
 * Add a new entry
 * @param {Object} data - Entry data { content, typeId }
 * @returns {Promise<Object>} Created entry with parsed tags/mentions
 */
export async function addEntry({ content, typeId }) {
    const entries = await get(ENTRIES_KEY) || [];
    const entry = createEntry({ content, typeId });
    const { tags, mentions } = parseContent(content);

    const entryWithMeta = {
        ...entry,
        tags,
        mentions
    };

    entries.push(entryWithMeta);
    await set(ENTRIES_KEY, entries);
    return entryWithMeta;
}

/**
 * Update an existing entry
 * @param {string} id - Entry ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated entry or null
 */
export async function updateEntry(id, updates) {
    const entries = await get(ENTRIES_KEY) || [];
    const index = entries.findIndex(e => e.id === id);

    if (index === -1) return null;

    const updatedEntry = {
        ...entries[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    // Re-parse tags and mentions if content changed
    if (updates.content) {
        const { tags, mentions } = parseContent(updates.content);
        updatedEntry.tags = tags;
        updatedEntry.mentions = mentions;
    }

    entries[index] = updatedEntry;
    await set(ENTRIES_KEY, entries);
    return updatedEntry;
}

/**
 * Delete an entry
 * @param {string} id - Entry ID
 * @returns {Promise<boolean>} Success
 */
export async function deleteEntry(id) {
    const entries = await get(ENTRIES_KEY) || [];
    const filtered = entries.filter(e => e.id !== id);

    if (filtered.length === entries.length) return false;

    await set(ENTRIES_KEY, filtered);
    return true;
}

/* ---- Search & Filter ---- */

/**
 * Search entries by content
 * @param {string} query - Search query
 * @returns {Promise<Array>} Matching entries
 */
export async function searchEntries(query) {
    const entries = await getAllEntries();
    const lowerQuery = query.toLowerCase();
    return entries.filter(e =>
        e.content.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Filter entries by tag
 * @param {string} tag - Tag to filter by (without #)
 * @returns {Promise<Array>} Matching entries
 */
export async function filterByTag(tag) {
    const entries = await getAllEntries();
    const lowerTag = tag.toLowerCase();
    return entries.filter(e =>
        e.tags && e.tags.includes(lowerTag)
    );
}

/**
 * Filter entries by mention
 * @param {string} mention - Mention to filter by (without @)
 * @returns {Promise<Array>} Matching entries
 */
export async function filterByMention(mention) {
    const entries = await getAllEntries();
    const lowerMention = mention.toLowerCase();
    return entries.filter(e =>
        e.mentions && e.mentions.includes(lowerMention)
    );
}

/**
 * Filter entries by type
 * @param {string} typeId - Type ID to filter by
 * @returns {Promise<Array>} Matching entries
 */
export async function filterByType(typeId) {
    const entries = await getAllEntries();
    return entries.filter(e => e.typeId === typeId);
}

/* ---- Analytics ---- */

/**
 * Get all unique tags with counts
 * @returns {Promise<Array>} Array of { tag, count }
 */
export async function getAllTags() {
    const entries = await getAllEntries();
    const tagCounts = {};

    entries.forEach(e => {
        (e.tags || []).forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });

    return Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);
}

/**
 * Get all unique mentions with counts
 * @returns {Promise<Array>} Array of { mention, count }
 */
export async function getAllMentions() {
    const entries = await getAllEntries();
    const mentionCounts = {};

    entries.forEach(e => {
        (e.mentions || []).forEach(mention => {
            mentionCounts[mention] = (mentionCounts[mention] || 0) + 1;
        });
    });

    return Object.entries(mentionCounts)
        .map(([mention, count]) => ({ mention, count }))
        .sort((a, b) => b.count - a.count);
}

/**
 * Get entry counts by type
 * @returns {Promise<Array>} Array of { typeId, count }
 */
export async function getEntriesByType() {
    const entries = await getAllEntries();
    const typeCounts = {};

    entries.forEach(e => {
        typeCounts[e.typeId] = (typeCounts[e.typeId] || 0) + 1;
    });

    return Object.entries(typeCounts)
        .map(([typeId, count]) => ({ typeId, count }))
        .sort((a, b) => b.count - a.count);
}

/**
 * Get activity data for the last N weeks
 * @param {number} weeks - Number of weeks
 * @returns {Promise<Object>} Activity data for graph
 */
export async function getActivityData(weeks = 17) {
    const entries = await getAllEntries();
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysToShow = weeks * 7;

    // Create a map of date -> count
    const dateCounts = {};

    entries.forEach(entry => {
        if (!entry.createdAt) return;
        const date = new Date(entry.createdAt);
        if (isNaN(date.getTime())) return;

        const dateKey = date.toISOString().split('T')[0];
        dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
    });

    // Generate array for the graph
    const data = [];
    for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * msPerDay);
        const dateKey = date.toISOString().split('T')[0];
        data.push({
            date: dateKey,
            count: dateCounts[dateKey] || 0,
            dayOfWeek: date.getDay()
        });
    }

    // Calculate stats
    const totalEntries = Object.values(dateCounts).reduce((a, b) => a + b, 0);
    const activeDays = Object.keys(dateCounts).length;

    return { data, totalEntries, activeDays };
}

/**
 * Get overview statistics
 * @returns {Promise<Object>} Stats object
 */
export async function getStats() {
    const entries = await getAllEntries();
    const byType = await getEntriesByType();
    const allTypes = await getAllEntryTypes();

    const mostUsedType = byType[0];
    const mostUsedTypeInfo = mostUsedType
        ? allTypes.find(t => t.id === mostUsedType.typeId)
        : null;

    return {
        totalEntries: entries.length,
        typesUsed: byType.length,
        mostUsedType: mostUsedTypeInfo,
        mostUsedTypeCount: mostUsedType?.count || 0
    };
}

/* ---- Entry Types ---- */

/**
 * Get all entry types (system + custom)
 * @returns {Promise<Array>} All entry types
 */
export async function getAllEntryTypes() {
    const customTypes = await get(CUSTOM_TYPES_KEY) || [];
    return [...SYSTEM_ENTRY_TYPES, ...customTypes];
}

/**
 * Get entry type by ID
 * @param {string} id - Type ID
 * @returns {Promise<Object|null>} Entry type or null
 */
export async function getEntryType(id) {
    const allTypes = await getAllEntryTypes();
    return allTypes.find(t => t.id === id) || null;
}

/**
 * Add a custom entry type
 * @param {Object} typeData - Type data
 * @returns {Promise<Object>} Created type
 */
export async function addCustomType(typeData) {
    const customTypes = await get(CUSTOM_TYPES_KEY) || [];
    const newType = {
        id: crypto.randomUUID(),
        ...typeData,
        isSystem: false
    };
    customTypes.push(newType);
    await set(CUSTOM_TYPES_KEY, customTypes);
    return newType;
}

/**
 * Update a custom entry type
 * @param {string} id - Type ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated type or null
 */
export async function updateCustomType(id, updates) {
    const customTypes = await get(CUSTOM_TYPES_KEY) || [];
    const index = customTypes.findIndex(t => t.id === id);

    if (index === -1) return null;

    customTypes[index] = { ...customTypes[index], ...updates };
    await set(CUSTOM_TYPES_KEY, customTypes);
    return customTypes[index];
}

/**
 * Delete a custom entry type
 * @param {string} id - Type ID
 * @returns {Promise<boolean>} Success
 */
export async function deleteCustomType(id) {
    const customTypes = await get(CUSTOM_TYPES_KEY) || [];
    const filtered = customTypes.filter(t => t.id !== id);

    if (filtered.length === customTypes.length) return false;

    await set(CUSTOM_TYPES_KEY, filtered);
    return true;
}

/* ---- Settings ---- */

/**
 * Get app settings
 * @returns {Promise<Object>} Settings object
 */
export async function getSettings() {
    const settings = await get(SETTINGS_KEY);
    return { ...DEFAULT_SETTINGS, ...settings };
}

/**
 * Update settings
 * @param {Object} updates - Settings to update
 * @returns {Promise<Object>} Updated settings
 */
export async function updateSettings(updates) {
    const current = await getSettings();
    const updated = { ...current, ...updates };
    await set(SETTINGS_KEY, updated);
    return updated;
}

/* ---- Utilities ---- */

/**
 * Clear all data (for testing/reset)
 * @returns {Promise<void>}
 */
export async function clearAllData() {
    await del(ENTRIES_KEY);
    await del(SETTINGS_KEY);
    await del(CUSTOM_TYPES_KEY);
}

/**
 * Export all data as JSON
 * @returns {Promise<Object>} All data
 */
export async function exportData() {
    const entries = await getAllEntries();
    const settings = await getSettings();
    const customTypes = await get(CUSTOM_TYPES_KEY) || [];

    return {
        entries,
        settings,
        customTypes,
        exportedAt: new Date().toISOString()
    };
}
