/* ===========================================
   JOURNAL PAGE
   Timeline view of entries
   =========================================== */

import { getEntriesPaginated, deleteEntry, updateEntry } from '../data/store.js';
import { createTimelineEntry } from '../components/TimelineEntry.js';
import { showConfirm, showModal } from '../components/Modal.js';
import { getDateGroup } from '../utils/date.js';
import { createEditForm } from './EditEntry.js';

let currentPage = 0;
let isLoading = false;
let hasMore = true;

/**
 * Create the Journal page
 * @returns {HTMLElement} Journal page element
 */
export async function createJournalPage() {
  const page = document.createElement('div');
  page.className = 'journal-page';

  page.innerHTML = `
    <div class="journal-page__header">
      <h1 class="heading-2">Journal</h1>
    </div>
    <div class="journal-page__timeline" id="timeline"></div>
    <div class="journal-page__loader" id="loader" style="display: none;">
      <span class="spinner"></span>
    </div>
    <div class="journal-page__empty" id="empty-state" style="display: none;">
      <div class="empty-state glass-card">
        <span class="empty-state__icon">📝</span>
        <h3>No entries yet</h3>
        <p>Start writing to capture your thoughts</p>
      </div>
    </div>
  `;

  const timeline = page.querySelector('#timeline');
  const loader = page.querySelector('#loader');
  const emptyState = page.querySelector('#empty-state');

  // Reset pagination
  currentPage = 0;
  hasMore = true;

  // Load initial entries
  await loadEntries(timeline, loader, emptyState);

  // Infinite scroll
  const observer = new IntersectionObserver(async (entries) => {
    if (entries[0].isIntersecting && hasMore && !isLoading) {
      await loadEntries(timeline, loader, emptyState);
    }
  }, { threshold: 0.1 });

  observer.observe(loader);

  // Pull to refresh (simple implementation)
  let startY = 0;
  page.addEventListener('touchstart', (e) => {
    if (timeline.scrollTop === 0) {
      startY = e.touches[0].clientY;
    }
  });

  page.addEventListener('touchend', async (e) => {
    const endY = e.changedTouches[0].clientY;
    if (endY - startY > 100 && timeline.scrollTop === 0) {
      // Refresh
      currentPage = 0;
      hasMore = true;
      timeline.innerHTML = '';
      await loadEntries(timeline, loader, emptyState);
    }
  });

  return page;
}

/**
 * Load entries into timeline
 */
async function loadEntries(timeline, loader, emptyState) {
  if (isLoading || !hasMore) return;

  isLoading = true;
  loader.style.display = 'flex';

  try {
    const { entries, hasMore: more } = await getEntriesPaginated(currentPage, 20);
    hasMore = more;

    if (entries.length === 0 && currentPage === 0) {
      emptyState.style.display = 'flex';
      loader.style.display = 'none';
      isLoading = false;
      return;
    }

    emptyState.style.display = 'none';

    // Group entries by date
    const groups = groupEntriesByDate(entries);

    for (const [group, groupEntries] of Object.entries(groups)) {
      // Check if group header already exists
      let groupEl = timeline.querySelector(`[data-group="${group}"]`);

      if (!groupEl) {
        groupEl = document.createElement('div');
        groupEl.className = 'timeline-group';
        groupEl.dataset.group = group;
        groupEl.innerHTML = `
          <h3 class="timeline-group__header">${group}</h3>
          <div class="timeline-group__entries"></div>
        `;
        timeline.appendChild(groupEl);
      }

      const entriesContainer = groupEl.querySelector('.timeline-group__entries');
      const totalInGroup = groupEntries.length;

      for (let i = 0; i < groupEntries.length; i++) {
        const entry = groupEntries[i];
        const isLast = i === totalInGroup - 1;
        const timelineEntry = await createTimelineEntry(entry, {
          isLast,
          onEdit: (e) => handleEdit(e, timeline, loader, emptyState),
          onDelete: (e) => handleDelete(e, timeline, loader, emptyState)
        });
        timelineEntry.classList.add('animate-fade-in-up');
        entriesContainer.appendChild(timelineEntry);
      }
    }

    currentPage++;
  } catch (error) {
    console.error('Failed to load entries:', error);
  } finally {
    isLoading = false;
    loader.style.display = hasMore ? 'flex' : 'none';
  }
}

/**
 * Group entries by date group
 */
function groupEntriesByDate(entries) {
  const groups = {};

  entries.forEach(entry => {
    const group = getDateGroup(entry.createdAt);
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(entry);
  });

  return groups;
}

/**
 * Handle entry edit
 */
async function handleEdit(entry, timeline, loader, emptyState) {
  const form = await createEditForm(entry);

  await showModal({
    title: 'Edit Entry',
    content: form.element,
    onClose: async (result) => {
      if (result) {
        // Refresh timeline
        currentPage = 0;
        hasMore = true;
        timeline.innerHTML = '';
        await loadEntries(timeline, loader, emptyState);
      }
    }
  });
}

/**
 * Handle entry delete
 */
async function handleDelete(entry, timeline, loader, emptyState) {
  const confirmed = await showConfirm({
    title: 'Delete Entry',
    message: 'Are you sure you want to delete this entry? This cannot be undone.',
    confirmText: 'Delete',
    isDanger: true
  });

  if (confirmed) {
    await deleteEntry(entry.id);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Remove card from DOM
    const card = timeline.querySelector(`[data-entry-id="${entry.id}"]`);
    if (card) {
      card.style.transform = 'translateX(-100%)';
      card.style.opacity = '0';
      setTimeout(() => {
        card.remove();

        // Check if group is now empty
        const groups = timeline.querySelectorAll('.timeline-group');
        groups.forEach(group => {
          if (group.querySelector('.timeline-group__entries').children.length === 0) {
            group.remove();
          }
        });

        // Check if timeline is now empty
        if (timeline.children.length === 0) {
          emptyState.style.display = 'flex';
        }
      }, 200);
    }
  }
}

// CSS for Journal Page (injected)
const styles = `
.journal-page {
  display: flex;
  flex-direction: column;
  padding: var(--space-4);
}

.journal-page__header {
  text-align: center;
  margin-bottom: var(--space-6);
}

.journal-page__timeline {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.journal-page__loader {
  display: flex;
  justify-content: center;
  padding: var(--space-8);
}

.journal-page__empty {
  display: flex;
  justify-content: center;
  padding: var(--space-8);
}

.empty-state {
  text-align: center;
  padding: var(--space-8);
}

.empty-state__icon {
  font-size: 3rem;
  display: block;
  margin-bottom: var(--space-4);
}

.empty-state h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-2);
}

.empty-state p {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.timeline-group {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--space-4);
}

.timeline-group__header {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: center;
  margin-bottom: var(--space-4);
  padding: var(--space-2) var(--space-4);
  background: var(--glass-bg);
  border-radius: var(--radius-full);
  display: inline-block;
  align-self: center;
}

.timeline-group__entries {
  display: flex;
  flex-direction: column;
}
`;

// Inject styles
if (!document.getElementById('journal-page-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'journal-page-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
