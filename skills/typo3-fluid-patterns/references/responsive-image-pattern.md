# Responsive Image Pattern

A reusable `Atoms/Image` partial that renders responsive `<picture>` elements with WebP optimization, breakpoint-based sources, and crop variant support.

## Atoms/Image Partial

```html
<html
    xmlns:f="http://typo3.org/ns/TYPO3/CMS/Fluid/ViewHelpers"
    data-namespace-typo3-fluid="true"
>

<f:argument name="image" type="TYPO3\CMS\Core\Resource\FileReference" description="FAL file reference"/>
<f:argument name="width" type="string" optional="1" description="Width of the fallback image"/>
<f:argument name="height" type="string" optional="1" description="Height of the fallback image"/>
<f:argument name="sources" type="array" optional="1" description="Responsive sources keyed by breakpoint (xs, sm, md, lg, xl, xxl)"/>
<f:argument name="loading" type="string" optional="1" default="lazy" description="Loading attribute: lazy, eager, or auto"/>
<f:argument name="class" type="string" optional="1" description="Additional CSS classes"/>

<f:variable name="mimeType" value="{image.properties.mime_type}"/>
<f:variable name="fileExtension" value="{f:if(condition: '{mimeType} == \'image/jpeg\' || {mimeType} == \'image/png\'', then: 'webp')}"/>

<f:if condition="{image}">
    <f:if condition="{sources}">
        <f:then>
            <picture class="image__picture">
                <f:for each="{sources}" as="sourceConfig" key="breakpointKey">
                    <f:switch expression="{breakpointKey}">
                        <f:case value="xxl"><f:variable name="minWidth" value="1920"/></f:case>
                        <f:case value="xl"><f:variable name="minWidth" value="1440"/></f:case>
                        <f:case value="lg"><f:variable name="minWidth" value="1280"/></f:case>
                        <f:case value="md"><f:variable name="minWidth" value="1024"/></f:case>
                        <f:case value="sm"><f:variable name="minWidth" value="768"/></f:case>
                        <f:case value="xs"><f:variable name="minWidth" value="480"/></f:case>
                        <f:defaultCase><f:variable name="minWidth" value="0"/></f:defaultCase>
                    </f:switch>

                    <f:if condition="{minWidth}">
                        <source
                            srcset="{f:uri.image(
                                image: image,
                                width: sourceConfig.width,
                                height: sourceConfig.height,
                                cropVariant: '{sourceConfig.cropVariant ? sourceConfig.cropVariant : \'default\'}',
                                fileExtension: fileExtension
                            )}"
                            media="(min-width: {minWidth}px)"
                        />
                    </f:if>
                </f:for>

                <f:image
                    image="{image}"
                    width="{width}"
                    height="{height}"
                    cropVariant="default"
                    fileExtension="{fileExtension}"
                    loading="{loading}"
                    class="{f:if(condition: class, then: class, else: 'block max-w-full h-auto rounded-lg shadow-sm mx-auto')}"
                />
            </picture>
        </f:then>
        <f:else>
            <f:image
                image="{image}"
                width="{width}"
                height="{height}"
                cropVariant="default"
                fileExtension="{fileExtension}"
                loading="{loading}"
                class="{f:if(condition: class, then: class, else: 'block max-w-full h-auto rounded-lg shadow-sm mx-auto')}"
            />
        </f:else>
    </f:if>
</f:if>

</html>
```

## Key Design Decisions

### f:argument Declarations

The partial uses explicit `f:argument` declarations for type safety and self-documentation. This is a TYPO3 v14+ feature:

```html
<f:argument name="image" type="TYPO3\CMS\Core\Resource\FileReference" description="FAL file reference"/>
<f:argument name="loading" type="string" optional="1" default="lazy" description="Loading attribute"/>
```

### WebP Conversion

JPEG and PNG images are automatically converted to WebP via the `fileExtension` parameter:

```html
<f:variable name="fileExtension" value="{f:if(condition: '{mimeType} == \'image/jpeg\' || {mimeType} == \'image/png\'', then: 'webp')}"/>
```

SVG and GIF files are left untouched.

### Fallback Behavior

If `sources` is not provided, the partial falls back to a simple `<f:image>` without `<picture>` / `<source>`. This makes the partial usable in simple contexts too.

## Calling the Partial

### Hero Image (LCP — eager loading)

```html
<f:render partial="Atoms/Image" arguments="{
    image: images.0,
    width: '1244',
    height: '560c',
    sources: {
        xl: {width: '1244', height: '560c', cropVariant: 'xl'},
        lg: {width: '1024', height: '560c', cropVariant: 'lg'},
        md: {width: '768', height: '560c', cropVariant: 'md'},
        sm: {width: '640', height: '560c', cropVariant: 'sm'},
        xs: {width: '767c', height: '432c'}
    },
    loading: 'eager',
    class: 'w-full h-full object-cover'
}"/>
```

### Content Image (lazy loading, context-aware width)

```html
<!-- Compute width based on column position before calling -->
<f:variable name="imgW" value="800"/>
<f:if condition="{data.colPos} == 1">
    <f:variable name="imgW" value="400"/>
</f:if>

<f:render partial="Atoms/Image" arguments="{
    image: files.0,
    width: imgW,
    sources: {
        lg: {width: lgW},
        md: {width: '600'},
        sm: {width: '472'},
        xs: {width: '400'}
    }
}"/>
```

## Loading Strategy

| Context | `loading` value | Why |
|---------|----------------|-----|
| Hero / stage area | `eager` | Above the fold — affects LCP metric |
| Content images | `lazy` (default) | Below the fold — defer loading |
| Sidebar images | `lazy` | Below the fold |

> **Performance lesson (Epic 3):** When using a reusable Image partial, ensure that `loading="eager"` is explicitly passed for above-the-fold images. The default `lazy` is correct for most cases, but hero images must override it.

## Crop Variants

TYPO3's crop variants allow editors to define different crops per breakpoint. Pass the `cropVariant` key per source:

```html
sources: {
    xl: {width: '1244', height: '560c', cropVariant: 'xl'},
    md: {width: '768', height: '560c', cropVariant: 'md'},
    xs: {width: '400'}  <!-- Falls back to 'default' cropVariant -->
}
```

If `cropVariant` is not specified for a source, it defaults to `'default'`.

## Width Syntax

- `800` — scale to 800px width, maintain aspect ratio
- `800c` — crop to exactly 800px width
- `800m` — scale to max 800px, never upscale
