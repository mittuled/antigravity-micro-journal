/* ===========================================
   CONTENT PARSER
   Extract tags and mentions from content
   =========================================== */

/**
 * Extract hashtags from content
 * @param {string} content - Entry content
 * @returns {string[]} Array of unique lowercase tags (without #)
 */
export function extractTags(content) {
    const regex = /#(\w+)/g;
    const matches = content.match(regex) || [];
    const tags = matches.map(tag => tag.slice(1).toLowerCase());
    return [...new Set(tags)];
}

/**
 * Extract mentions from content
 * @param {string} content - Entry content
 * @returns {string[]} Array of unique lowercase mentions (without @)
 */
export function extractMentions(content) {
    const regex = /@(\w+)/g;
    const matches = content.match(regex) || [];
    const mentions = matches.map(mention => mention.slice(1).toLowerCase());
    return [...new Set(mentions)];
}

/**
 * Highlight tags and mentions in content for display
 * @param {string} content - Entry content
 * @returns {string} HTML string with highlighted tags/mentions
 */
export function highlightContent(content) {
    // Escape HTML first
    let html = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Highlight hashtags
    html = html.replace(
        /#(\w+)/g,
        '<span class="badge badge--tag">#$1</span>'
    );

    // Highlight mentions
    html = html.replace(
        /@(\w+)/g,
        '<span class="badge badge--mention">@$1</span>'
    );

    return html;
}

/**
 * Parse content and extract all metadata
 * @param {string} content - Entry content
 * @returns {Object} Parsed data with tags and mentions
 */
export function parseContent(content) {
    return {
        tags: extractTags(content),
        mentions: extractMentions(content)
    };
}
