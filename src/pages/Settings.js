/* ===========================================
   SETTINGS PAGE
   Theme and custom entry type management
   =========================================== */

import { getSettings, updateSettings, getAllEntryTypes, addCustomType, deleteCustomType } from '../data/store.js';
import { SYSTEM_ENTRY_TYPES } from '../data/models.js';
import { showModal, showConfirm } from '../components/Modal.js';
import { router } from '../router.js';

/**
 * Create the Settings page
 * @returns {HTMLElement} Settings page element
 */
export async function createSettingsPage() {
  const page = document.createElement('div');
  page.className = 'settings-page';

  const settings = await getSettings();
  const entryTypes = await getAllEntryTypes();
  const customTypes = entryTypes.filter(t => !t.isSystem);

  page.innerHTML = `
    <div class="settings-page__header">
      <button class="settings-page__back glass-button" id="back-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back
      </button>
      <h1 class="heading-2">Settings</h1>
    </div>
    
    <div class="settings-page__content stagger-children">
      <section class="settings-section glass-card">
        <h3 class="settings-section__title">Appearance</h3>
        <div class="settings-option">
          <span class="settings-option__label">Theme</span>
          <div class="theme-picker" id="theme-picker">
            <button class="theme-picker__option ${settings.theme === 'light' ? 'theme-picker__option--active' : ''}" data-theme="light">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              Light
            </button>
            <button class="theme-picker__option ${settings.theme === 'dark' ? 'theme-picker__option--active' : ''}" data-theme="dark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              Dark
            </button>
            <button class="theme-picker__option ${settings.theme === 'system' ? 'theme-picker__option--active' : ''}" data-theme="system">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              System
            </button>
          </div>
        </div>
      </section>
      
      <section class="settings-section glass-card">
        <div class="settings-section__header">
          <h3 class="settings-section__title">Entry Types</h3>
          <button class="glass-button" id="add-type-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add
          </button>
        </div>
        
        <div class="entry-types-list" id="entry-types-list">
          ${SYSTEM_ENTRY_TYPES.map(type => `
            <div class="entry-type-item">
              <span class="entry-type-item__icon">${type.icon}</span>
              <span class="entry-type-item__label">${type.label}</span>
              <span class="entry-type-item__badge">System</span>
            </div>
          `).join('')}
          ${customTypes.map(type => `
            <div class="entry-type-item entry-type-item--custom" data-type-id="${type.id}">
              <span class="entry-type-item__icon">${type.icon}</span>
              <span class="entry-type-item__label">${type.label}</span>
              <button class="entry-type-item__delete" data-type-id="${type.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          `).join('')}
        </div>
      </section>
      
      <section class="settings-section glass-card">
        <h3 class="settings-section__title">About</h3>
        <p class="text-secondary" style="font-size: var(--font-size-sm);">
          Liquid Glass Journal v1.0.0<br>
          A beautiful notes app with iOS 26-inspired design.
        </p>
      </section>
    </div>
  `;

  // Back button
  page.querySelector('#back-btn').addEventListener('click', () => {
    router.navigate('journal');
  });

  // Theme picker
  page.querySelector('#theme-picker').addEventListener('click', async (e) => {
    const option = e.target.closest('.theme-picker__option');
    if (!option) return;

    const theme = option.dataset.theme;
    await updateSettings({ theme });
    applyTheme(theme);

    // Update UI
    page.querySelectorAll('.theme-picker__option').forEach(btn => {
      btn.classList.toggle('theme-picker__option--active', btn.dataset.theme === theme);
    });

    // Haptic
    if (navigator.vibrate) navigator.vibrate(10);
  });

  // Add custom type
  page.querySelector('#add-type-btn').addEventListener('click', async () => {
    const form = createTypeForm();
    await showModal({
      title: 'New Entry Type',
      content: form.element
    });
  });

  // Delete custom types
  page.querySelectorAll('.entry-type-item__delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const confirmed = await showConfirm({
        title: 'Delete Entry Type',
        message: 'Are you sure? Existing entries will keep this type but it won\'t be available for new entries.',
        confirmText: 'Delete',
        isDanger: true
      });

      if (confirmed) {
        await deleteCustomType(btn.dataset.typeId);
        btn.closest('.entry-type-item').remove();
        if (navigator.vibrate) navigator.vibrate(50);
      }
    });
  });

  return page;
}

/**
 * Apply theme to document
 */
export function applyTheme(theme) {
  const isDark = theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  document.documentElement.classList.toggle('light-theme', !isDark);
}

/**
 * Create entry type form
 */
function createTypeForm() {
  const form = document.createElement('form');
  form.className = 'type-form';

  const colors = ['#a78bfa', '#fbbf24', '#38bdf8', '#f87171', '#34d399', '#fb923c', '#ec4899', '#8b5cf6'];
  const icons = ['✨', '🎯', '💫', '🌟', '🔥', '💎', '🌈', '🎨', '🎭', '🎪', '🎢', '🎡'];

  form.innerHTML = `
    <div class="type-form__field">
      <label>Label</label>
      <input type="text" class="glass-input" id="type-label" placeholder="e.g., Gratitude" required />
    </div>
    
    <div class="type-form__field">
      <label>Icon</label>
      <div class="type-form__icons" id="icon-picker">
        ${icons.map((icon, i) => `
          <button type="button" class="type-form__icon ${i === 0 ? 'type-form__icon--selected' : ''}" data-icon="${icon}">${icon}</button>
        `).join('')}
      </div>
    </div>
    
    <div class="type-form__field">
      <label>Color</label>
      <div class="type-form__colors" id="color-picker">
        ${colors.map((color, i) => `
          <button type="button" class="type-form__color ${i === 0 ? 'type-form__color--selected' : ''}" data-color="${color}" style="background: ${color}"></button>
        `).join('')}
      </div>
    </div>
    
    <div class="type-form__field">
      <label>Prompt (optional)</label>
      <input type="text" class="glass-input" id="type-prompt" placeholder="What would you like to write?" />
    </div>
    
    <button type="submit" class="glass-button glass-button--primary type-form__submit">
      Create Type
    </button>
  `;

  let selectedIcon = icons[0];
  let selectedColor = colors[0];

  // Icon picker
  form.querySelector('#icon-picker').addEventListener('click', (e) => {
    const btn = e.target.closest('.type-form__icon');
    if (!btn) return;

    form.querySelectorAll('.type-form__icon').forEach(b => b.classList.remove('type-form__icon--selected'));
    btn.classList.add('type-form__icon--selected');
    selectedIcon = btn.dataset.icon;
  });

  // Color picker
  form.querySelector('#color-picker').addEventListener('click', (e) => {
    const btn = e.target.closest('.type-form__color');
    if (!btn) return;

    form.querySelectorAll('.type-form__color').forEach(b => b.classList.remove('type-form__color--selected'));
    btn.classList.add('type-form__color--selected');
    selectedColor = btn.dataset.color;
  });

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const label = form.querySelector('#type-label').value.trim();
    const prompt = form.querySelector('#type-prompt').value.trim();

    if (!label) return;

    await addCustomType({
      name: label.toLowerCase().replace(/\s+/g, '-'),
      label,
      icon: selectedIcon,
      color: selectedColor,
      prompt: prompt || `Write a ${label.toLowerCase()}...`
    });

    // Close modal
    const modal = form.closest('.modal');
    if (modal && modal.close) {
      modal.close(true);
    }

    // Refresh settings page
    router.navigate('settings');
  });

  return { element: form };
}

// CSS for Settings Page (injected)
const styles = `
.settings-page {
  padding: var(--space-4);

}

.settings-page__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.settings-page__back {
  padding: var(--space-2) var(--space-3);
}

.settings-page__back svg {
  width: 18px;
  height: 18px;
}

.settings-page__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.settings-section {
  padding: var(--space-4);
}

.settings-section__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.settings-section__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
}

