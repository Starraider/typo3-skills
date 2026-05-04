// ─── Language preference: browser detection + cookie persistence ───────────
//
// Usage: include after DOM is ready (end of <body> or as a module).
// Requires the Fluid partial to render:
//   - .JS_lang-menu          wrapper element
//   - .lang-menu__data       hidden <ul> with [data-hreflang], [data-link],
//                            [data-active], [data-available] on each <li>
//   - a.lang-menu__link      clickable language links (carry [hreflang] attr)

function getCookie(name) {
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function initLanguagePreference() {
  const menu = document.querySelector('.JS_lang-menu');
  if (!menu) return;

  // Read all languages from the hidden data list rendered by Fluid
  const items = menu.querySelectorAll('.lang-menu__data [data-hreflang]');
  if (!items.length) return;

  const languages = Array.from(items).map(el => ({
    hreflang:  el.dataset.hreflang,
    link:      el.dataset.link,
    active:    el.dataset.active    === 'true',
    available: el.dataset.available === 'true',
  }));

  const currentLang = languages.find(l => l.active);
  if (!currentLang) return;

  // Persist cookie when user explicitly clicks a language link
  menu.querySelectorAll('a.lang-menu__link').forEach(link => {
    link.addEventListener('click', () => {
      const hreflang = link.getAttribute('hreflang');
      if (hreflang) setCookie('lang_pref', hreflang, 365);
    });
  });

  // Skip auto-redirect if we already redirected in this tab session (loop guard)
  if (sessionStorage.getItem('lang_redirected')) return;

  // Determine preferred language: cookie takes precedence over browser detection
  let preferredHreflang = getCookie('lang_pref');

  if (!preferredHreflang) {
    // Walk navigator.languages (ordered by user preference) and find first match
    const browserLangs = Array.from(navigator.languages || [navigator.language]);
    for (const browserLang of browserLangs) {
      const code = browserLang.split('-')[0].toLowerCase();
      const match = languages.find(
        l => l.available && l.hreflang.split('-')[0].toLowerCase() === code
      );
      if (match) {
        preferredHreflang = match.hreflang;
        break;
      }
    }
  }

  if (!preferredHreflang) return;

  // Already on the preferred language — ensure cookie is set and stop
  if (currentLang.hreflang === preferredHreflang) {
    if (!getCookie('lang_pref')) setCookie('lang_pref', preferredHreflang, 365);
    return;
  }

  // Find the target language entry and redirect
  const target = languages.find(
    l => l.available && l.hreflang === preferredHreflang
  );
  if (!target) return;

  // Set cookie + session guard, then redirect (replace keeps history clean)
  setCookie('lang_pref', preferredHreflang, 365);
  sessionStorage.setItem('lang_redirected', '1');
  window.location.replace(target.link);
}

initLanguagePreference();
