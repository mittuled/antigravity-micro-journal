/* ===========================================
   WRITE PAGE
   Entry creation with type picker
   =========================================== */

import { getAllEntryTypes, addEntry } from '../data/store.js';
import { showActionSheet } from '../components/ActionSheet.js';
import { router } from '../router.js';

let selectedType = 'note';

/**
 * Create the Write page
 * @returns {HTMLElement} Write page element
 */
export async function createWritePage() {
  const page = document.createElement('div');
  page.className = 'write-page';

  const entryTypes = await getAllEntryTypes();
  const currentType = entryTypes.find(t => t.id === selectedType) || entryTypes[0];

  page.innerHTML = `
    <div class="write-page__header">
      <h1 class="heading-2">New Entry</h1>
      <p class="text-secondary">What's on your mind?</p>
    </div>
    
    <div class="write-page__spacer"></div>
    
    <div class="write-page__editor">
      <textarea 
        class="write-page__input glass-input" 
        id="entry-content"
        placeholder="${currentType.prompt}"
        rows="4"
      ></textarea>
      
      <div class="write-page__actions">
        <button class="write-page__type-picker glass-card" id="type-picker">
          <span class="write-page__type-icon">${currentType.icon}</span>
          <span class="write-page__type-label">${currentType.label}</span>
          <svg class="write-page__type-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <button class="write-page__submit glass-button glass-button--primary" id="submit-entry">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 2L11 13"/>
            <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
          Save Entry
        </button>
      </div>
    </div>
  `;

  // Type picker
  const typePicker = page.querySelector('#type-picker');
  typePicker.addEventListener('click', async () => {
    const types = await getAllEntryTypes();
    const options = types.map(t => ({
      value: t.id,
      label: t.label,
      icon: t.icon
    }));

    const selected = await showActionSheet({
      title: 'Entry Type',
      options,
      selectedValue: selectedType
    });

    if (selected) {
      selectedType = selected;
      const newType = types.find(t => t.id === selected);
      typePicker.querySelector('.write-page__type-icon').textContent = newType.icon;
      typePicker.querySelector('.write-page__type-label').textContent = newType.label;
      page.querySelector('#entry-content').placeholder = newType.prompt;
    }
  });

  // Submit entry
  const submitBtn = page.querySelector('#submit-entry');
  const contentInput = page.querySelector('#entry-content');

  submitBtn.addEventListener('click', async () => {
    const content = contentInput.value.trim();

    if (!content) {
      // Shake animation for empty content
      contentInput.classList.add('shake');
      setTimeout(() => contentInput.classList.remove('shake'), 500);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="spinner"></span>
      Saving...
    `;

    try {
      await addEntry({ content, typeId: selectedType });

      // Success feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }

      // Reset form
      contentInput.value = '';

      // Navigate to journal
      router.navigate('journal');
    } catch (error) {
      console.error('Failed to save entry:', error);
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 2L11 13"/>
          <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
        </svg>
        Save Entry
      `;
    }
  });

  return page;
}

// CSS for Write Page (injected)
const styles = `
.write-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: var(--space-4);
}

.write-page__header {
  text-align: center;
  padding: 0 0 var(--space-8) 0;
}

.write-page__header h1 {
  margin-bottom: var(--space-2);
}

.write-page__spacer {
  flex: 2;
  min-height: 30vh;
}

.write-page__editor {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding-bottom: var(--space-4);
}

.write-page__actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
}

.write-page__type-picker {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  border: none;
  background: var(--glass-bg);
  color: var(--text-primary);
  /* Ensure it doesn't shrink too small */
  flex-shrink: 0;
}

.write-page__type-icon {
  font-size: var(--font-size-xl);
}

.write-page__type-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.write-page__type-chevron {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
}

.write-page__input {
  min-height: 120px;
}

.write-page__submit {
  align-self: unset;
}

.write-page__submit svg {
  width: 18px;
  height: 18px;
}

/* Shake animation for errors */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

.shake {
  animation: shake 0.5s ease-in-out;
  border-color: var(--type-fear) !important;
}

/* Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
`;

// Inject styles
if (!document.getElementById('write-page-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'write-page-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
