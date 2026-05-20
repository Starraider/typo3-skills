# JavaScript Patterns for TYPO3 Site Packages

Minimal, progressive-enhancement JavaScript patterns for TYPO3 site packages.

## Philosophy

1. **Progressive enhancement** — the site works without JavaScript; JS adds interactivity
2. **Single consolidated file** — one `main.js` for all client-side behavior
3. **ARIA state synchronization** — JS keeps accessibility attributes in sync with visual state
4. **No heavy dependencies** — vanilla JS only, no frameworks

## Loading via Fluid

Use `f:asset.script` in the page layout with `type="module"`:

```html
<f:asset.script src="EXT:theme_name/Resources/Public/JavaScript/main.js"
                identifier="theme-main" type="module" />
```

This ensures the script is loaded as an ES module and deferred by default.

## Single Consolidated main.js

**Anti-pattern (Story 2.2 lesson):** Creating separate feature-specific JS files (e.g., `navigation.js`, `accordion.js`) that duplicate setup logic or are loaded but never executed.

**Correct approach:** One `main.js` with all interactive behavior:

```javascript
// main.js — single entry point for all client-side behavior

const BREAKPOINT = 768;

// Utility: debounce to prevent excessive resize handler calls
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Feature: Mobile Navigation Toggle
const body = document.body;
const menuButtons = document.querySelectorAll('.JS_header-menu-button');
const nav = document.getElementById('main-menu');

if (menuButtons.length && nav) {
  const isMobile = () => window.innerWidth < BREAKPOINT;

  // Toggle burger/close icons
  const toggleIcons = (button, isOpen) => {
    const openIcon = button.querySelector('.burger-icon--open');
    const closeIcon = button.querySelector('.burger-icon--close');
    if (openIcon) openIcon.classList.toggle('hidden', isOpen);
    if (closeIcon) closeIcon.classList.toggle('hidden', !isOpen);
  };

  menuButtons.forEach(menuButton => {
    menuButton.addEventListener('click', event => {
      if (!isMobile()) return;
      event.preventDefault();

      // Sync ARIA state
      const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
      const nowOpen = !isExpanded;
      menuButton.setAttribute('aria-expanded', String(nowOpen));

      // Toggle visual state
      toggleIcons(menuButton, nowOpen);
      nav.classList.toggle('hidden');
      nav.classList.toggle('header__menu--open');
      body.classList.toggle('body--menu-open');

      // Scroll lock
      body.style.overflow = nowOpen ? 'hidden' : '';
    });
  });

  // Reset at desktop viewport (debounced)
  window.addEventListener('resize', debounce(() => {
    if (!isMobile()) {
      menuButtons.forEach(btn => {
        btn.setAttribute('aria-expanded', 'false');
        btn.classList.remove('header__menu-button--open');
        toggleIcons(btn, false);
      });
      nav.classList.remove('header__menu--open');
      nav.classList.add('hidden');
      body.classList.remove('body--menu-open');
      body.style.overflow = '';
    }
  }, 150));
}
```

## Key Patterns

### JS_ Prefix Convention

Use a `JS_` prefix for class selectors that are targeted by JavaScript. This separates styling concerns from behavior concerns:

```html
<!-- HTML: JS_ classes for behavior, regular classes for styling -->
<button class="JS_header-menu-button header__menu-button md:hidden">
```

```javascript
// JS: target by JS_ class
const menuButtons = document.querySelectorAll('.JS_header-menu-button');
```

**Benefits:**

- CSS refactoring won't accidentally break JS
- Developers can see at a glance which elements have JS behavior
- Never use IDs for JS targeting (IDs should be for ARIA references)

### ARIA State Synchronization

JavaScript must always keep ARIA attributes in sync with visual state:

```javascript
// When toggling menu visibility:
const isExpanded = button.getAttribute('aria-expanded') === 'true';
const nowOpen = !isExpanded;

// 1. Update ARIA state
button.setAttribute('aria-expanded', String(nowOpen));

// 2. Update visual state (must match ARIA)
nav.classList.toggle('hidden');
toggleIcons(button, nowOpen);
```

**Rule:** If `aria-expanded` is `"true"`, the menu must be visible. If `"false"`, hidden. Never let these drift apart.

### Debounced Resize Handler

Resize events fire rapidly. Always debounce:

```javascript
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 150ms debounce is a good balance for UI responsiveness
window.addEventListener('resize', debounce(() => {
  // Reset mobile state when viewport expands to desktop
  if (window.innerWidth >= BREAKPOINT) {
    // Reset ARIA, classes, scroll lock
  }
}, 150));
```

### Viewport-Aware Reset

When the viewport crosses the mobile/desktop breakpoint, reset all mobile-specific state:

```javascript
if (!isMobile()) {
  // 1. Reset ARIA
  button.setAttribute('aria-expanded', 'false');

  // 2. Reset visual state
  nav.classList.remove('header__menu--open');
  nav.classList.add('hidden');  // CSS md:block will override on desktop

  // 3. Reset body state
  body.classList.remove('body--menu-open');
  body.style.overflow = '';

  // 4. Close any open subnavigations
  document.querySelectorAll('.JS_header-subnav.header__subnav--active')
    .forEach(sub => sub.classList.remove('header__subnav--active'));
}
```

### Guard Clause for Feature Detection

Always check if the required DOM elements exist before initializing:

```javascript
const menuButtons = document.querySelectorAll('.JS_header-menu-button');
const nav = document.getElementById('main-menu');

if (menuButtons.length && nav) {
  // Initialize navigation behavior
}
```

This ensures the script doesn't throw errors on pages without the navigation (e.g., error pages, minimal layouts).

## Anti-Patterns

| Anti-Pattern | Why It's Bad | Correct Approach |
|---|---|---|
| Multiple JS files per feature | Dead code, duplication, multiple HTTP requests | Single `main.js` |
| Using IDs for JS targeting | Conflicts, less flexible than classes | `JS_` prefixed classes |
| Missing guard clauses | Errors on pages without the expected DOM | Always check element existence |
| Direct resize listeners | Performance degradation from rapid firing | Debounced handler |
| ARIA/visual state drift | Screen readers announce wrong state | Sync both in every toggle |
| `DOMContentLoaded` wrapper | Unnecessary with `type="module"` (already deferred) | Load as module |
