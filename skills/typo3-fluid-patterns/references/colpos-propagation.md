# colPos Propagation for Sidebar-Aware Styling

## How TYPO3 Assigns colPos

When you use `lib.dynamicContent` in a page template, TYPO3 renders content elements assigned to that column position. The `colPos` value is available on the content element's `data` object:

```html
<!-- Page template: render main content (colPos 0) and sidebar (colPos 1) -->
<div class="article grid gap-8 lg:grid-cols-3">
    <div class="article__content lg:col-span-2">
        <f:cObject typoscriptObjectPath="lib.dynamicContent" data="{colPos: 0}"/>
    </div>
    <div class="article__aside lg:col-span-1">
        <f:cObject typoscriptObjectPath="lib.dynamicContent" data="{colPos: 1}"/>
    </div>
</div>
```

Content elements rendered via `colPos: 1` will have `data.colPos = 1` available in their templates automatically.

## Accessing colPos in Content Templates

In a content element template (e.g., `Content/Textpic.fluid.html`), the value is available via `{data.colPos}`:

```html
<!-- Content/Textpic.fluid.html -->
<f:section name="Main">
    <f:render partial="Content/Textpic" arguments="{data: data, files: record.image}"/>
</f:section>
```

Since `data` is passed, the partial has full access to `data.colPos`.

## Pattern: Context-Aware Headings (HeaderTag)

The `HeaderTag` partial renders headings with different sizes depending on whether the content is in the main area or sidebar:

```html
<!-- Partials/Header/HeaderTag.fluid.html -->
<f:if condition="{colPos} == 1">
    <f:then>
        <!-- Sidebar: smaller headings -->
        <f:switch expression="{size}">
            <f:case value="small">
                <f:render section="Tag" arguments="{tag: tagToUse, class: 'font-headline text-lg md:text-xl mb-4', text: text}"/>
            </f:case>
            <f:defaultCase>
                <f:render section="Tag" arguments="{tag: tagToUse, class: 'font-headline text-xl md:text-2xl mb-4', text: text}"/>
            </f:defaultCase>
        </f:switch>
    </f:then>
    <f:else>
        <!-- Main content: full-size headings -->
        <f:switch expression="{size}">
            <f:case value="small">
                <f:render section="Tag" arguments="{tag: tagToUse, class: 'font-headline text-2xl md:text-3xl mb-6', text: text}"/>
            </f:case>
            <f:defaultCase>
                <f:render section="Tag" arguments="{tag: tagToUse, class: 'font-headline text-3xl md:text-4xl lg:text-5xl mb-6', text: text}"/>
            </f:defaultCase>
        </f:switch>
    </f:else>
</f:if>
```

**Key insight:** The `colPos` must be explicitly passed when calling this partial. It does NOT inherit automatically through deeply nested calls.

## Pattern: Context-Aware Layouts (Textpic)

The Textpic partial adjusts grid layout based on column position — sidebar content always stacks vertically:

```html
<!-- Partials/Content/Textpic.fluid.html -->

<!-- Side-by-side orientations (imageorient 25/26) check colPos -->
<f:case value="25">
    <f:variable name="containerClass" value="{f:if(
        condition: '{data.colPos} == 1',
        then: 'flex flex-col gap-4',
        else: 'grid md:grid-cols-2 gap-0 md:items-stretch overflow-hidden'
    )}"/>
</f:case>
```

And image widths are adjusted for narrower columns:

```html
<!-- In the Media section -->
<f:if condition="{data.colPos} == 1">
    <f:variable name="imgW" value="400"/>
</f:if>
```

## Propagation Checklist

When adding a new partial or atom that needs column-awareness:

1. **Content Template** — `data.colPos` is available automatically
2. **Content Partial** — receives `data` → has `data.colPos`
3. **Component Partial** — must receive `colPos` as an explicit argument:

   ```html
   <f:render partial="Components/Intro" arguments="{colPos: data.colPos, ...}"/>
   ```

4. **Atom** — if atoms need context (e.g., image widths), pass it down:

   ```html
   <f:render partial="Atoms/Image" arguments="{width: imgW, ...}"/>
   ```

   Here, compute `imgW` based on `colPos` *before* calling the atom.

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Forgot to pass `colPos` to a partial | Sidebar headings show at full size | Add `colPos: data.colPos` to `arguments` |
| Used `colPos` in an atom | Atom becomes context-dependent, less reusable | Compute derived values (width, class) before calling the atom |
| Hardcoded `colPos == 1` without fallback | Content in main area breaks if `colPos` is undefined | Use `{f:if(condition: '{colPos} == 1', then: ..., else: ...)}` |
