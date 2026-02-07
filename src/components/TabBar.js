/* ===========================================
   FLOATING TAB BAR COMPONENT
   iOS-style bottom navigation with glass effect
   =========================================== */

import { router } from '../router.js';

/**
 * Create the floating tab bar
 * @returns {HTMLElement} Tab bar element
 */
export function createTabBar() {
    const tabBar = document.createElement('nav');
    tabBar.className = 'tab-bar';
    tabBar.innerHTML = `
    <div class="tab-bar__container">
      <button class="tab-bar__item" data-route="write" aria-label="Write">
        <svg class="tab-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        <span class="tab-bar__label">Write</span>
      </button>
      <button class="tab-bar__item" data-route="journal" aria-label="Journal">
        <svg class="tab-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        <span class="tab-bar__label">Journal</span>
      </button>
      <button class="tab-bar__item" data-route="analytics" aria-label="Analytics">
        <svg class="tab-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 20V10"/>
          <path d="M12 20V4"/>
          <path d="M6 20v-6"/>
        </svg>
        <span class="tab-bar__label">Analytics</span>
      </button>
      <button class="tab-bar__item tab-bar__item--search" data-route="search" aria-label="Search">
        <svg class="tab-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </button>
    </div>
  `;

    // Add click handlers
    tabBar.querySelectorAll('.tab-bar__item').forEach(item => {
        item.addEventListener('click', () => {
            const route = item.dataset.route;
            router.navigate(route);
            triggerHaptic();
        });
    });

    return tabBar;
}

/**
 * Update active tab state
 * @param {string} activeRoute - Current route name
 */
export function updateActiveTab(activeRoute) {
    const tabBar = document.querySelector('.tab-bar');
    if (!tabBar) return;

    tabBar.querySelectorAll('.tab-bar__item').forEach(item => {
        const isActive = item.dataset.route === activeRoute;
        item.classList.toggle('tab-bar__item--active', isActive);
    });
}

/**
 * Trigger haptic feedback
 */
function triggerHaptic() {
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
}

// CSS for TabBar (injected)
const styles = `
.tab-bar {
  position: fixed;
  bottom: var(--space-6);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-dropdown);
  padding-bottom: var(--safe-area-bottom);
}

.tab-bar__container {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur-strong));
  -webkit-backdrop-filter: blur(var(--glass-blur-strong));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-2xl);
  box-shadow: var(--glass-shadow-lg);
}

.tab-bar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-4);
  background: transparent;
  border: none;
  border-radius: var(--radius-xl);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.tab-bar__item--search {
  padding: var(--space-2) var(--space-3);
}

.tab-bar__item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent-gradient);
  opacity: 0;
  border-radius: inherit;
  transition: opacity var(--transition-base);
}

.tab-bar__item--active::before {
  opacity: 1;
}

.tab-bar__item--active {
  color: var(--text-primary);
}

.tab-bar__item:not(.tab-bar__item--active):hover {
  color: var(--text-secondary);
  background: var(--glass-bg-hover);
}

.tab-bar__item:active {
  transform: scale(0.95);
}

.tab-bar__icon {
  width: 22px;
  height: 22px;
  position: relative;
  z-index: 1;
}

.tab-bar__label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  position: relative;
  z-index: 1;
}

.tab-bar__item--search .tab-bar__label {
  display: none;
}
`;

// Inject styles
if (!document.getElementById('tab-bar-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'tab-bar-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}
