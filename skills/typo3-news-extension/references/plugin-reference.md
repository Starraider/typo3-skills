# News Extension Plugin Reference

## Plugin Types

| Purpose | Plugin name | CType | Controller action | Default template |
|---|---|---|---|---|
| List + detail hybrid | `Pi1` | `news_pi1` | `list,detail` | `Templates/News/List.html`, `Detail.html` |
| List only | `NewsListSticky` | `news_newsliststicky` | `list` | `Templates/News/List.html` |
| Curated list | `NewsSelectedList` | `news_newsselectedlist` | `selectedList` | `Templates/News/SelectedList.html` |
| Standalone detail | `NewsDetail` | `news_newsdetail` | `detail` | `Templates/News/Detail.html` |
| Date archive | `NewsDateMenu` | `news_newsdatemenu` | `dateMenu` | `Templates/News/DateMenu.html` |
| Search form | `NewsSearchForm` | `news_newssearchform` | `searchForm` | `Templates/News/SearchForm.html` |
| Search results | `NewsSearchResult` | `news_newssearchresult` | `searchResult` | `Templates/News/SearchResult.html` |
| Category filter | `CategoryList` | `news_categorylist` | `CategoryController::list` | `Templates/Category/List.html` |
| Tag list | `TagList` | `news_taglist` | `TagController::list` | `Templates/Tag/List.html` |

## Important Behavior Rules

- `news_pi1` is the classic list/detail hybrid. If the request contains a valid detail link payload, it renders detail instead of list.
- `news_newsliststicky` is the safe sidebar or companion list because it stays in list mode.
- `news_newsselectedlist` is the native curated-list plugin.
- `news_newssearchform` and `news_newssearchresult` are separate plugins. Wire them with `listPid` or `searchResultPid`.

## TypoScript Settings

```typoscript
plugin.tx_news {
    view {
        templateRootPaths.10 = EXT:my_site_package/Resources/Private/Templates/
        partialRootPaths.10 = EXT:my_site_package/Resources/Private/Partials/
        layoutRootPaths.10 = EXT:my_site_package/Resources/Private/Layouts/
    }
    settings {
        startingpoint = {$mysitepackage.pages.newsStorage}
        detailPid = {$mysitepackage.pages.newsDetail}
        searchResultPid = {$mysitepackage.pages.searchResultPid}
        limit = 10
        format = html
    }
}
```

## Clone Pattern for Variants

```typoscript
plugin.tx_news_newsliststicky < plugin.tx_news
plugin.tx_news_newsliststicky.settings.offset = 1

plugin.tx_news_newssearchform < plugin.tx_news
plugin.tx_news_newssearchform.settings.heroBackgroundImage = {$mysitepackage.news.heroBackgroundImage}

plugin.tx_news_newsselectedlist < plugin.tx_news
```

## Official Documentation Links

- Docs home: `https://docs.typo3.org/p/georgringer/news/main/en-us/`
- Plugins: `https://docs.typo3.org/p/georgringer/news/main/en-us/UsersManual/Plugins/Index.html`
- Installation: `https://docs.typo3.org/p/georgringer/news/main/en-us/Administration/Installation/Index.html`
- TypoScript: `https://docs.typo3.org/p/georgringer/news/main/en-us/Reference/TypoScript/GeneralSettings.html`
- Templates: `https://docs.typo3.org/p/georgringer/news/main/en-us/Tutorials/Templates/TwitterBootstrap/Index.html`
