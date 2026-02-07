/* ===========================================
   SEARCH PAGE
   Token-based search with filters
   =========================================== */

import { searchEntries, filterByTag, filterByMention, filterByType, getAllTags, getAllMentions, getAllEntryTypes } from '../data/store.js';
import { createEntryCard } from '../components/Card.js';
import { getDateGroup } from '../utils/date.js';

/**
 * Create the Search page
 * @returns {HTMLElement} Search page element
 */
export async function createSearchPage() {
  const page = document.createElement('div');
  page.className = 'search-page';

  page.innerHTML = `
    <div class="search-page__header">
      <h1 class="heading-2">Search</h1>
      <div class="search-bar glass-card">
        <svg class="search-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <div class="search-bar__tokens" id="search-tokens"></div>
        <input 
          type="text" 
          class="search-bar__input" 
          id="search-input"
          placeholder="Search entries..."
          autocomplete="off"
        />
      </div>
      
      <div class="search-suggestions glass-card" id="search-suggestions" style="display: none;"></div>
    </div>
    
    <div class="search-page__filters" id="filter-chips"></div>

    <div class="search-page__results" id="search-results">
      <div class="search-page__empty" id="empty-state">
        <span class="search-page__empty-icon">🔍</span>
        <p>Search for entries by text, #tags, or @mentions</p>
      </div>
    </div>
  `;

  const searchInput = page.querySelector('#search-input');
  const tokensContainer = page.querySelector('#search-tokens');
  const suggestionsEl = page.querySelector('#search-suggestions');
  const resultsEl = page.querySelector('#search-results');
  const filterChipsEl = page.querySelector('#filter-chips');
  const emptyState = page.querySelector('#empty-state');

  const tokens = [];
  let searchTimeout = null;

  // Load filter chips
  await loadFilterChips(filterChipsEl, tokens, tokensContainer, resultsEl, emptyState);

  // Search input handling
  searchInput.addEventListener('input', async (e) => {
    const value = e.target.value;

    // Show suggestions for @ or #
    if (value.startsWith('@') || value.startsWith('#')) {
      await showSuggestions(value, suggestionsEl, (suggestion) => {
        addToken(suggestion.type, suggestion.value, tokens, tokensContainer);
        searchInput.value = '';
        suggestionsEl.style.display = 'none';
        performSearch(tokens, searchInput.value, resultsEl, emptyState);
      });
    } else {
      suggestionsEl.style.display = 'none';

      // Debounced search
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch(tokens, value, resultsEl, emptyState);
      }, 300);
    }
  });

  // Handle backspace to remove tokens
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && searchInput.value === '' && tokens.length > 0) {
      removeToken(tokens.length - 1, tokens, tokensContainer);
      performSearch(tokens, searchInput.value, resultsEl, emptyState);
    }
  });

  // Close suggestions on outside click
  page.addEventListener('click', (e) => {
    if (!e.target.closest('.search-bar')) {
      suggestionsEl.style.display = 'none';
    }
  });

  // Auto-focus search input
  requestAnimationFrame(() => {
    searchInput.focus();
  });

  return page;
}

/**
 * Add a token to the search (but not if already exists)
 */
function addToken(type, value, tokens, container) {
  // Check if token already exists
  const existingIndex = tokens.findIndex(t => t.type === type && t.value === value);
  if (existingIndex !== -1) {
    return false; // Already exists
  }
  tokens.push({ type, value });
  renderTokens(tokens, container);
  return true;
}

/**
 * Remove a token
 */
function removeToken(index, tokens, container) {
  tokens.splice(index, 1);
  renderTokens(tokens, container);
}

/**
 * Render tokens
 */
function renderTokens(tokens, container) {
  container.innerHTML = tokens.map((token, i) => `
    <span class="search-token ${token.type === 'tag' ? 'search-token--tag' : 'search-token--mention'}">
      ${token.type === 'tag' ? '#' : '@'}${token.value}
      <button class="search-token__remove" data-index="${i}">×</button>
    </span>
  `).join('');

  container.querySelectorAll('.search-token__remove').forEach(btn => {
    btn.addEventListener('click', () => {
      removeToken(parseInt(btn.dataset.index), tokens, container);
    });
  });
}

/**
 * Show autocomplete suggestions
 */
async function showSuggestions(query, suggestionsEl, onSelect) {
  const isTag = query.startsWith('#');
  const searchTerm = query.slice(1).toLowerCase();

  let items = [];
  if (isTag) {
    items = (await getAllTags()).filter(t => t.tag.includes(searchTerm));
  } else {
    items = (await getAllMentions()).filter(m => m.mention.includes(searchTerm));
  }

  if (items.length === 0) {
    suggestionsEl.style.display = 'none';
    return;
  }

  suggestionsEl.innerHTML = items.slice(0, 5).map(item => `
    <button class="search-suggestion" data-type="${isTag ? 'tag' : 'mention'}" data-value="${isTag ? item.tag : item.mention}">
      <span class="search-suggestion__text">${isTag ? '#' : '@'}${isTag ? item.tag : item.mention}</span>
      <span class="search-suggestion__count">${item.count}</span>
    </button>
  `).join('');

  suggestionsEl.style.display = 'block';

  suggestionsEl.querySelectorAll('.search-suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      onSelect({ type: btn.dataset.type, value: btn.dataset.value });
    });
  });
}

/**
 * Load filter chips for quick access
 */
