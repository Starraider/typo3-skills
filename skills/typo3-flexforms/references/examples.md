# TYPO3 FlexForm Examples (v14+)

## Direct Plugin Registration (Extbase)

In `ext_localconf.php`:

```php
<?php
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
use TYPO3\CMS\Extbase\Utility\ExtensionUtility;

$ctypeKey = ExtensionUtility::registerPlugin(
    'MyExtension',
    'MyPlugin',
    'My Plugin Title',
    'my-extension-icon',
    'plugins',
    'Plugin description',
    // 7th parameter directly loads the FlexForm
    'FILE:EXT:my_extension/Configuration/FlexForms/MyPlugin.xml'
);

// Still need to make it available in the backend layout
ExtensionManagementUtility::addToAllTCAtypes(
    'tt_content',
    '--div--;Configuration,pi_flexform,',
    $ctypeKey,
    'after:subheader'
);
```

## Plain Plugin Registration

```php
<?php
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;

$ctypeKey = 'my_plugin';

// Plain plugin without Extbase controller
ExtensionManagementUtility::addPlugin(
    [
        'My Plugin Title',
        $ctypeKey,
        'my-extension-icon'
    ],
    // 2nd parameter directly loads the FlexForm
    'FILE:EXT:my_extension/Configuration/FlexForms/MyPlugin.xml'
);

ExtensionManagementUtility::addToAllTCAtypes(
    'tt_content',
    '--div--;Configuration,pi_flexform,',
    $ctypeKey,
    'after:subheader'
);
```

## FlexForm XML Structure (with `settings.` prefix and no `<TCEforms>`)

File: `Configuration/FlexForms/MyPlugin.xml`

```xml
<T3DataStructure>
    <sheets>
        <sDEF>
            <ROOT>
                <sheetTitle>General Settings</sheetTitle>
                <type>array</type>
                <el>
                    <!-- Typical Input Field -->
                    <settings.limit>
                        <label>Number of items</label>
                        <config>
                            <type>input</type>
                            <eval>int</eval>
                            <default>10</default>
                        </config>
                    </settings.limit>

                    <!-- Category Field -->
                    <settings.categories>
                        <label>Categories (One to Many)</label>
                        <config>
                            <type>category</type>
                        </config>
                    </settings.categories>
                </el>
            </ROOT>
        </sDEF>
    </sheets>
</T3DataStructure>
```

**Important Notes for Categories:**

- Due to limitations in FlexForms, the `relationship="manyToMany"` property for categories is not supported. The default is always `oneToMany`.
- You retrieve categories in PHP using the CategoryCollection: `\TYPO3\CMS\Frontend\Category\Collection\CategoryCollection::load($aCategory, true, $table, $relationField)`.
