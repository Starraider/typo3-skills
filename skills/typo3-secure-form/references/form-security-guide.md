# TYPO3 Form Security Guide

This guide details how to configure, harden, and secure frontend forms in TYPO3 v14 projects using `typo3/cms-form`, `evoweb/sf-register`, and `evoweb/recaptcha`.

## 1. Installation & Environment Config

Ensure extensions are installed in the root `composer.json` and active:

```bash
ddev composer require evoweb/recaptcha evoweb/sf-register
```

### Site Set Dependencies

In TYPO3 v14, ensure your site package set (e.g., `packages/my-site-package/Configuration/Sets/MySitePackage/config.yaml`) lists the dependencies so their resources, TypoScript, and form configurations are auto-loaded:

```yaml
name: my-vendor/my-site-package
dependencies:
  - evoweb/recaptcha
  - typo3/form
  - evoweb/sf-register-maximum
```

### Global API Credentials (`settings.php`)

To configure reCAPTCHA keys globally, edit the `config/system/settings.php` file under `EXTENSIONS.recaptcha`.

> [!IMPORTANT]
> **reCAPTCHA Enterprise / Google Cloud Fraud Defense Migration:**
> When migrating to Google Cloud / Fraud Defense, site keys are added to your Enterprise license. 
> - **Frontend Script:** Change the script URL to use the Enterprise JS library (`https://www.google.com/recaptcha/enterprise.js`).
> - **Backend Verification:** The legacy `siteverify` REST endpoint (`https://www.google.com/recaptcha/api/siteverify`) continues to be supported for migrated keys without backend changes. True enterprise-grade implementations may optionally migrate to GCP `assessments.create` (which requires GCP IAM Service Accounts).
> - **Testing Keys:** Unlike classic reCAPTCHA v2, reCAPTCHA Enterprise does not use public shared test keys. Instead, create environment-specific keys in the Google Cloud Console and configure **Testing Options** (e.g., `testing_score` or `testing_challenge`) to mock desired behaviors.

```php
        'recaptcha' => [
            // Standard/Enterprise JS API endpoint:
            'api_server' => 'https://www.google.com/recaptcha/enterprise.js',
            'enforceCaptcha' => '0',
            'invisible_private_key' => '', // Mapped from environment/credentials
            'invisible_public_key' => '',
            'lang' => '',
            'private_key' => '',
            'public_key' => '',
            'robotMode' => '0',
            // Legacy siteverify endpoint remains fully compatible for migrated enterprise keys:
            'verify_server' => 'https://www.google.com/recaptcha/api/siteverify',
        ],
```

Ensure sensitive production credentials are read from `.env` via `config/system/additional.php` or set in the live environment settings, keeping them out of source control.

---

## 2. Securing `typo3/cms-form`

### A. Register the Recaptcha Element

To make the `Recaptcha` field available to forms, register it under your site package's standard form prototype configuration (e.g., `packages/my-site-package/Configuration/Form/SiteForms/config.yaml`):

```yaml
prototypes:
  standard:
    formElementsDefinition:
      Recaptcha:
        properties:
          containerClassAttribute: 'mb-5'
```

### B. Configure Honeypot and reCAPTCHA in Form Definitions

Add spam protection layers directly inside form definitions (e.g. `Resources/Private/Forms/contactForm.form.yaml`):

```yaml
identifier: contactForm
type: Form
label: 'Contact Form'
prototypeName: standard
renderingOptions:
  submitButtonLabel: Submit
  # Enable invisible reCAPTCHA integration:
  useInvisibleRecaptcha: true
  # Enable the built-in honeypot protection:
  honeypot:
    enable: true

renderables:
  -
    type: Page
    identifier: page-1
    label: Contact
    renderables:
      # ... other fields ...
      
      # Add reCAPTCHA form element:
      -
        renderingOptions:
          doNotShowLabel: true
        type: Recaptcha
        identifier: recaptcha-1
        label: reCAPTCHA
        validators:
          -
            identifier: Recaptcha
```

---

## 3. Securing `evoweb/sf-register`

To prevent spam accounts, combine backend reCAPTCHA validation with a honeypot field in your Fluid registration templates.

### A. TypoScript Integration

Include the reCAPTCHA adapter and tell the registration validator to check the reCAPTCHA token during submission. Register these settings in your theme Site Set or template setup:

```typoscript
plugin.tx_sfregister {
    settings {
        # Bridge evoweb/recaptcha adapter into sf-register
        captcha {
            recaptcha = Evoweb\Recaptcha\Adapter\SfRegisterAdapter
        }
        
        fields {
            configuration {
                # Map the captcha field type to reCAPTCHA
                captcha.type = Recaptcha
            }
        }
        
        # Enforce validation on registration creation
        validation {
            create {
                captcha = Evoweb\SfRegister\Validation\Validator\CaptchaValidator(type = recaptcha)
            }
        }
    }
}
```