async function loadFilterChips(container, tokens, tokensContainer, resultsEl, emptyState) {
  const tags = (await getAllTags()).slice(0, 5);
  const types = await getAllEntryTypes();

  container.innerHTML = `
    ${tags.map(t => `
      <button class="filter-chip badge badge--tag" data-type="tag" data-value="${t.tag}">
        #${t.tag}
      </button>
    `).join('')}
    ${types.slice(0, 4).map(t => `
      <button class="filter-chip badge badge--${t.name}" data-type="entryType" data-value="${t.id}">
        ${t.icon} ${t.label}
      </button>
    `).join('')}
  `;

  container.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const type = chip.dataset.type === 'tag' ? 'tag' : 'entryType';
      const value = chip.dataset.value;

      // Toggle behavior - check if already exists
      const existingIndex = tokens.findIndex(t => t.type === type && t.value === value);
      if (existingIndex !== -1) {
        // Remove the token
        removeToken(existingIndex, tokens, tokensContainer);
        chip.classList.remove('filter-chip--active');
      } else {
        // Add the token
        addToken(type, value, tokens, tokensContainer);
        chip.classList.add('filter-chip--active');
      }
      performSearch(tokens, '', resultsEl, emptyState);
    });
  });
}

/**
 * Perform search
 */
async function performSearch(tokens, query, resultsEl, emptyState) {
  resultsEl.innerHTML = '<div class="search-page__loading"><span class="spinner"></span></div>';

  try {
    let entries = [];

    // If we have tokens, filter by them
    if (tokens.length > 0) {
      for (const token of tokens) {
        let filtered = [];
        if (token.type === 'tag') {
          filtered = await filterByTag(token.value);
        } else if (token.type === 'mention') {
          filtered = await filterByMention(token.value);
        } else if (token.type === 'entryType') {
          filtered = await filterByType(token.value);
        }

        if (entries.length === 0) {
          entries = filtered;
        } else {
          // Intersection
          entries = entries.filter(e => filtered.some(f => f.id === e.id));
        }
      }
    } else if (query.trim()) {
      entries = await searchEntries(query);
    } else {
      resultsEl.innerHTML = '';
      resultsEl.appendChild(emptyState);
      emptyState.style.display = 'flex';
      return;
    }

    if (entries.length === 0) {
      resultsEl.innerHTML = `
        <div class="search-page__no-results">
          <span>😕</span>
          <p>No entries found</p>
        </div>
      `;
      return;
    }

    // Group by date
    const groups = {};
    entries.forEach(entry => {
      const group = getDateGroup(entry.createdAt);
      if (!groups[group]) groups[group] = [];
      groups[group].push(entry);
    });

    resultsEl.innerHTML = '';

    for (const [group, groupEntries] of Object.entries(groups)) {
      const groupEl = document.createElement('div');
      groupEl.className = 'search-results-group';
      groupEl.innerHTML = `<h3 class="search-results-group__header">${group}</h3>`;

      const entriesContainer = document.createElement('div');
      entriesContainer.className = 'search-results-group__entries';

      for (const entry of groupEntries) {
        const card = await createEntryCard(entry, {});
        entriesContainer.appendChild(card);
      }

      groupEl.appendChild(entriesContainer);
      resultsEl.appendChild(groupEl);
    }
  } catch (error) {
    console.error('Search failed:', error);
    resultsEl.innerHTML = '<div class="search-page__error">Search failed</div>';
  }
}

// CSS for Search Page (injected)
const styles = `
.search-page {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.search-page__header {
  position: relative;
  text-align: center;
  margin-bottom: var(--space-4);
  padding-top: var(--space-8);
}

.search-page__header h1 {
  margin-bottom: var(--space-4);
}

.search-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
}

.search-bar__icon {
  width: 20px;
  height: 20px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-bar__tokens {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.search-bar__input {
  flex: 1;
  min-width: 100px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  outline: none;
}

.search-bar__input::placeholder {
  color: var(--text-muted);
}

.search-token {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
}

.search-token--tag {
  background: rgba(99, 102, 241, 0.2);
  color: var(--accent-primary);
}

.search-token--mention {
  background: rgba(139, 92, 246, 0.2);
  color: var(--accent-secondary);
}

.search-token__remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: var(--font-size-lg);
  line-height: 1;
  opacity: 0.7;
}

.search-token__remove:hover {
  opacity: 1;
}

.search-suggestions {
  position: absolute;
  top: calc(100% + var(--space-2));
  left: 0;
  right: 0;
  z-index: var(--z-dropdown);
  max-height: 200px;
  overflow-y: auto;
}

.search-suggestion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--glass-border);
  color: var(--text-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  cursor: pointer;
  text-align: left;
}

.search-suggestion:last-child {
  border-bottom: none;
}

.search-suggestion:hover {
  background: var(--glass-bg-hover);
}

.search-suggestion__count {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}

.search-page__filters {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.filter-chip {
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.filter-chip:hover {
  transform: scale(1.05);
}

.filter-chip:active {
  transform: scale(0.95);
}

.search-page__results {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.search-page__empty,
.search-page__no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-12);
  color: var(--text-secondary);
}

.search-page__empty-icon {
  font-size: 3rem;
  margin-bottom: var(--space-4);
}

.search-page__loading {
  display: flex;
  justify-content: center;
  padding: var(--space-8);
}

.search-results-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.search-results-group__header {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.search-results-group__entries {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
`;

// Inject styles
if (!document.getElementById('search-page-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'search-page-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
