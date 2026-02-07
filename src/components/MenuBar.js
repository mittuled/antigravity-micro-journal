/* ===========================================
   FLOATING MENU BAR COMPONENT
   Top-left menu with profile and settings
   =========================================== */

import { router } from '../router.js';

/**
 * Create the floating menu bar
 * @returns {HTMLElement} Menu bar element
 */
export function createMenuBar() {
  const menuBar = document.createElement('header');
  menuBar.className = 'menu-bar';
  menuBar.innerHTML = `
    <button class="menu-bar__trigger" aria-label="Menu" aria-expanded="false">
      <svg class="menu-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    </button>
    <div class="menu-bar__dropdown">
      <button class="menu-bar__item" data-action="profile">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>Profile</span>
      </button>
      <button class="menu-bar__item" data-action="settings">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <span>Settings</span>
      </button>
    </div>
  `;

  const trigger = menuBar.querySelector('.menu-bar__trigger');
  const dropdown = menuBar.querySelector('.menu-bar__dropdown');

  // Toggle dropdown
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('menu-bar__dropdown--open');
    trigger.setAttribute('aria-expanded', isOpen);
    triggerHaptic();
  });

  // Close on outside click
  document.addEventListener('click', () => {
    dropdown.classList.remove('menu-bar__dropdown--open');
    trigger.setAttribute('aria-expanded', 'false');
  });

  // Handle menu items
  menuBar.querySelectorAll('.menu-bar__item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      dropdown.classList.remove('menu-bar__dropdown--open');
      trigger.setAttribute('aria-expanded', 'false');

      if (action === 'settings') {
        router.navigate('settings');
      } else if (action === 'profile') {
        router.navigate('profile');
      }
      triggerHaptic();
    });
  });

  // Hide menu bar on settings/profile pages
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    menuBar.style.display = (hash === 'settings' || hash === 'profile') ? 'none' : 'block';
  });

  // Initial check
  const initialHash = window.location.hash.slice(1);
  menuBar.style.display = (initialHash === 'settings' || initialHash === 'profile') ? 'none' : 'block';

  return menuBar;
}

/**
 * Trigger haptic feedback
 */
function triggerHaptic() {
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}

// CSS for MenuBar (injected)
const styles = `
.menu-bar {
  position: fixed;
  top: var(--space-4);
  left: var(--space-4);
  z-index: 50;
  padding-top: var(--safe-area-top);
  pointer-events: none;
}

.menu-bar__trigger {
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur-strong));
  -webkit-backdrop-filter: blur(var(--glass-blur-strong));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--glass-shadow);
}

.menu-bar__trigger:hover {
  color: var(--text-primary);
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
}

.menu-bar__trigger:active {
  transform: scale(0.95);
}

.menu-bar__icon {
  width: 20px;
  height: 20px;
}

.menu-bar__dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  left: 0;
  min-width: 160px;
  padding: var(--space-2);
  background: var(--bg-dropdown);
  backdrop-filter: blur(var(--glass-blur-strong));
  -webkit-backdrop-filter: blur(var(--glass-blur-strong));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow-lg);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px) scale(0.95);
  transition: all var(--transition-base);
  pointer-events: auto;
}

.menu-bar__dropdown--open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.menu-bar__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.menu-bar__item:hover {
  background: var(--glass-bg-hover);
  color: var(--text-primary);
}

.menu-bar__item:active {
  background: var(--glass-bg-active);
}

.menu-bar__item svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
`;

// Inject styles
if (!document.getElementById('menu-bar-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'menu-bar-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
