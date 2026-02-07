/* ===========================================
   EDIT ENTRY FORM
   Form for editing existing entries
   =========================================== */

import { getAllEntryTypes, updateEntry } from '../data/store.js';
import { showActionSheet } from '../components/ActionSheet.js';

/**
 * Create the edit entry form
 * @param {Object} entry - Entry to edit
 * @returns {Object} Form element and close function
 */
export async function createEditForm(entry) {
    const form = document.createElement('form');
    form.className = 'edit-form';

    const entryTypes = await getAllEntryTypes();
    const currentType = entryTypes.find(t => t.id === entry.typeId) || entryTypes[0];
    let selectedTypeId = entry.typeId;

    form.innerHTML = `
    <button type="button" class="edit-form__type-picker glass-card" id="edit-type-picker">
      <span class="edit-form__type-icon">${currentType.icon}</span>
      <span class="edit-form__type-label">${currentType.label}</span>
      <svg class="edit-form__type-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
    
    <textarea 
      class="edit-form__input glass-input" 
      id="edit-content"
      rows="6"
    >${entry.content}</textarea>
    
    <button type="submit" class="edit-form__submit glass-button glass-button--primary">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Save Changes
    </button>
  `;

    // Type picker
    const typePicker = form.querySelector('#edit-type-picker');
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
            selectedValue: selectedTypeId
        });

        if (selected) {
            selectedTypeId = selected;
            const newType = types.find(t => t.id === selected);
            typePicker.querySelector('.edit-form__type-icon').textContent = newType.icon;
            typePicker.querySelector('.edit-form__type-label').textContent = newType.label;
        }
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const content = form.querySelector('#edit-content').value.trim();
        if (!content) return;

        const submitBtn = form.querySelector('.edit-form__submit');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Saving...';

        try {
            await updateEntry(entry.id, {
                content,
                typeId: selectedTypeId
            });

            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate([50, 50, 50]);
            }

            // Close modal with success
            const modal = form.closest('.modal');
            if (modal && modal.close) {
                modal.close(true);
            }
        } catch (error) {
            console.error('Failed to update entry:', error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Save Changes
      `;
        }
    });

    return { element: form };
}

// CSS for Edit Form (injected)
const styles = `
.edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.edit-form__type-picker {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  width: fit-content;
  border: none;
  background: var(--glass-bg);
}

.edit-form__type-icon {
  font-size: var(--font-size-xl);
}

.edit-form__type-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.edit-form__type-chevron {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
}

.edit-form__input {
  min-height: 150px;
}

.edit-form__submit {
  align-self: flex-end;
}

.edit-form__submit svg {
  width: 18px;
  height: 18px;
}
`;

// Inject styles
if (!document.getElementById('edit-form-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'edit-form-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}
