/* ===========================================
   GLASS CARD COMPONENT
   Entry card with liquid glass effect
   =========================================== */

import { highlightContent } from '../data/parser.js';
import { getEntryType } from '../data/store.js';
import { formatRelativeDate } from '../utils/date.js';

/**
 * Create an entry card
 * @param {Object} entry - Entry data
 * @param {Object} options - Card options
 * @returns {HTMLElement} Card element
 */
export async function createEntryCard(entry, options = {}) {
    const { onEdit, onDelete } = options;
    const entryType = await getEntryType(entry.typeId);

    const card = document.createElement('article');
    card.className = 'entry-card glass-card';
    card.dataset.entryId = entry.id;
    card.style.setProperty('--type-color', entryType?.color || 'var(--type-note)');

    const highlightedContent = highlightContent(entry.content);
    const dateStr = formatRelativeDate(entry.createdAt);

    card.innerHTML = `
    <div class="entry-card__header">
      <span class="entry-card__badge badge badge--${entryType?.name || 'note'}">
        ${entryType?.icon || '📝'} ${entryType?.label || 'Note'}
      </span>
      <time class="entry-card__date" datetime="${entry.createdAt}">${dateStr}</time>
    </div>
    <div class="entry-card__content">${highlightedContent}</div>
    <div class="entry-card__actions">
      <button class="entry-card__action" data-action="edit" aria-label="Edit entry">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button class="entry-card__action entry-card__action--delete" data-action="delete" aria-label="Delete entry">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
  `;

    // Add action handlers
    if (onEdit) {
        card.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
            e.stopPropagation();
            onEdit(entry);
        });
    }

    if (onDelete) {
        card.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
            e.stopPropagation();
            onDelete(entry);
        });
    }

    return card;
}

/**
 * Create a skeleton card for loading state
 * @returns {HTMLElement} Skeleton card element
 */
export function createSkeletonCard() {
    const card = document.createElement('div');
    card.className = 'entry-card entry-card--skeleton';
    card.innerHTML = `
    <div class="entry-card__header">
      <div class="skeleton" style="width: 80px; height: 24px;"></div>
      <div class="skeleton" style="width: 60px; height: 16px;"></div>
    </div>
    <div class="entry-card__content">
      <div class="skeleton" style="width: 100%; height: 16px; margin-bottom: 8px;"></div>
      <div class="skeleton" style="width: 85%; height: 16px; margin-bottom: 8px;"></div>
      <div class="skeleton" style="width: 70%; height: 16px;"></div>
    </div>
  `;
    return card;
}

// CSS for Entry Card (injected)
const styles = `
.entry-card {
  position: relative;
  padding: var(--space-4);
  border-left: 3px solid var(--type-color, var(--type-note));
}

.entry-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.entry-card__badge {
  font-size: var(--font-size-xs);
}

.entry-card__date {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.entry-card__content {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  color: var(--text-secondary);
  word-break: break-word;
  white-space: pre-wrap;
}

.entry-card__content .badge {
  display: inline;
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-xs);
  vertical-align: baseline;
}

.entry-card__actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--glass-border);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.entry-card:hover .entry-card__actions,
.entry-card:focus-within .entry-card__actions {
  opacity: 1;
}

@media (hover: none) {
  .entry-card__actions {
    opacity: 1;
  }
}

.entry-card__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.entry-card__action:hover {
  background: var(--glass-bg-hover);
  color: var(--text-primary);
  border-color: var(--glass-border-hover);
}

.entry-card__action--delete:hover {
  color: var(--type-fear);
  border-color: var(--type-fear);
}

.entry-card__action:active {
  transform: scale(0.95);
}

.entry-card__action svg {
  width: 16px;
  height: 16px;
}

.entry-card--skeleton {
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.entry-card--skeleton .entry-card__content {
  display: flex;
  flex-direction: column;
}
`;

// Inject styles
if (!document.getElementById('entry-card-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'entry-card-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}
