/* ===========================================
   ROUTER
   Simple hash-based routing
   =========================================== */

const routes = new Map();
let currentRoute = null;
let pageContainer = null;

/**
 * Router object with navigation methods
 */
export const router = {
    /**
     * Register a route
     * @param {string} path - Route path
     * @param {Function} handler - Route handler that returns HTMLElement
     */
    register(path, handler) {
        routes.set(path, handler);
    },

    /**
     * Navigate to a route
     * @param {string} path - Route path
     */
    navigate(path) {
        window.location.hash = path;
    },

    /**
     * Get current route
     * @returns {string} Current route path
     */
    getCurrentRoute() {
        return currentRoute;
    },

    /**
     * Initialize router
     * @param {HTMLElement} container - Page container element
     */
    init(container) {
        pageContainer = container;

        // Handle hash changes
        window.addEventListener('hashchange', () => {
            this.handleRoute();
        });

        // Handle initial route
        this.handleRoute();
    },

    /**
     * Handle current route
     */
    async handleRoute() {
        const hash = window.location.hash.slice(1) || 'journal';
        const handler = routes.get(hash);

        if (!handler) {
            // Default to journal if route not found
            this.navigate('journal');
            return;
        }

        // Exit animation for current page
        if (pageContainer.children.length > 0) {
            const currentPage = pageContainer.children[0];
            currentPage.classList.add('page-exit');
            await new Promise(r => setTimeout(r, 150));
            currentPage.remove();
        }

        // Get new page content
        const page = await handler();
        page.classList.add('page', 'page-enter');
        pageContainer.appendChild(page);

        currentRoute = hash;

        // Update tab bar active state
        import('./components/TabBar.js').then(({ updateActiveTab }) => {
            updateActiveTab(hash);
        });
    }
};
