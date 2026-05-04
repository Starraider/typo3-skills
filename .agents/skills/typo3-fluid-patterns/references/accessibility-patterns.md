# Accessibility Patterns for TYPO3 Fluid Templates

WCAG 2.1 AA compliance patterns built into the template architecture.

## 1. HTML Language Attribute

Set dynamically on the `<html>` element in the page layout:

```html
<html
    lang="{site.language.twoLetterIsoCode ?? 'en'}"
    xmlns:f="http://typo3.org/ns/TYPO3/CMS/Fluid/ViewHelpers"
    data-namespace-typo3-fluid="true"
>
```

The `??` operator provides a fallback to `'en'` if the site language isn't configured.

## 2. Skip-to-Content Link

Add as the **first element** inside `<body>` in the page layout:

```html
<body id="page-top">
<a href="#content"
   class="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-white focus:text-primary-100 focus:p-4 focus:outline-none focus:ring-2 focus:ring-primary-100">
    Skip to Content
</a>
```

And add `id="content"` to the `<main>` element:

```html
<main id="content" class="page__content">
    <f:render section="Main" optional="true">
        <f:cObject typoscriptObjectPath="lib.dynamicContent" data="{colPos: 0}"/>
    </f:render>
</main>
```

**Key rules:**

- Must be the first focusable element in the DOM
- Visually hidden by default, visible only when focused via keyboard
- Target (`#content`) must be a landmark element

## 3. Semantic Landmarks

Use HTML5 semantic elements in the page layout:

```html
<body>
    <a href="#content">Skip to Content</a>     <!-- Skip link -->

    <header>...</header>                         <!-- Site header -->

    <main id="content">                          <!-- Main content -->
        <article>...</article>                   <!-- If applicable -->
        <aside>...</aside>                       <!-- Sidebar -->
    </main>

    <footer>...</footer>                         <!-- Site footer -->
</body>
```

**In TYPO3 Fluid:**

```html
<f:render partial="Pages/Header" arguments="{_all}"/>

<main id="content" class="page__content">
    <f:render section="Main" optional="true">
        <f:cObject typoscriptObjectPath="lib.dynamicContent" data="{colPos: 0}"/>
    </f:render>
</main>

<f:render partial="Pages/Footer" arguments="{_all}"/>
```

## 4. Navigation ARIA Pattern

### Burger Menu Button

```html
<button
    type="button"
    aria-expanded="false"
    aria-controls="main-menu"
    aria-label="Main navigation toggle"
    class="JS_header-menu-button md:hidden focus:outline focus:outline-2 focus:outline-white focus:ring focus:ring-white/50"
>
    <span class="burger-icon--open"><f:render partial="Icon" arguments="{icon: 'menu'}"/></span>
    <span class="burger-icon--close hidden"><f:render partial="Icon" arguments="{icon: 'close'}"/></span>
</button>
```

**ARIA rules:**

- `aria-expanded="false"` — initial state; toggled by JavaScript
- `aria-controls="main-menu"` — references the nav element's ID
- `aria-label` — human-readable label since the button uses an icon

### Navigation Element

```html
<nav class="hidden md:block" id="main-menu"
     aria-label="{f:translate(domain: 'theme_name.messages', key: 'menu.main.label')}">
    <ul class="flex flex-col md:flex-row md:gap-6">
        <f:for each="{mainMenu}" as="item">
            <li>
                <f:link.typolink parameter="{item.link}"
                    class="focus:outline focus:outline-2 focus:outline-white focus:ring focus:ring-white/50">
                    {item.title}
                </f:link.typolink>
            </li>
        </f:for>
    </ul>
</nav>
```

**Key points:**

- `aria-label` on `<nav>` distinguishes it from other nav elements (e.g., footer nav)
- Use `f:translate` for internationalized labels
- `id="main-menu"` matches the button's `aria-controls`

## 5. Logo Accessibility

Wrap the logo in a link with screen-reader-only text:

```html
<f:link.typolink parameter="{breadcrumb.0.link}" class="header__logo" title="{breadcrumb.0.title}">
    <span class="sr-only">{breadcrumb.0.title}</span>
    <f:render partial="Logo/Logo" arguments="{startpage: breadcrumb.0}"/>
</f:link.typolink>
```

The `sr-only` `<span>` provides the accessible name when the logo is an image/SVG without alt text.

## 6. Focus Indicators

Apply a consistent focus style to all interactive elements:

```html
<!-- Pattern: outline + ring for high visibility -->
class="focus:outline focus:outline-2 focus:outline-white focus:ring focus:ring-white/50"
```

**Rules:**

- Focus indicators must be visible on all backgrounds
- Use `focus-visible` if you want to hide focus on mouse clicks (optional enhancement)
- Minimum 2px width for the indicator
- Contrast against background must meet 3:1 ratio

## 7. Heading Hierarchy

Never skip heading levels. Use the `HeaderTag` partial to enforce correct semantics:

```html
<f:section name="Tag">
    <f:switch expression="{tag}">
        <f:case value="1"><h1 class="{class}">{text -> f:format.nl2br()}</h1></f:case>
        <f:case value="2"><h2 class="{class}">{text -> f:format.nl2br()}</h2></f:case>
        <f:case value="3"><h3 class="{class}">{text -> f:format.nl2br()}</h3></f:case>
        <f:case value="4"><h4 class="{class}">{text -> f:format.nl2br()}</h4></f:case>
        <f:case value="5"><h5 class="{class}">{text -> f:format.nl2br()}</h5></f:case>
        <f:case value="6"><h6 class="{class}">{text -> f:format.nl2br()}</h6></f:case>
        <f:defaultCase><p class="{class}">{text -> f:format.nl2br()}</p></f:defaultCase>
    </f:switch>
</f:section>
```

**Key insight:** The visual size of the heading and the semantic tag level are independent. Use `size` for visual styling and `tag` for the HTML element. This allows editors to choose heading levels correctly without worrying about font size.

## Checklist

- [ ] `<html lang="...">` is set dynamically
- [ ] Skip-to-content link is first element in `<body>`
- [ ] `<main>` has a matching `id` for the skip link target
- [ ] `<header>`, `<nav>`, `<main>`, `<footer>` landmarks are used
- [ ] Burger button has `aria-expanded`, `aria-controls`, `aria-label`
- [ ] Logo link has screen-reader text
- [ ] All interactive elements have visible focus indicators
- [ ] Heading levels are not skipped
- [ ] Nav elements have `aria-label` to differentiate them
