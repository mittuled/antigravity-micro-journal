/* ===========================================
   ANALYTICS PAGE
   Activity graph and statistics
   =========================================== */

import { getActivityData, getStats, getEntriesByType, getAllEntryTypes } from '../data/store.js';
import { getMonthName } from '../utils/date.js';

/**
 * Create the Analytics page
 * @returns {HTMLElement} Analytics page element
 */
export async function createAnalyticsPage() {
  const page = document.createElement('div');
  page.className = 'analytics-page';

  page.innerHTML = `
    <div class="analytics-page__header">
      <h1 class="heading-2">Analytics</h1>
    </div>
    
    <div class="analytics-page__content stagger-children">
      <section class="activity-section glass-card">
        <h3 class="section-title">Activity</h3>
        <div class="activity-graph" id="activity-graph"></div>
        <div class="activity-stats" id="activity-stats"></div>
      </section>
      
      <section class="stats-grid" id="stats-grid"></section>
      
      <section class="breakdown-section glass-card">
        <h3 class="section-title">Entry Breakdown</h3>
        <div class="breakdown-list" id="breakdown-list"></div>
      </section>
    </div>
  `;

  // Load activity graph
  try {
    await renderActivityGraph(page.querySelector('#activity-graph'), page.querySelector('#activity-stats'));
  } catch (err) {
    console.error('Failed to render activity graph:', err);
    page.querySelector('#activity-graph').innerHTML = `<p class="error-text">Failed to load graph: ${err.message}</p>`;
  }

  // Load stats
  try {
    await renderStats(page.querySelector('#stats-grid'));
  } catch (err) {
    console.error('Failed to render stats:', err);
  }

  // Load breakdown
  try {
    await renderBreakdown(page.querySelector('#breakdown-list'));
  } catch (err) {
    console.error('Failed to render breakdown:', err);
  }

  return page;
}

/**
 * Render GitHub-style activity graph
 */