.settings-section__header .settings-section__title {
  margin-bottom: 0;
}

.settings-option {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.settings-option__label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.theme-picker {
  display: flex;
  gap: var(--space-2);
}

.theme-picker__option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  font-family: var(--font-family);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.theme-picker__option:hover {
  background: var(--glass-bg-hover);
}

.theme-picker__option--active {
  background: var(--accent-gradient);
  border-color: transparent;
  color: var(--text-primary);
}

.theme-picker__option svg {
  width: 20px;
  height: 20px;
}

.entry-types-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.entry-type-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--glass-bg);
  border-radius: var(--radius-md);
}

.entry-type-item__icon {
  font-size: var(--font-size-xl);
}

.entry-type-item__label {
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.entry-type-item__badge {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  padding: var(--space-1) var(--space-2);
  background: var(--glass-bg);
  border-radius: var(--radius-full);
}

.entry-type-item__delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.entry-type-item__delete:hover {
  background: rgba(248, 113, 113, 0.2);
  color: var(--type-fear);
}

.entry-type-item__delete svg {
  width: 16px;
  height: 16px;
}

/* Type Form */
.type-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.type-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.type-form__field label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.type-form__icons,
.type-form__colors {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.type-form__icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xl);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.type-form__icon:hover {
  background: var(--glass-bg-hover);
}

.type-form__icon--selected {
  border-color: var(--accent-primary);
  background: rgba(99, 102, 241, 0.2);
}

.type-form__color {
  width: 32px;
  height: 32px;
  border: 2px solid transparent;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.type-form__color:hover {
  transform: scale(1.1);
}

.type-form__color--selected {
  border-color: white;
  transform: scale(1.1);
}

.type-form__submit {
  align-self: flex-end;
  margin-top: var(--space-2);
}

/* Light theme overrides */
.light-theme {
  --color-bg-primary: #f5f5f7;
  --color-bg-secondary: #ffffff;
  --color-bg-gradient: linear-gradient(135deg, #f5f5f7 0%, #e5e5ea 50%, #f5f5f7 100%);
  --glass-bg: rgba(0, 0, 0, 0.03);
  --glass-bg-hover: rgba(0, 0, 0, 0.06);
  --glass-bg-active: rgba(0, 0, 0, 0.1);
  --glass-border: rgba(0, 0, 0, 0.08);
  --glass-border-hover: rgba(0, 0, 0, 0.15);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  --text-primary: rgba(0, 0, 0, 0.9);
  --text-secondary: rgba(0, 0, 0, 0.6);
  --text-tertiary: rgba(0, 0, 0, 0.4);
  --text-muted: rgba(0, 0, 0, 0.3);
}
`;

// Inject styles
if (!document.getElementById('settings-page-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'settings-page-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
