# TYPO3 Fluid Template Integration with Tailwind

## Loading CSS in Fluid

Use TYPO3's native `f:asset.css` ViewHelper in the page layout:

```html
<f:asset.css identifier="theme-main" href="EXT:theme_name/Resources/Public/Css/main.css" />
```

This integrates with TYPO3's asset collector and handles cache busting automatically.

## Using Tailwind Classes in Fluid

Use Tailwind utility classes directly in Fluid templates:

```html
<div class="bg-primary-100 p-m rounded-s text-neutral-0">
    <f:format.html>{data.bodytext}</f:format.html>
</div>
```

### Dynamic Class Gotcha

**Never** construct Tailwind class names dynamically via string concatenation:

```html
<!-- ❌ BAD — Tailwind scanner won't find this -->
<div class="bg-{themeColor}-100">

<!-- ✅ GOOD — Use complete class names -->
<f:if condition="{themeColor} == 'primary'">
    <div class="bg-primary-100">
</f:if>
```

If dynamic classes are unavoidable, add them to a safelist in the CSS config.

## Mobile-First Responsive Pattern

Write base styles for mobile, add `md:` or `lg:` prefixes for larger viewports:

```html
<!-- Navigation: hidden on mobile, flex on desktop -->
<nav id="main-menu" class="hidden md:flex md:items-center md:gap-l">
    <f:for each="{menuItems}" as="item">
        <a href="{item.link}" class="text-neutral-0 hover:text-primary-75 focus:outline focus:ring-2">
            {item.title}
        </a>
    </f:for>
</nav>

<!-- Burger button: visible on mobile only -->
<button aria-expanded="false" aria-controls="main-menu" aria-label="Main navigation toggle"
        class="md:hidden text-neutral-0 focus:outline focus:ring-2">
    <!-- Burger icon SVG -->
</button>
```

## Sticky Header Pattern

```html
<header class="sticky top-0 z-50 bg-primary-100">
    <div class="container mx-auto flex items-center justify-between py-m px-s">
        <!-- Logo + Navigation -->
    </div>
</header>
```

## Skip-to-Content Link

Add as the first element inside `<body>` in the page layout:

```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-neutral-0 focus:text-neutral-90 focus:p-s focus:rounded-s">
    Skip to content
</a>
```

And add `id="main-content"` to the main content area.

## HTML Language Attribute

Set the `lang` attribute dynamically on `<html>`:

```html
<html lang="{site.language.twoLetterIsoCode -> f:if(then: site.language.twoLetterIsoCode, else: 'en')}">
```

## colPos Propagation for Sidebar-Aware Styling

When content elements need different styling in sidebars vs. main content, propagate `colPos` through the template chain:

**Page Layout → Section → Partial → Atom**

```html
<!-- In the page layout (e.g., ContentpageSidebar.html) -->
<f:section name="sidebar">
    <f:cObject typoscriptObjectPath="lib.dynamicContent" data="{colPos: 1}" />
</f:section>

<!-- In a content element partial -->
<f:variable name="isSidebar" value="{f:if(condition: '{data.colPos} == 1', then: '1', else: '0')}" />

<!-- Conditional styling based on context -->
<h2 class="{f:if(condition: isSidebar, then: 'text-lg', else: 'text-2xl')} font-headline">
    {data.header}
</h2>
```

> **Lesson learned:** This pattern requires touching many files (layouts → partials → atoms). Plan for it early and test thoroughly — missing a layer causes silent rendering issues.

## Footer — CMS-First Approach

**Never** hardcode footer content in TypoScript settings. Use TYPO3's content APIs:

```html
<!-- ✅ GOOD — Dynamic content from TYPO3 backend -->
<footer class="bg-neutral-90 text-neutral-0 py-xl">
    <div class="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-l">
        <f:cObject typoscriptObjectPath="lib.dynamicContent" data="{colPos: 10}" />
    </div>
</footer>

<!-- ❌ BAD — Hardcoded content editors can't change -->
<footer>
    <p>{settings.footer.copyright}</p>
</footer>
```

> This was a critical mistake: implementing footer content via TypoScript settings defeats the purpose of a CMS.

## Dark Background Text Color

When content elements have dark backgrounds, ensure text inherits white color. Use explicit Tailwind classes rather than relying on CSS inheritance:

```html
<div class="bg-neutral-90 text-neutral-0">
    <!-- All child text will be white -->
    <f:format.html>{data.bodytext}</f:format.html>
</div>
```

If RTE-generated content includes inline styles that override this, add a CSS reset:

```css
.bg-neutral-90 * {
  color: inherit;
}
```

## Image Handling

For hero/above-the-fold images, use `loading="eager"` to maintain LCP performance:

```html
<f:image image="{file}" alt="{file.alternative}" class="w-full h-auto"
         loading="{f:if(condition: isHero, then: 'eager', else: 'lazy')}" />
```
