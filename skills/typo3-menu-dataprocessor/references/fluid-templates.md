# Fluid Menu Template Patterns

## Single-Level Menu

```html
<nav>
    <ul>
        <f:for each="{mainMenu}" as="item">
            <li class="{f:if(condition: item.active, then: 'active')}">
                <a href="{item.link}" title="{item.title}">{item.title}</a>
            </li>
        </f:for>
    </ul>
</nav>
```

## Two-Level Dropdown Menu

```html
<nav>
    <ul>
        <f:for each="{mainMenu}" as="item">
            <li class="{f:if(condition: item.active, then: 'active')}">
                <a href="{item.link}">{item.title}</a>
                <f:if condition="{item.hasSubpages}">
                    <ul class="submenu">
                        <f:for each="{item.children}" as="child">
                            <li class="{f:if(condition: child.active, then: 'active')}">
                                <a href="{child.link}">{child.title}</a>
                            </li>
                        </f:for>
                    </ul>
                </f:if>
            </li>
        </f:for>
    </ul>
</nav>
```

## Breadcrumb

```html
<f:if condition="{breadcrumb}">
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <f:for each="{breadcrumb}" as="item">
                <f:if condition="{item.current}">
                    <f:then>
                        <li class="breadcrumb-item active" aria-current="page">
                            {item.title}
                        </li>
                    </f:then>
                    <f:else>
                        <li class="breadcrumb-item">
                            <a href="{item.link}">{item.title}</a>
                        </li>
                    </f:else>
                </f:if>
            </f:for>
        </ol>
    </nav>
</f:if>
```

## Language Menu

```html
<f:if condition="{languageMenu}">
    <ul class="language-menu">
        <f:for each="{languageMenu}" as="lang">
            <li class="{f:if(condition: lang.active, then: 'active')}
                        {f:if(condition: lang.available, else: 'disabled')}">
                <f:if condition="{lang.available}">
                    <f:then>
                        <a href="{lang.link}" hreflang="{lang.hreflang}">
                            {lang.navigationTitle}
                        </a>
                    </f:then>
                    <f:else>
                        <span>{lang.navigationTitle}</span>
                    </f:else>
                </f:if>
            </li>
        </f:for>
    </ul>
</f:if>
```

## Utility Patterns

### Active/Current Classes

```html
class="{f:if(condition: item.active, then: 'is-active')}
       {f:if(condition: item.current, then: 'is-current')}"
```

### Accessibility

```html
<nav aria-label="Main navigation">
    <ul role="list">
        <f:for each="{mainMenu}" as="item" iteration="i">
            <li role="listitem"
                class="nav-item {f:if(condition: item.active, then: 'active')}">
                <a href="{item.link}"
                   class="nav-link"
                   aria-current="{f:if(condition: item.current, then: 'page')}">
                    {item.title}
                </a>
            </li>
        </f:for>
    </ul>
</nav>
```

### Skip Link (for accessibility)

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

### Mobile Toggle Pattern

```html
<button class="mobile-menu-toggle"
        aria-expanded="false"
        aria-controls="main-nav">
    <span class="sr-only">Toggle menu</span>
</button>
<nav id="main-nav" class="main-nav">
    <ul>
        <f:for each="{mainMenu}" as="item">
            <li>
                <a href="{item.link}">{item.title}</a>
            </li>
        </f:for>
    </ul>
</nav>
```
