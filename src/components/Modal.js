/* ===========================================
   MODAL COMPONENT
   iOS sheet-style modal with glass effect
   =========================================== */

let activeModal = null;

/**
 * Show a modal dialog
 * @param {Object} options - Modal options
 * @returns {Promise<any>} Result from modal
 */
export function showModal({ title, content, onClose }) {
  return new Promise((resolve) => {
    // Close any existing modal
    if (activeModal) {
      closeModal();
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal animate-slide-in-bottom';
    modal.innerHTML = `
      <div class="modal__header">
        <h2 class="modal__title">${title}</h2>
        <button class="modal__close" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="modal__content"></div>
    `;

    // Add content
    const contentContainer = modal.querySelector('.modal__content');
    if (typeof content === 'string') {
      contentContainer.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      contentContainer.appendChild(content);
    }

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    activeModal = overlay;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Focus trap
    modal.querySelector('.modal__close').focus();

    const close = (result) => {
      modal.classList.remove('animate-slide-in-bottom');
      modal.classList.add('animate-slide-out-bottom');
      overlay.style.opacity = '0';

      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
        activeModal = null;
        if (onClose) onClose(result);
        resolve(result);
      }, 250);
    };

    // Close handlers
    modal.querySelector('.modal__close').addEventListener('click', () => close(null));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(null);
    });

    // Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', handleEscape);
        close(null);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Expose close function
    modal.close = close;
  });
}

/**
 * Show a confirmation dialog
 * @param {Object} options - Dialog options
 * @returns {Promise<boolean>} User confirmation
 */
export function showConfirm({ title, message, confirmText = 'Delete', cancelText = 'Cancel', isDanger = true }) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay modal-overlay--centered';

    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog animate-scale-in';
    dialog.innerHTML = `
      <h3 class="confirm-dialog__title">${title}</h3>
      <p class="confirm-dialog__message">${message}</p>
      <div class="confirm-dialog__actions">
        <button class="glass-button confirm-dialog__cancel">${cancelText}</button>
        <button class="glass-button ${isDanger ? 'confirm-dialog__confirm--danger' : 'glass-button--primary'} confirm-dialog__confirm">${confirmText}</button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const close = (result) => {
      dialog.style.transform = 'scale(0.9)';
      dialog.style.opacity = '0';
      overlay.style.opacity = '0';

      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
        resolve(result);
      }, 200);
    };

    dialog.querySelector('.confirm-dialog__cancel').addEventListener('click', () => close(false));
    dialog.querySelector('.confirm-dialog__confirm').addEventListener('click', () => close(true));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(false);
    });
  });
}

/**
 * Close the active modal
 */
export function closeModal() {
  if (activeModal) {
    activeModal.remove();
    document.body.style.overflow = '';
    activeModal = null;
  }
}

// CSS for Modal (injected)
const styles = `
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-bg);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: var(--z-overlay);
  display: flex;
  align-items: flex-end;
  transition: opacity var(--transition-base);
}

.modal-overlay--centered {
  align-items: center;
  justify-content: center;
}

.modal {
  width: 100%;
  max-height: 90vh;
  background: var(--color-bg-secondary);
  border-top-left-radius: var(--radius-2xl);
  border-top-right-radius: var(--radius-2xl);
  box-shadow: var(--glass-shadow-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-4) var(--space-3);
  border-bottom: 1px solid var(--glass-border);
}

.modal__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.modal__close:hover {
  background: var(--glass-bg-hover);
  color: var(--text-primary);
}

.modal__close svg {
  width: 18px;
  height: 18px;
}

.modal__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  padding-bottom: calc(var(--space-8) + var(--safe-area-bottom));
}

/* Confirm Dialog */
.confirm-dialog {
  width: calc(100% - var(--space-8));
  max-width: 320px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--glass-shadow-lg);
  text-align: center;
  transition: all var(--transition-fast);
}

.confirm-dialog__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-2);
}

.confirm-dialog__message {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
}

.confirm-dialog__actions {
  display: flex;
  gap: var(--space-3);
}

.confirm-dialog__actions .glass-button {
  flex: 1;
}

.confirm-dialog__confirm--danger {
  background: rgba(248, 113, 113, 0.2);
  border-color: var(--type-fear);
  color: var(--type-fear);
}

.confirm-dialog__confirm--danger:hover {
  background: rgba(248, 113, 113, 0.3);
}
`;

// Inject styles
if (!document.getElementById('modal-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'modal-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
