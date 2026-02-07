/* ===========================================
   TIMELINE ENTRY COMPONENT
   Entry card with icon circle for timeline view
   =========================================== */

import { highlightContent } from '../data/parser.js';
import { getEntryType } from '../data/store.js';
import { formatTime } from '../utils/date.js';

/**
 * Create a timeline entry
 * @param {Object} entry - Entry data
 * @param {Object} options - Options
 * @param {boolean} options.isLast - Is this the last entry in group
 * @returns {HTMLElement} Timeline entry element
 */
export async function createTimelineEntry(entry, options = {}) {
  const { onEdit, onDelete, isLast = false } = options;
  const entryType = await getEntryType(entry.typeId);

  const item = document.createElement('div');
  item.className = `timeline-entry${isLast ? ' timeline-entry--last' : ''}`;
  item.dataset.entryId = entry.id;
  item.style.setProperty('--type-color', entryType?.color || 'var(--type-note)');

  const highlightedContent = highlightContent(entry.content);
  const timeStr = formatTime(entry.createdAt);

  item.innerHTML = `
    <div class="timeline-entry__marker">
      <div class="timeline-entry__icon">
        <span>${entryType?.icon || '📝'}</span>
      </div>
      <div class="timeline-entry__line"></div>
    </div>
    <div class="timeline-entry__card glass-card">
      <div class="timeline-entry__header">
        <span class="timeline-entry__type">${entryType?.label || 'Note'}</span>
        <time class="timeline-entry__time">${timeStr}</time>
      </div>
      <div class="timeline-entry__content">${highlightedContent}</div>
      <div class="timeline-entry__actions">
        <button class="timeline-entry__action" data-action="edit" aria-label="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="timeline-entry__action timeline-entry__action--delete" data-action="delete" aria-label="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  `;

  // Add action handlers
  if (onEdit) {
    item.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
      e.stopPropagation();
      onEdit(entry);
    });
  }

  if (onDelete) {
    item.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
      e.stopPropagation();
      onDelete(entry);
    });
  }

  return item;
}

// CSS for Timeline Entry (injected)
const styles = `
.timeline-entry {
  display: flex;
  gap: var(--space-4);
  position: relative;
}

.timeline-entry__marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.timeline-entry__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%);
  border: 2px solid var(--type-color, var(--accent-primary));
  box-shadow: 
    0 0 20px color-mix(in srgb, var(--type-color, var(--accent-primary)) 40%, transparent),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  font-size: 1.25rem;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  transition: all var(--transition-base);
}

.timeline-entry:hover .timeline-entry__icon {
  transform: scale(1.1);
  box-shadow: 
    0 0 30px color-mix(in srgb, var(--type-color, var(--accent-primary)) 60%, transparent),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.timeline-entry__line {
  width: 3px;
  flex: 1;
  min-height: var(--space-4);
  background: linear-gradient(to bottom, var(--type-color, var(--accent-primary)) 0%, rgba(99, 102, 241, 0.15) 100%);
  border-radius: 3px;
  margin-top: var(--space-2);
}

.timeline-entry--last .timeline-entry__line {
  display: none;
}

.timeline-entry__card {
  flex: 1;
  padding: var(--space-3);
  margin-bottom: var(--space-2);
}

.timeline-entry__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.timeline-entry__type {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.timeline-entry__time {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.timeline-entry__content {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  color: var(--text-secondary);
  word-break: break-word;
}

.timeline-entry__content .badge {
  display: inline;
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-xs);
  vertical-align: baseline;
}

.timeline-entry__actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--glass-border);
  height: 0;
  overflow: hidden;
  opacity: 0;
  transition: all var(--transition-fast);
}

.timeline-entry:hover .timeline-entry__actions,
.timeline-entry:focus-within .timeline-entry__actions {
  height: auto;
  padding-top: var(--space-2);
  margin-top: var(--space-2);
  opacity: 1;
}

@media (hover: none) {
  .timeline-entry__actions {
    height: auto;
    opacity: 1;
  }
}

.timeline-entry__action {
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

.timeline-entry__action:hover {
  background: var(--glass-bg-hover);
  color: var(--text-primary);
  border-color: var(--glass-border-hover);
}

.timeline-entry__action--delete:hover {
  color: var(--type-fear);
  border-color: var(--type-fear);
}

.timeline-entry__action:active {
  transform: scale(0.95);
}

.timeline-entry__action svg {
  width: 16px;
  height: 16px;
}
`;

// Inject styles
if (!document.getElementById('timeline-entry-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'timeline-entry-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
