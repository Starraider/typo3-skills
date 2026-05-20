# CSS Patterns — Language Menu

BEM block: `.lang-menu`. All JS interaction hooks are on `JS_` prefixed classes (no styling).

```css
/* ── Container ────────────────────────────────────── */
.lang-menu {
    position: relative;
}

/* ── Trigger button ───────────────────────────────── */
.lang-menu__trigger {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-s);
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: var(--spacing-xs) var(--spacing-s);
    border-radius: 4px;
    font-size: 0.875rem;
    line-height: 1;
    white-space: nowrap;
    transition: background-color 0.15s ease;
}

.lang-menu__trigger:hover {
    background: rgba(255, 255, 255, 0.15);
}

.lang-menu__trigger:focus-visible {
    outline: 2px solid var(--color-neutral-0);
    outline-offset: 2px;
}

/* Rotate chevron icon when open */
.lang-menu__trigger .icon {
    --icon-size: 12px;
    transition: transform 0.2s ease;
}
.lang-menu--open .lang-menu__trigger .icon {
    transform: rotate(180deg);
}

/* ── Flag image ───────────────────────────────────── */
.lang-menu__flag {
    width: 20px;
    height: 15px;
    display: inline-block;
    border-radius: 2px;
    vertical-align: middle;
    flex-shrink: 0;
}

.lang-menu__label {
    margin-left: var(--spacing-xs);
}

/* ── Dropdown ─────────────────────────────────────── */
.lang-menu__dropdown {
    display: none;        /* hidden by default */
    list-style: none;
    padding: var(--spacing-xs) 0;
    margin: 0;
    z-index: 60;
}

.lang-menu--open .lang-menu__dropdown {
    display: block;       /* JS adds .lang-menu--open to wrapper */
}

/* ── Items & links ────────────────────────────────── */
.lang-menu__item {
    display: block;
}

.lang-menu__link {
    display: flex;
    align-items: center;
    gap: var(--spacing-s);
    padding: var(--spacing-s) var(--spacing-m);
    color: var(--color-neutral-80);
    text-decoration: none;
    font-size: 0.875rem;
    line-height: 1.4;
    transition: background-color 0.15s ease;
    cursor: pointer;
    white-space: nowrap;
}

.lang-menu__link:hover {
    background: var(--color-neutral-10);
}

.lang-menu__link--disabled {
    opacity: 0.4;
    cursor: not-allowed;
}
.lang-menu__link--disabled:hover {
    background: none;
}

.lang-menu__item--active .lang-menu__link {
    font-weight: 600;
}

/* ── Desktop: floating dropdown ───────────────────── */
@media (min-width: 768px) {
    .lang-menu__dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        min-width: 180px;
        margin-top: var(--spacing-xs);
        background: var(--color-neutral-0);
        color: var(--color-neutral-80);
        border: 1px solid var(--color-neutral-10);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }
}

/* ── Mobile: inline inside nav panel ─────────────── */
@media (max-width: 767px) {
    .lang-menu {
        margin-top: var(--spacing-m);
        border-top: 1px solid var(--color-neutral-10);
        padding-top: var(--spacing-m);
        padding-left: var(--spacing-m);
        padding-right: var(--spacing-m);
    }

    .lang-menu__trigger {
        width: 100%;
        justify-content: flex-start;
    }

    .lang-menu__trigger:hover {
        background: var(--color-neutral-10);
    }

    .lang-menu__dropdown {
        position: static;
        background: var(--color-neutral-10);
        border-radius: 6px;
        margin-top: var(--spacing-xs);
        border: none;
        box-shadow: none;
    }
}
```

## JavaScript toggle wiring

The dropdown opens/closes by toggling `.lang-menu--open` on the `.JS_lang-menu` wrapper. Wire it up in your main JS:

```js
const langMenu    = document.querySelector('.JS_lang-menu');
const langTrigger = document.querySelector('.JS_lang-menu-trigger');

function closeLangMenu() {
  if (!langMenu) return;
  langMenu.classList.remove('lang-menu--open');
  if (langTrigger) langTrigger.setAttribute('aria-expanded', 'false');
}

if (langMenu && langTrigger) {
  langTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isOpen = langMenu.classList.contains('lang-menu--open');
    if (isOpen) {
      closeLangMenu();
    } else {
      langMenu.classList.add('lang-menu--open');
      langTrigger.setAttribute('aria-expanded', 'true');
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!langMenu.contains(e.target)) closeLangMenu();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeLangMenu(); langTrigger.focus(); }
  });
}
```
