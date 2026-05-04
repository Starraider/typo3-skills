# Fluid Template — Language Menu Partial

Save as e.g. `Resources/Private/Partials/Pages/LanguageMenu.fluid.html`.

```html
<html
    xmlns:f="http://typo3.org/ns/TYPO3/CMS/Fluid/ViewHelpers"
    data-namespace-typo3-fluid="true"
>

<f:if condition="{languageMenu}">
    <div class="lang-menu JS_lang-menu" id="language-menu">

        <!--
          Hidden data list — machine-readable language data for JS.
          JS reads these data attributes to avoid parsing visible HTML.
        -->
        <ul hidden aria-hidden="true" class="lang-menu__data">
            <f:for each="{languageMenu}" as="lang">
                <li data-hreflang="{lang.hreflang}"
                    data-link="{lang.link}"
                    data-active="{f:if(condition: lang.active, then: 'true', else: 'false')}"
                    data-available="{f:if(condition: lang.available, then: 'true', else: 'false')}"></li>
            </f:for>
        </ul>

        <!-- Trigger button: shows only the currently active language -->
        <f:for each="{languageMenu}" as="lang">
            <f:if condition="{lang.active}">
                <button
                    type="button"
                    class="lang-menu__trigger JS_lang-menu-trigger"
                    aria-expanded="false"
                    aria-controls="lang-menu-dropdown"
                    aria-label="Select language"
                >
                    <img src="{f:uri.resource(path: 'Icons/Flags/{lang.flag}.svg', extensionName: 'MySitePackage')}"
                         alt=""
                         class="lang-menu__flag"
                         width="20"
                         height="15"
                         aria-hidden="true" />
                    <span class="lang-menu__label">{lang.navigationTitle}</span>
                    <!-- Optional: chevron icon partial -->
                    <f:render partial="Icon" arguments="{icon: 'chevron'}" />
                </button>
            </f:if>
        </f:for>

        <!-- Dropdown list: all languages except the active one -->
        <ul class="lang-menu__dropdown" id="lang-menu-dropdown" role="listbox" aria-label="Available languages">
            <f:for each="{languageMenu}" as="lang">
                <f:if condition="!{lang.active}">
                <li class="lang-menu__item {f:if(condition: lang.available, else: 'lang-menu__item--disabled')}" role="option">
                    <f:if condition="{lang.available}">
                        <f:then>
                            <a href="{lang.link}" hreflang="{lang.hreflang}" class="lang-menu__link">
                                <img src="{f:uri.resource(path: 'Icons/Flags/{lang.flag}.svg', extensionName: 'MySitePackage')}"
                                     alt=""
                                     class="lang-menu__flag"
                                     width="20"
                                     height="15"
                                     aria-hidden="true" />
                                <span>{lang.navigationTitle}</span>
                            </a>
                        </f:then>
                        <f:else>
                            <span class="lang-menu__link lang-menu__link--disabled">
                                <img src="{f:uri.resource(path: 'Icons/Flags/{lang.flag}.svg', extensionName: 'MySitePackage')}"
                                     alt=""
                                     class="lang-menu__flag"
                                     width="20"
                                     height="15"
                                     aria-hidden="true" />
                                <span>{lang.navigationTitle}</span>
                            </span>
                        </f:else>
                    </f:if>
                </li>
                </f:if>
            </f:for>
        </ul>
    </div>
</f:if>

</html>
```

## Rendering the partial

Include it from your page layout/template:

```html
<f:render partial="Pages/LanguageMenu" arguments="{languageMenu: languageMenu}" />
```

Or if `languageMenu` is already in scope (PAGEVIEW passes all data processor variables):

```html
<f:render partial="Pages/LanguageMenu" />
```

## Notes

- `{lang.flag}` comes from the TYPO3 site configuration `flag` field (e.g. `gb`, `de`). Supply matching SVG files in `Resources/Public/Icons/Flags/`.
- Omit the `<f:render partial="Icon" ...>` line if you have no chevron icon partial — replace with a plain `▾` character or an inline SVG.
- The `aria-controls="lang-menu-dropdown"` on the button must match the `id` on the `<ul>` dropdown.