### B. Fluid Template Honeypot & reCAPTCHA Enterprise Fields

Override or edit the registration template (e.g., `packages/my-site-package/Resources/Private/SfRegister/Partials/Form/Captcha.html`):

#### 1. Add Honeypot Protection
Create a field styled with CSS to be invisible to users but visible to standard bots:

```html
<!-- Honeypot Field -->
<div class="sr-only opacity-0 absolute -z-50 pointer-events-none" aria-hidden="true">
    <label for="register-website">Leave this field blank</label>
    <input type="text" id="register-website" name="tx_sfregister_form[website]" tabindex="-1" autocomplete="off" />
</div>
```

Ensure backend controller action validates that this custom honeypot field remains empty.

#### 2. Add reCAPTCHA Enterprise Element
Using reCAPTCHA Enterprise score-based (v3 equivalent) detection in Fluid requires loading the enterprise script and invoking the `grecaptcha.enterprise` namespace rather than `grecaptcha`:

```html
<f:asset.script identifier="google_recaptcha_enterprise_api" async="true" src="https://www.google.com/recaptcha/enterprise.js?render={settings.captcha.recaptcha.public_key}" />
<f:asset.script identifier="recaptcha_enterprise_submission">
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('#your-registration-form-id');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            const tokenField = form.querySelector('.recaptcha-v3-token-field');
            if (tokenField && !tokenField.value) {
                event.preventDefault();
                // Call grecaptcha.enterprise instead of legacy grecaptcha
                grecaptcha.enterprise.ready(function() {
                    grecaptcha.enterprise.execute('{settings.captcha.recaptcha.public_key}', {action: 'registration'}).then(function(token) {
                        tokenField.value = token;
                        form.submit();
                    });
                });
            }
        });
    });
});
</f:asset.script>
```

---

## 4. Content Security Policy (CSP)

Using Google reCAPTCHA Enterprise requires loading external scripts, frames, and making background API calls. Add the following hosts to your CSP definition file (e.g., `config/sites/<site-id>/csp.yaml`):

```yaml
enforce:
  inheritDefault: true
  mutations:
    - mode: "extend"
      directive: "script-src"
      sources:
        - "https://www.google.com/recaptcha/"
        - "https://www.gstatic.com/recaptcha/"
    - mode: "extend"
      directive: "frame-src"
      sources:
        - "https://www.google.com/recaptcha/"
        - "https://recaptcha.google.com/"
    - mode: "extend"
      directive: "connect-src"
      sources:
        # connect-src is CRITICAL for Enterprise background token generation requests
        - "https://www.google.com/recaptcha/"
```

---

## 5. Verification & Testing

### A. Flush Caches
After making configuration changes, always flush TYPO3 caches:

```bash
ddev typo3 cache:flush
```

### B. Manual Verification Checklist
1. **Load Form:** Check that the reCAPTCHA Enterprise badge or checkbox renders correctly.
2. **Submit Empty:** Submit the form without generating a token (or blocking the script). Ensure the page reloads with a validation error.
3. **Submit Validated:** Complete the challenge and submit. Confirm successful transmission and receipt of success page.
4. **Inspect Console:** Check for any JavaScript errors or blocked resource warnings (specifically CSP `connect-src` or `script-src` violations).

### C. Playwright Automated Verification
For E2E or visual regression checks inside the DDEV container:

```bash
ddev exec "cd packages/my-site-package && npx playwright test --grep @vrt"
```

---

## 6. Troubleshooting

| Symptom | Cause | Solution |
|---|---|---|
| CAPTCHA does not render / blank space | Missing public site key or wrong script URL | Verify `public_key` in `settings.php` and `.env`. Check console for 403 or 404 errors. |
| Submission fails with "CAPTCHA invalid" | Wrong or mismatched keys | Ensure the site key and secret key are from the same GCP Project and match your domains. |
| `grecaptcha.enterprise is undefined` error | Enterprise script not loaded, or using legacy script | Ensure `api_server` is set to `/recaptcha/enterprise.js` and loaded correctly. |
| reCAPTCHA resource blocked (CSP) | Content Security Policy (CSP) violation | Whitelist `https://www.google.com/recaptcha/` and `https://www.gstatic.com/recaptcha/` in CSP. |
| Silent blocks or network failures | Missing `connect-src` in CSP | Ensure `https://www.google.com/recaptcha/` is included under the `connect-src` directive. |
| Testing environment warnings | Using legacy public v2 keys or lack of testing keys | Configure dedicated testing keys with mock scores/challenges in GCP console. |