async function renderActivityGraph(graphEl, statsEl) {
  const { data, totalEntries, activeDays } = await getActivityData(17);

  // Group by weeks
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  // Get month labels
  const months = [];
  let lastMonth = '';
  weeks.forEach((week, i) => {
    const monthName = getMonthName(week[0].date);
    if (monthName !== lastMonth) {
      months.push({ name: monthName, index: i });
      lastMonth = monthName;
    }
  });

  // Build graph HTML
  graphEl.innerHTML = `
    <div class="activity-graph__months">
      ${months.map(m => `<span style="grid-column: ${m.index + 2}">${m.name}</span>`).join('')}
    </div>
    <div class="activity-graph__grid">
      <div class="activity-graph__days">
        <span></span>
        <span>Mon</span>
        <span></span>
        <span>Wed</span>
        <span></span>
        <span>Fri</span>
        <span></span>
      </div>
      <div class="activity-graph__cells">
        ${weeks.map(week => `
          <div class="activity-graph__week">
            ${week.map(day => `
              <div class="activity-graph__cell activity-cell" 
                   data-count="${day.count}"
                   data-level="${getLevel(day.count)}"
                   title="${day.date}: ${day.count} entries">
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    </div>
    <div class="activity-graph__legend">
      <span>Less</span>
      <div class="activity-graph__cell" data-level="0"></div>
      <div class="activity-graph__cell" data-level="1"></div>
      <div class="activity-graph__cell" data-level="2"></div>
      <div class="activity-graph__cell" data-level="3"></div>
      <div class="activity-graph__cell" data-level="4"></div>
      <span>More</span>
    </div>
  `;

  // Stats
  statsEl.innerHTML = `
    <span><strong>${totalEntries}</strong> entries</span>
    <span><strong>${activeDays}</strong> active days</span>
  `;
}

/**
 * Get intensity level (0-4)
 */
function getLevel(count) {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

/**
 * Render statistics cards
 */
async function renderStats(container) {
  const stats = await getStats();

  container.innerHTML = `
    <div class="stat-card glass-card">
      <span class="stat-card__value">${stats.totalEntries}</span>
      <span class="stat-card__label">Total Entries</span>
    </div>
    <div class="stat-card glass-card">
      <span class="stat-card__value">${stats.typesUsed}</span>
      <span class="stat-card__label">Types Used</span>
    </div>
    <div class="stat-card glass-card">
      <span class="stat-card__icon">${stats.mostUsedType?.icon || '📝'}</span>
      <span class="stat-card__label">Most Used: ${stats.mostUsedType?.label || 'None'}</span>
    </div>
  `;
}

/**
 * Render entry type breakdown
 */
async function renderBreakdown(container) {
  const byType = await getEntriesByType();
  const allTypes = await getAllEntryTypes();
  const total = byType.reduce((sum, t) => sum + t.count, 0);

  if (byType.length === 0) {
    container.innerHTML = `
      <p class="text-secondary">No entries to analyze yet</p>
    `;
    return;
  }

  container.innerHTML = byType.map(item => {
    const type = allTypes.find(t => t.id === item.typeId);
    const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;

    return `
      <div class="breakdown-item">
        <div class="breakdown-item__header">
          <span class="breakdown-item__type">
            <span class="breakdown-item__icon">${type?.icon || '📝'}</span>
            ${type?.label || 'Unknown'}
          </span>
          <span class="breakdown-item__count">${item.count}</span>
        </div>
        <div class="breakdown-item__bar">
          <div class="breakdown-item__fill" style="width: ${percentage}%; background: ${type?.color || 'var(--type-note)'}"></div>
        </div>
        <span class="breakdown-item__percentage">${percentage}%</span>
      </div>
    `;
  }).join('');
}

// CSS for Analytics Page (injected)
const styles = `
.analytics-page {
  padding: var(--space-4);
}

.analytics-page__header {
  text-align: center;
  margin-bottom: var(--space-6);
}

.analytics-page__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
}

/* Activity Graph */
.activity-section {
  padding: var(--space-4);
  overflow-x: auto;
}

.activity-graph {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.activity-graph__months {
  display: grid;
  grid-template-columns: 30px repeat(17, 12px);
  gap: 3px;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  padding-left: 2px;
}

.activity-graph__grid {
  display: flex;
  gap: var(--space-2);
}

.activity-graph__days {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 9px;
  color: var(--text-muted);
  width: 30px;
}

.activity-graph__days span {
  height: 12px;
  display: flex;
  align-items: center;
}

.activity-graph__cells {
  display: flex;
  gap: 3px;
}

.activity-graph__week {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.activity-graph__cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
}

.activity-graph__cell[data-level="1"] { background: var(--accent-primary-alpha-30); border-color: rgba(99, 102, 241, 0.4); }
.activity-graph__cell[data-level="2"] { background: rgba(99, 102, 241, 0.5); border-color: rgba(99, 102, 241, 0.6); }
.activity-graph__cell[data-level="3"] { background: rgba(99, 102, 241, 0.7); border-color: rgba(99, 102, 241, 0.8); }
.activity-graph__cell[data-level="4"] { background: rgba(99, 102, 241, 0.9); border-color: var(--accent-primary); }

.activity-graph__legend {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-top: var(--space-3);
  justify-content: flex-end;
}

.activity-stats {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--glass-border);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.activity-stats strong {
  color: var(--text-primary);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

.stat-card {
  padding: var(--space-4);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.stat-card__value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.stat-card__icon {
  font-size: var(--font-size-2xl);
}

.stat-card__label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

/* Breakdown */
.breakdown-section {
  padding: var(--space-4);
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.breakdown-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breakdown-item__type {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.breakdown-item__icon {
  font-size: var(--font-size-lg);
}

.breakdown-item__count {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.breakdown-item__bar {
  height: 8px;
  background: var(--glass-bg);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.breakdown-item__fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

.breakdown-item__percentage {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  align-self: flex-end;
}
`;

// Inject styles
if (!document.getElementById('analytics-page-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'analytics-page-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
