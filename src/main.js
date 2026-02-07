/* ===========================================
   MAIN ENTRY POINT
   App initialization and routing
   =========================================== */

import './styles/design-system.css';
import './styles/animations.css';

import { router } from './router.js';
import { createTabBar } from './components/TabBar.js';
import { createMenuBar } from './components/MenuBar.js';
import { createWritePage } from './pages/Write.js';
import { createJournalPage } from './pages/Journal.js';
import { createAnalyticsPage } from './pages/Analytics.js';
import { createSearchPage } from './pages/Search.js';
import { createSettingsPage, applyTheme } from './pages/Settings.js';
import { createProfilePage } from './pages/Profile.js';
import { getSettings } from './data/store.js';

/**
 * Initialize the application
 */
async function init() {
    const app = document.getElementById('app');

    // Create page container
    const pageContainer = document.createElement('main');
    pageContainer.className = 'page-container';
    app.appendChild(pageContainer);

    // Add navigation components
    app.appendChild(createTabBar());
    app.appendChild(createMenuBar());

    // Register routes
    router.register('write', createWritePage);
    router.register('journal', createJournalPage);
    router.register('analytics', createAnalyticsPage);
    router.register('search', createSearchPage);
    router.register('settings', createSettingsPage);
    router.register('profile', createProfilePage);

    // Initialize router
    router.init(pageContainer);

    // Apply saved theme
    const settings = await getSettings();
    applyTheme(settings.theme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async () => {
        const currentSettings = await getSettings();
        if (currentSettings.theme === 'system') {
            applyTheme('system');
        }
    });

    // Register service worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => {
                // SW registration failed, app will work without offline support
            });
        });
    }
}

// Start the app
init();
