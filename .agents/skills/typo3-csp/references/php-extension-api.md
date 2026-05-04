# PHP Extension API Reference — TYPO3 CSP

Reference for adding CSP rules from TYPO3 extensions via `Configuration/ContentSecurityPolicies.php`.

---

## When to Use the PHP API

Use the PHP API when:
- You are writing a **custom TYPO3 extension** that loads third-party assets (scripts, fonts, iframes).
- You need to add CSP rules for the **backend** (YAML only covers frontend).
- You want to add rules that apply to all sites in the installation (not just one site).

For site-specific frontend rules, prefer [yaml-syntax-and-sources.md](yaml-syntax-and-sources.md).

---

## File Location

```
packages/<your-extension>/
  Configuration/
    ContentSecurityPolicies.php   ← this file
```

TYPO3 automatically discovers and loads this file from any active extension.

---

## Full Boilerplate with Annotations

```php
<?php

declare(strict_types=1);

use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Directive;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Mutation;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\MutationCollection;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\MutationMode;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Scope;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\SourceKeyword;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\SourceScheme;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\UriValue;
use TYPO3\CMS\Core\Type\Map;

return Map::fromEntries(
    [
        // ── FRONTEND SCOPE ───────────────────────────────────────────────
        Scope::frontend(),
        new MutationCollection(
            // Allow TYPO3-generated nonce-bearing inline scripts
            new Mutation(
                MutationMode::Extend,
                Directive::ScriptSrc,
                SourceKeyword::nonceProxy,
            ),

            // Allow inline styles with nonce
            new Mutation(
                MutationMode::Extend,
                Directive::StyleSrc,
                SourceKeyword::nonceProxy,
            ),

            // Allow images from your CDN
            new Mutation(
                MutationMode::Extend,
                Directive::ImgSrc,
                new UriValue('https://cdn.example.com'),
            ),

            // Allow YouTube iframes
            new Mutation(
                MutationMode::Extend,
                Directive::FrameSrc,   // NOTE: FrameSrc, NOT IFrameSrc
                new UriValue('https://*.youtube.com'),
                new UriValue('https://*.youtube-nocookie.com'),
            ),

            // Allow data: URIs in images (e.g. base64 inline images)
            new Mutation(
                MutationMode::Extend,
                Directive::ImgSrc,
                SourceScheme::data,
            ),

            // Allow blob: URIs for workers
            new Mutation(
                MutationMode::Set,
                Directive::WorkerSrc,
                SourceScheme::blob,
            ),
        ),
    ],
    [
        // ── BACKEND SCOPE ────────────────────────────────────────────────
        // Backend rules MUST be in PHP — csp.yaml only covers frontend
        Scope::backend(),
        new MutationCollection(
            // Allow your CDN assets in the backend
            new Mutation(
                MutationMode::Extend,
                Directive::ImgSrc,
                new UriValue('https://cdn.example.com'),
            ),

            // Allow your CDN scripts in the backend
            new Mutation(
                MutationMode::Extend,
                Directive::ScriptSrc,
                new UriValue('https://cdn.example.com'),
            ),

            // Allow frames in the backend (e.g. embedded previews)
            new Mutation(
                MutationMode::Extend,
                Directive::FrameSrc,
                new UriValue('https://cdn.example.com'),
            ),
        ),
    ],
);
```

---

## PHP Enum Reference

### MutationMode Values

```php
MutationMode::Set          // 'set'          — Override directive (ignores parent)
MutationMode::Extend       // 'extend'       — Inherit parent + add sources (most common)
MutationMode::Append       // 'append'       — Add to existing directive without inheriting
MutationMode::InheritOnce  // 'inherit-once' — Copy parent sources once
MutationMode::InheritAgain // 'inherit-again'— Re-apply parent sources
MutationMode::Reduce       // 'reduce'       — Remove specific sources
MutationMode::Remove       // 'remove'       — Remove the directive entirely
```

### Directive Values (Most Common)

```php
Directive::DefaultSrc    // default-src
Directive::ScriptSrc     // script-src
Directive::StyleSrc      // style-src
Directive::ImgSrc        // img-src
Directive::FontSrc       // font-src
Directive::FrameSrc      // frame-src  (for <iframe>, not IFrameSrc!)
Directive::ConnectSrc    // connect-src
Directive::MediaSrc      // media-src
Directive::ObjectSrc     // object-src
Directive::WorkerSrc     // worker-src
Directive::ManifestSrc   // manifest-src
Directive::FormAction    // form-action
Directive::BaseUri       // base-uri
```

See the full enum: `\TYPO3\CMS\Core\Security\ContentSecurityPolicy\Directive`

### SourceKeyword Values

```php
SourceKeyword::self        // 'self'
SourceKeyword::none        // 'none'
SourceKeyword::nonceProxy  // 'nonce-proxy' (TYPO3 resolves at runtime)
SourceKeyword::unsafeInline // 'unsafe-inline' — AVOID
SourceKeyword::unsafeEval   // 'unsafe-eval'   — AVOID
SourceKeyword::strictDynamic // 'strict-dynamic'
```

### SourceScheme Values

```php
SourceScheme::data  // data:
SourceScheme::blob  // blob:
SourceScheme::https // https: (use only in img-src)
```

### UriValue

Wraps a literal URL string:

```php
new UriValue('https://cdn.example.com')
new UriValue('https://*.youtube.com')
```

---

## Applying Rules to a Specific Frontend Site Only (PHP Approach)

If you need to target a specific site from PHP, use `Scope::frontend()` with a site identifier:

```php
use TYPO3\CMS\Core\Site\Entity\Site;

// Apply only to the site with identifier 'my-site'
Scope::frontend(new Site('my-site', 1, [])),
```

Generally, it is easier to use `csp.yaml` for per-site rules and PHP for installation-wide rules.

---

## PSR-14 Event for Dynamic Rules

For scenarios where rules must be computed dynamically at runtime (e.g. based on TypoScript settings or database values), listen to `PolicyMutatedEvent`:

```php
use TYPO3\CMS\Core\Attribute\AsEventListener;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Event\PolicyMutatedEvent;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Directive;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Mutation;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\MutationMode;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\UriValue;

#[AsEventListener(identifier: 'my-extension/csp-mutations')]
final class CspMutationListener
{
    public function __invoke(PolicyMutatedEvent $event): void
    {
        // Only act on frontend scope
        if (!$event->scope->isFrontend()) {
            return;
        }

        // Dynamically add a source based on some condition
        $event->policy->extend(
            Directive::ImgSrc,
            new UriValue('https://dynamic-cdn.example.com'),
        );
    }
}
```

Register the listener in `Configuration/Services.yaml`:

```yaml
MyVendor\MyExtension\EventListener\CspMutationListener:
  tags:
    - name: event.listener
      identifier: 'my-extension/csp-mutations'
```
