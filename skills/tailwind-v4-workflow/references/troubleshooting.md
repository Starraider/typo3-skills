# Troubleshooting: Symptom → Cause → Fix

## "I added a Tailwind class but it doesn't appear in the browser"

| Cause | Fix |
|-------|-----|
| Build not run after CSS change | Run `ddev npm run build --prefix packages/my-site-package` |
| Browser cache | Hard-refresh: `Cmd+Shift+R` |
| Class in a file not matched by `@source` | Add appropriate `@source` directive in `main.css` |
| Dynamic class construction (`bg-${x}`) | Use complete literal class names only |
| Complex Fluid `{f:if}` inline class | Split into `<f:then>` / `<f:else>` with full class names |

## "The compiled CSS is stale / unchanged"

| Cause | Fix |
|-------|-----|
| Forgot to run build | Run `ddev npm run build --prefix packages/my-site-package` |
| Running `npm` on host instead of `ddev npm` | Always use `ddev npm` — the build runs inside the DDEV container |
| Watch mode not running | Start `ddev npm run dev --prefix packages/my-site-package` for auto-rebuild |
| Editing the wrong file (Public vs Private) | Source is `Resources/Private/Assets/Css/main.css`, **never** edit `Resources/Public/Css/main.css` directly |

## "Dynamic classes are purged from output"

Tailwind's scanner uses static analysis — it cannot detect classes built via string concatenation or complex expressions.

**Broken patterns:**

```html
<!-- Tailwind can't see these classes -->
class="bg-{color}-100"
class="{f:if(condition: '{x}', then: 'text-success', else: 'text-error')}"
```

**Working patterns:**

```html
<!-- Full literal classes — scanner finds these -->
<f:if condition="{x}">
    <f:then><span class="text-success">OK</span></f:then>
    <f:else><span class="text-error">Error</span></f:else>
</f:if>
```

If dynamic classes are absolutely unavoidable, add them as safelisted classes in the CSS entry point:

```css
@utility safelist {
    /* Force Tailwind to always generate these classes */
}
```

Or ensure the literal class names appear somewhere in a scanned file (even in an HTML comment).

## "@theme variable not resolving (bg-[--color-foo] broken)"

**Cause:** The CSS variable is defined outside the `@theme {}` block (e.g., in a `:root {}` rule or an imported partial).

**Fix:** Move the variable definition into the `@theme {}` block in `main.css`:

```css
/* ❌ Not visible to Tailwind's utility generator */
:root { --color-foo: #abc; }

/* ✅ Tailwind generates bg-foo, text-foo, etc. */
@theme { --color-foo: #abc; }
```

## "Global heading styles conflict with component Tailwind classes"

**Cause:** `main.css` defines global `h1`-`h4` styles with `@apply` and `clamp()`. These override Tailwind utilities at the component level.

**Fix:** Use the `!` modifier on component-level Tailwind classes to force override:

```html
<!-- This overrides the global h2 font-size and line-height -->
<h2 class="!text-2xl !font-bold !leading-[1.15]">Custom heading</h2>
```

**Never** replace `<h1>` or `<h2>` with `<div>` to avoid conflicts — semantic HTML is required for SEO and accessibility.

## "Footer styles not applying / being overridden"

**Cause:** The `_footer.css` partial is imported before other partials or global styles that override it.

**Fix:** `_footer.css` must be the **last** `@import` in `main.css`. It intentionally overrides `.component`, `.rte-content`, and global heading styles.

## "New CSS partial not included in build"

**Cause:** The partial file exists but isn't `@import`-ed in `main.css`.

**Fix:**

1. Add `@import "./Partials/_name.css";` to `main.css`
2. Place it **before** the `_footer.css` import line
3. Run `ddev npm run build --prefix packages/my-site-package`
