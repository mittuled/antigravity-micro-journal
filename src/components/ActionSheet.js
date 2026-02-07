/* ===========================================
   ACTION SHEET COMPONENT
   iOS-style action sheet for selections
   =========================================== */

/**
 * Show an action sheet
 * @param {Object} options - Action sheet options
 * @returns {Promise<string|null>} Selected option value or null
 */
export function showActionSheet({ title, options, selectedValue }) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'action-sheet-overlay';

        const sheet = document.createElement('div');
        sheet.className = 'action-sheet animate-slide-in-bottom';

        const optionsHtml = options.map(opt => `
      <button class="action-sheet__option ${opt.value === selectedValue ? 'action-sheet__option--selected' : ''}" 
              data-value="${opt.value}">
        ${opt.icon ? `<span class="action-sheet__icon">${opt.icon}</span>` : ''}
        <span class="action-sheet__label">${opt.label}</span>
        ${opt.value === selectedValue ? `
          <svg class="action-sheet__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ` : ''}
      </button>
    `).join('');

        sheet.innerHTML = `
      <div class="action-sheet__header">
        <span class="action-sheet__title">${title}</span>
      </div>
      <div class="action-sheet__options">
        ${optionsHtml}
      </div>
      <button class="action-sheet__cancel">Cancel</button>
    `;

        overlay.appendChild(sheet);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        const close = (result) => {
            sheet.classList.remove('animate-slide-in-bottom');
            sheet.classList.add('animate-slide-out-bottom');
            overlay.style.opacity = '0';

            setTimeout(() => {
                overlay.remove();
                document.body.style.overflow = '';
                resolve(result);
            }, 250);

            // Haptic feedback
            if (navigator.vibrate && result) {
                navigator.vibrate(10);
            }
        };

        // Option click handlers
        sheet.querySelectorAll('.action-sheet__option').forEach(btn => {
            btn.addEventListener('click', () => {
                close(btn.dataset.value);
            });
        });

        // Cancel
        sheet.querySelector('.action-sheet__cancel').addEventListener('click', () => close(null));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close(null);
        });
    });
}

// CSS for Action Sheet (injected)
const styles = `
.action-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: var(--z-overlay);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: var(--space-4);
  padding-bottom: calc(var(--space-4) + var(--safe-area-bottom));
  transition: opacity var(--transition-base);
}

.action-sheet {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.action-sheet__header {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur-strong));
  -webkit-backdrop-filter: blur(var(--glass-blur-strong));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding: var(--space-3) var(--space-4);
  text-align: center;
}

.action-sheet__title {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.action-sheet__options {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur-strong));
  -webkit-backdrop-filter: blur(var(--glass-blur-strong));
  border: 1px solid var(--glass-border);
  border-top: none;
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  overflow: hidden;
  max-height: 50vh;
  overflow-y: auto;
}

.action-sheet__option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-4);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--glass-border);
  color: var(--text-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background var(--transition-fast);
  text-align: left;
}

.action-sheet__option:last-child {
  border-bottom: none;
}

.action-sheet__option:hover {
  background: var(--glass-bg-hover);
}

.action-sheet__option:active {
  background: var(--glass-bg-active);
}

.action-sheet__option--selected {
  color: var(--accent-primary);
}

.action-sheet__icon {
  font-size: var(--font-size-xl);
  width: 28px;
  text-align: center;
}

.action-sheet__label {
  flex: 1;
}

.action-sheet__check {
  width: 20px;
  height: 20px;
  color: var(--accent-primary);
}

.action-sheet__cancel {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur-strong));
  -webkit-backdrop-filter: blur(var(--glass-blur-strong));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  color: var(--accent-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.action-sheet__cancel:hover {
  background: var(--glass-bg-hover);
}

.action-sheet__cancel:active {
  background: var(--glass-bg-active);
}
`;

// Inject styles
if (!document.getElementById('action-sheet-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'action-sheet-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}
