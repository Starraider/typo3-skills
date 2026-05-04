# TYPO3 v14 TypoScript Conditions Criteria

This reference summarizes the official frontend TypoScript condition criteria for TYPO3 v14 and highlights the criteria most useful for site-package work.

## Syntax Refresher

Basic form:

```typoscript
[condition]
    # TypoScript applied only when the expression is true
[END]
```

Useful syntax rules:

- Use `[ELSE]` for the inverse branch of the immediately preceding condition.
- `[END]` and `[GLOBAL]` both end the current condition scope.
- Combine expressions with `&&`, `||`, `and`, `or`, and `!`.
- Conditions cannot be nested within the same TypoScript code block.
- `@import` can be placed inside a condition.
- Use `?.` for null-safe object access where needed.
- Use `traverse()` to read array values safely.

## Practical Recipes

### Page UID

```typoscript
[traverse(page, "uid") == 42]
    page.10.value = Only on page 42
[END]
```

### Any Page In A Section

```typoscript
[12 in tree.rootLineIds]
    page.10.value = Only below section root 12
[END]
```

### Language ID

```typoscript
[siteLanguage("languageId") == 1]
    page.10.value = Only in language 1
[END]
```

### Locale In TYPO3 v14

```typoscript
[locale().getName() == "en-GB"]
    page.10.value = Only in British English
[END]
```

### Logged-In Frontend User Group

```typoscript
[frontend.user.isLoggedIn && 7 in frontend.user.userGroupIds]
    page.10.value = Only for FE group 7
[END]
```

### Site Identifier

```typoscript
[site("identifier") == "main"]
    page.10.value = Only on this site
[END]
```

### Route Argument Or Page Type

```typoscript
[request && request.getPageArguments()?.getPageType() == 98]
    page.10.value = Only for typeNum 98
[END]
```

## Available Criteria

### Context And Page Data

- `applicationContext`
  Match the TYPO3 application context such as `Development` or `Production/Staging`.
- `page`
  Full current page record as an array. Use `traverse(page, "...")` for fields like `uid`, `pid`, `title`, or `backend_layout`.
- `tree.level`
  Current page depth.
- `tree.pagelayout`
  Effective backend layout, including inherited subpage layout configuration.
- `tree.rootLine`
  Rootline data with page arrays.
- `tree.rootLineIds`
  Rootline UIDs.
- `tree.rootLineParentIds`
  Parent UIDs inside the rootline.

### User Context

- `backend.user.isAdmin`
- `backend.user.isLoggedIn`
- `backend.user.userId`
- `backend.user.userGroupIds`
- `backend.user.userGroupList`
- `frontend.user.isLoggedIn`
- `frontend.user.userId`
- `frontend.user.userGroupIds`
- `frontend.user.userGroupList`

Prefer `*.userGroupIds` for membership checks and use `*.userGroupList` only when a string-style list comparison is unavoidable.

### Workspace And TYPO3 Runtime

- `workspace.workspaceId`
- `workspace.isLive`
- `workspace.isOffline`
- `typo3.version`
- `typo3.branch`
- `typo3.devIpMask`

### Utility Functions

- `date()`
  Compare current date or time values.
- `like()`
  Wildcard or regex style matching for strings.
- `traverse()`
  Safe access into nested arrays.
- `compatVersion()`
  Compare against the current TYPO3 branch or version.
- `getenv()`
  Read environment variables.
- `feature()`
  Inspect TYPO3 feature toggle states.
- `ip()`
  Match client IPs or `devIP`.

### Request And Session

- `request`
  Request object access. Guard with `request && ...` if availability is uncertain.
- `request.getQueryParams()`
  GET parameters.
- `request.getParsedBody()`
  POST body values.
- `request.getHeaders()`
  Request headers.
- `request.getCookieParams()`
  Cookies.
- `request.getNormalizedParams()`
  Normalized request helpers such as host or HTTPS state.
- `request.getPageArguments()`
  Resolved route enhancer and page argument information.
- `session()`
  Session values written by TYPO3 or extensions.

### Site And Language

- `site("identifier")`
- `site("base")`
- `site("rootPageId")`
- `site("languages")`
- `site("allLanguages")`
- `site("defaultLanguage")`
- `site("configuration")`
- `siteLanguage("languageId")`
- `siteLanguage("locale")`
- `siteLanguage("base")`
- `siteLanguage("title")`
- `siteLanguage("navigationTitle")`
- `siteLanguage("flagIdentifier")`
- `siteLanguage("typo3Language")`
- `siteLanguage("hreflang")`
- `siteLanguage("fallbackType")`
- `siteLanguage("fallbackLanguageIds")`
- `locale()`
  TYPO3 v14 only shortcut to the locale object.

## TYPO3 v14 Migration Notes

- Do not use legacy `loginUser()`. Use `frontend.user.*` or `backend.user.*`.
- Do not use legacy `usergroup()`. Use `frontend.user.userGroupIds` or `backend.user.userGroupIds`.
- `getTSFE()` was removed in TYPO3 v14. Use `request?.getPageArguments()?.getPageId()` or page-based criteria instead.
- Use `locale()` for locale object checks and `siteLanguage(...)` for site language configuration values.

## Preferred Patterns

- Page UID:
  `traverse(page, "uid") == 42`
- Page subtree:
  `12 in tree.rootLineIds`
- Site language:
  `siteLanguage("languageId") == 1`
- FE login:
  `frontend.user.isLoggedIn`
- FE group:
  `4 in frontend.user.userGroupIds`
- Site setting:
  `traverse(site("configuration"), "settings/foo/bar") == "baz"`
- Route parameter:
  `request && request.getPageArguments()?.get("slug") == "sale"`

## Official Documentation

- [TypoScript syntax conditions](https://docs.typo3.org/m/typo3/reference-typoscript/main/en-us/Syntax/Conditions/Index.html#typoscript-syntax-conditions)
- [Frontend TypoScript conditions criteria](https://docs.typo3.org/m/typo3/reference-typoscript/main/en-us/Conditions/Index.html)
