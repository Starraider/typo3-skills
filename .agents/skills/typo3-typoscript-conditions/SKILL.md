---
name: typo3-typoscript-conditions
description: Add or fix frontend TypoScript conditions for TYPO3 v14. Use when you need conditional TypoScript for specific page IDs, rootlines, site identifiers, languages, requests, TYPO3 versions, or logged-in frontend/backend users and groups in `setup.typoscript`, imported TypoScript files, or site package TypoScript constants that use site settings.
---

# TYPO3 TypoScript Conditions

Use this skill for TYPO3 v14 frontend TypoScript conditions only. Prefer official condition variables and functions from the TYPO3 docs, and avoid legacy patterns.

## Workflow

1. Identify the exact scope:
   - `setup.typoscript` or imported setup for normal frontend TypoScript conditions
   - `constants.typoscript` only when using site settings based conditions
2. Choose the narrowest supported criterion:
   - current page: `traverse(page, "uid")`
   - current language: `siteLanguage("languageId")` or `locale()`
   - current frontend user or group: `frontend.user.*`
   - current site or request context: `site()`, `request()`, `session()`
3. Write the condition with TYPO3 syntax:

```typoscript
[condition]
    # conditional TypoScript
[END]
```

4. Combine criteria with `&&`, `||`, and `!` when needed.
5. Guard nullable objects:
   - Prefer `request && ...` before calling request methods.
   - Prefer `traverse()` for arrays to avoid warnings on missing keys.
   - Use the null-safe operator `?.` where appropriate.

## Ready-Made Patterns

### Specific Page ID

```typoscript
[traverse(page, "uid") == 42]
    page.10.value = Only on page 42
[END]
```

### Multiple Pages Or Page Range

```typoscript
[traverse(page, "uid") in [17, 24, 42]]
    page.10.value = Only on selected pages
[END]

[traverse(page, "uid") in 100..199]
    page.20.value = Only in this page UID range
[END]
```

### Specific Language

```typoscript
[siteLanguage("languageId") == 1]
    page.10.value = Only in language ID 1
[END]
```

TYPO3 v14 provides direct locale access:

```typoscript
[locale().getName() == "de-DE"]
    page.20.value = Only in German
[END]
```

### Logged-In Frontend User Group

```typoscript
[frontend.user.isLoggedIn && 4 in frontend.user.userGroupIds]
    page.10.value = Only for FE group 4
[END]
```

Use `frontend.user.userGroupList` only when string matching is really required:

```typoscript
[like(","~frontend.user.userGroupList~",", "*,4,*")]
    page.20.value = FE group list contains 4
[END]
```

### Combine Page, Language, And FE Group

```typoscript
[traverse(page, "uid") == 42 && siteLanguage("languageId") == 1 && frontend.user.isLoggedIn && 4 in frontend.user.userGroupIds]
    page.10.value = Only on page 42, in language 1, for FE group 4
[END]
```

## Version Guardrails For TYPO3 14

- Do not use legacy `loginUser()` or `usergroup()` conditions. Use `frontend.user.*` or `backend.user.*` instead.
- Do not use `getTSFE()` for new work. It was removed in TYPO3 v14. For page checks, prefer `traverse(page, "uid")` or `request?.getPageArguments()?.getPageId()`.
- Use `locale()` for locale object checks and `siteLanguage()` when reading site language configuration values.

## Selection Guide

- Page-specific condition:
  use `page` or `tree.*`
- Language-specific condition:
  use `siteLanguage()` and `locale()`
- FE login or FE group condition:
  use `frontend.user.isLoggedIn`, `frontend.user.userId`, `frontend.user.userGroupIds`
- Site-specific condition:
  use `site()`
- Query parameter, page type, cookie, host, or header condition:
  use `request()` and its methods
- TYPO3 version or branch condition:
  use `compatVersion()`, `typo3.version`, or `typo3.branch`

## References

Read `references/criteria-catalog.md` when you need the full list of TYPO3 v14 condition criteria, examples, and migration-safe replacements.

Official docs:

- [TypoScript syntax conditions](https://docs.typo3.org/m/typo3/reference-typoscript/main/en-us/Syntax/Conditions/Index.html#typoscript-syntax-conditions)
- [Frontend TypoScript conditions criteria](https://docs.typo3.org/m/typo3/reference-typoscript/main/en-us/Conditions/Index.html)
