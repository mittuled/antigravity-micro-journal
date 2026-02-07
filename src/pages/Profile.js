/* ===========================================
   PROFILE PAGE
   User profile display
   =========================================== */

import { getStats, getAllEntries } from '../data/store.js';
import { router } from '../router.js';

/**
 * Create the Profile page
 * @returns {HTMLElement} Profile page element
 */
export async function createProfilePage() {
    const page = document.createElement('div');
    page.className = 'profile-page';

    const stats = await getStats();
    const entries = await getAllEntries();

    // Calculate streak
    const streak = calculateStreak(entries);

    page.innerHTML = `
    <div class="profile-page__header">
      <button class="profile-page__back glass-button" id="back-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back
      </button>
      <h1 class="heading-2">Profile</h1>
    </div>
    
    <div class="profile-page__content">
      <div class="profile-avatar glass-card">
        <span class="profile-avatar__icon">📝</span>
        <h2 class="profile-avatar__name">Journal User</h2>
        <p class="profile-avatar__subtitle">Your private journal</p>
      </div>
      
      <div class="profile-stats">
        <div class="profile-stat glass-card">
          <span class="profile-stat__value">${stats.totalEntries}</span>
          <span class="profile-stat__label">Entries</span>
        </div>
        <div class="profile-stat glass-card">
          <span class="profile-stat__value">${streak}</span>
          <span class="profile-stat__label">Day Streak</span>
        </div>
        <div class="profile-stat glass-card">
          <span class="profile-stat__value">${stats.typesUsed}</span>
          <span class="profile-stat__label">Types Used</span>
        </div>
      </div>
      
      <section class="profile-section glass-card">
        <h3 class="profile-section__title">About</h3>
        <p class="text-secondary">
          All your data is stored locally on this device. 
          No accounts, no cloud, fully private.
        </p>
      </section>
    </div>
  `;

    // Back button
    page.querySelector('#back-btn').addEventListener('click', () => {
        router.navigate('journal');
    });

    return page;
}

/**
 * Calculate current streak
 */
function calculateStreak(entries) {
    if (entries.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = entries.map(e => {
        const d = new Date(e.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    });

    const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);

    let streak = 0;
    let checkDate = today.getTime();

    for (const date of uniqueDates) {
        if (date === checkDate) {
            streak++;
            checkDate -= 24 * 60 * 60 * 1000;
        } else if (date < checkDate) {
            // Check if it's yesterday (allow gap of one day from today)
            if (streak === 0 && date === today.getTime() - 24 * 60 * 60 * 1000) {
                streak = 1;
                checkDate = date - 24 * 60 * 60 * 1000;
            } else {
                break;
            }
        }
    }

    return streak;
}

// CSS for Profile Page (injected)
const styles = `
.profile-page {
  padding: var(--space-4);
}

.profile-page__header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.profile-page__back svg {
  width: 18px;
  height: 18px;
}

.profile-page__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.profile-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-8);
  text-align: center;
}

.profile-avatar__icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
}

.profile-avatar__name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-1);
}

.profile-avatar__subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

.profile-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-4);
  text-align: center;
}

.profile-stat__value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.profile-stat__label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.profile-section {
  padding: var(--space-4);
}

.profile-section__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
}

.profile-section p {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}
`;

// Inject styles
if (!document.getElementById('profile-page-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'profile-page-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}
