# News Extension Template Patterns

## Template Override Locations

Place overrides in the site package:

```
packages/my-site-package/
├── Resources/Private/
│   ├── Templates/News/
│   │   ├── List.html
│   │   ├── Detail.html
│   │   ├── SearchForm.html
│   │   └── SelectedList.html
│   └── Partials/News/
│       ├── CardLead.html
│       ├── CardGrid.html
│       ├── CardCompact.html
│       ├── CardMedia.html
│       ├── SidebarRelatedItem.html
│       └── SidebarTrendingCard.html
```

## Detail Template SEO Requirements

Always preserve these elements near the top of `Detail.html`:

```html
<n:excludeDisplayedNews newsItem="{newsItem}" />
<f:if condition="{settings.detail.showMetaTags}">
    <f:render partial="Detail/Opengraph" arguments="{newsItem: newsItem, settings:settings}" />
</f:if>
<n:titleTag>
    ...
</n:titleTag>
```

These are not decorative:
- `<n:excludeDisplayedNews>` prevents the current detail article from reappearing in exclusion-aware lists
- `<n:titleTag>` keeps the page title integration intact
- `Detail/Opengraph` keeps OpenGraph and related meta output working

## Image Rendering Patterns

Preferred (uses FAL):

```html
<f:if condition="{newsItem.firstPreview}">
    <f:image image="{newsItem.firstPreview}" maxWidth="1200" alt="{newsItem.firstPreview.originalResource.alternative}" />
</f:if>
```

Fallback:

```html
<f:image image="{newsItem.falMedia.0}" maxWidth="1200" />
```

CSS background image (still uses FAL):

```html
style="background-image:url('{f:uri.image(src: heroImage.uid, treatIdAsReference: 1, maxWidth: 1600)}')"
```

## Related Content Pattern

```html
<f:if condition="{newsItem.relatedSorted}">
    <f:for each="{newsItem.relatedSorted}" as="relatedItem">
        <f:render partial="News/SidebarRelatedItem" arguments="{newsItem: relatedItem, settings: settings}" />
    </f:for>
</f:if>
```

## Common Partial Patterns

- category badges
- card media blocks
- lead cards
- compact cards
- pagination
- related article rows
- sidebar trending cards
- meta information rows

## Style Guidelines

- Preserve semantic tags like `<h1>` and `<h2>` in News templates
- Use Tailwind's `!` modifier on semantic elements instead of downgrading to `<div>`
- All styling through site package Tailwind workflow
