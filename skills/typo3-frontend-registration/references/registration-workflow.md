# Registration workflow reference

## State model

For the requested ordering — visitor confirmation first, administrator approval
second — sf_register uses this transition pair:

```typoscript
plugin.tx_sfregister.settings {
    confirmEmailPostCreate = 1
    acceptEmailPostConfirm = 1

    autologinPostRegistration = 0
    autologinPostConfirmation = 0

    # Replace with your actual PIDs — neither pending group may unlock the
    # protected page.
    usergroupPostSave    = 123   # group assigned immediately after registration
    usergroupPostConfirm = 124   # group assigned after email confirmation

    # The group assigned when the admin accepts the account.
    # sf_register v14 documents this as `usergroup` in the constants editor
    # ("usergroup set if no activation is needed" / final activation group).
    # Verify against your installed sf_register version: if `usergroupPostAccept`
    # is available (check Configuration/Index.html for your release), prefer it;
    # otherwise use `usergroup = 125`.
    usergroup = 125
}
```

`confirmEmailPostCreate` makes a newly saved account disabled and sends the
visitor confirmation flow. `acceptEmailPostConfirm` keeps it disabled after the
visitor has confirmed and opens the administrator acceptance flow. Assign the
group used by the protected page exclusively at the accept step.

The `evoweb/sf-register-maximum` site set is required for this workflow.
Configure the corresponding user/admin mail notifications and provide the
configured sender, reply-to address, storage PID, and redirect pages. Ensure
the intended UI includes an administrator Accept action; notification alone is
not approval.

### Email scanner protection

```typoscript
plugin.tx_sfregister.settings {
    enableConfirmationButtonForEmailLinks = 1
    forceConfirmationButtonForEmailLinks  = 1
}
```

`enableConfirmationButtonForEmailLinks` must be `1` for
`forceConfirmationButtonForEmailLinks` to take effect. Both set together ensure
that HEAD requests from email security scanners or link-preview clients cannot
advance account state by prefetching a confirmation URL.

The alternative setting pair, `acceptEmailPostCreate` plus
`confirmEmailPostAccept`, reverses the required order and must not be used for
this requirement.

## CAPTCHA boundary

`bw_captcha` is a CAPTCHA element for `EXT:form`; sf_register requires an
adapter extending `\Evoweb\SfRegister\Services\Captcha\AbstractAdapter`
implementing `render()` and `isValid()`. The official sf_register documentation
uses the `evoweb/recaptcha` adapter as the canonical example; follow the same
pattern for bw_captcha:

### Step 1 — Register adapter and field type

```typoscript
plugin.tx_sfregister.settings {
    # Register bw_captcha as a captcha adapter
    captcha.bwcaptcha = Vendor\YourSitepackage\Captcha\BwCaptchaAdapter

    fields {
        configuration {
            # Set the captcha field type to the key registered above
            captcha.type = bwcaptcha
        }
    }

    validation.create {
        # Wire server-side validation
        captcha = Evoweb\SfRegister\Validation\Validator\CaptchaValidator(type = bwcaptcha)
    }
}
```

### Step 2 — Create the adapter class

Add a class in the site package that extends
`\Evoweb\SfRegister\Services\Captcha\AbstractAdapter`. Delegate CAPTCHA
verification to bw_captcha's internal session/validation mechanism; do not
duplicate comparison logic.

```php
<?php
namespace Vendor\YourSitepackage\Captcha;

use Evoweb\SfRegister\Services\Captcha\AbstractAdapter;

class BwCaptchaAdapter extends AbstractAdapter
{
    public function render(): string
    {
        // Render the CAPTCHA input partial via Fluid or inline HTML.
        // Return the HTML string including the image, reload control,
        // and audio control. Include a labelled text input.
        return '';
    }

    public function isValid(mixed $value): bool
    {
        // Delegate to bw_captcha's session-based validation.
        // Return true only if the submitted value matches the stored phrase.
        return false;
    }
}
```

> **Note**: bw_captcha stores the expected phrase in the PHP session via
> `$_SESSION['bw_captcha']`. Validate `strtolower($value)` against
> `strtolower($_SESSION['bw_captcha'])` in `isValid()`. Unset the session key
> after a successful or failed validation to prevent replay. Verify the actual
> session key name against the installed bw_captcha version.

### Step 3 — Add the CAPTCHA field to Create only

If the field must be added at runtime, use a `ProcessInitializeActionEvent`
listener (sf_register's canonical PSR-14 event for modifying controller
settings before rendering):

```php
use Evoweb\SfRegister\Controller\Event\ProcessInitializeActionEvent;
use TYPO3\CMS\Core\Attribute\AsEventListener;

class AddCaptchaToCreateAction
{
    #[AsEventListener('yourext/add-captcha', ProcessInitializeActionEvent::class)]
    public function __invoke(ProcessInitializeActionEvent $event): void
    {
        if ($event->getController()::class ends with 'FeuserCreateController') {
            // Add the captcha field to the settings/fields array as needed.
        }
    }
}
```

Register the listener in `Configuration/Services.yaml`. Alternatively, if the
static sf_register field configuration supports it, add the field there and
skip the event listener.

### Step 4 — Render the CAPTCHA partial

Create a `CaptchaBwcaptcha.html` partial (or equivalent Fluid template) that
includes:

- A labelled `<input type="text">` for the CAPTCHA phrase
- The CAPTCHA image (route via bw_captcha's image action or PageType `3413`)
- A reload/refresh control with `aria-label`
- An audio button with `aria-label` (PageType `3414`)

Load bw_captcha's JavaScript once per page; re-initialize after any dynamic
rendering. Keep the CAPTCHA refresh/audio routes working if the project uses
trailing URL slashes.

Keep ARIA labels, refresh behaviour, and audio option intact to meet WCAG 2.1
AA requirements.

## Administrator acceptance workflow

The administrator receives an email notification (sent by sf_register) when a
user has completed email confirmation. The email contains Accept and Decline
action links.

1. The admin clicks **Accept** (or **Decline**) in the notification email.
2. sf_register's `FeuserAcceptController` processes the action, enables the
   account, and assigns the final group.
3. The visitor receives the acceptance (or decline) notification email.

If the notification email is not configured or the admin prefers the backend:

1. Open the TYPO3 backend → **List** module → navigate to the fe_users sysfolder.
2. Open the pending fe_users record.
3. Uncheck **Disable**, set the **Groups** field to the final access group, and save.
4. This bypasses sf_register's state machine and skips the acceptance
   notification email; only use as a fallback.

Grant backend editors only the narrowest access needed: read/write on the
fe_users sysfolder, no system admin rights.

## Login and access configuration

Include `typo3/felogin` in the custom site set and configure `felogin.pid` to
the same frontend-user storage folder. Add a login form content element on a
public login page. `getpost` redirect mode is suitable for returning to the
original protected request; restrict allowed redirect domains. Apply the final
group to the protected page's access restriction in TYPO3 page properties, not
only to a navigation item.

## Verification matrix

| Scenario | Expected state/access |
| --- | --- |
| Anonymous visitor opens protected page | No protected content; login/denial behaviour is shown. |
| Invalid or omitted CAPTCHA | Registration is rejected server-side; no `fe_users` record is created. |
| Valid registration before email confirmation | User is disabled, has only a non-access group, and cannot log in. |
| Email confirmation before admin acceptance | User remains disabled and cannot access the protected page. |
| Admin declines via email link | User remains unable to log in; the user receives the intended decline notice. |
| Admin accepts via email link | User is enabled and receives only the final protected group. |
| Admin accepts via List module | User is enabled; no sf_register acceptance notification is sent. |
| Accepted user signs in | felogin succeeds and reaches the requested protected page. |
| Confirmation URL is prefetched/scanned | With both confirmation-button settings enabled, no state changes until the visitor submits the button. |
| CAPTCHA keyboard and audio controls | Input, refresh, and audio controls are keyboard-accessible and labelled. |
| Effective sf_register settings | Frontend TypoScript shows enabled notifications and both scanner-protection settings after all site-set, TypoScript, and FlexForm overrides. |
| Registration and approval emails | Mailpit captures the expected user and administrator messages, with correct local links, rendered HTML and text bodies, and no unintended external recipient. |

After configuration or template changes, flush TYPO3 caches. Run the project's
static/TypoScript checks and an automated browser test where the project has an
acceptance-test harness.

## DDEV Mailpit email testing

DDEV captures PHP mail locally with Mailpit. Start the project and run:

```bash
ddev mailpit
```

This opens the project's Mailpit UI (normally
`https://<project>.ddev.site:8026`). Submit a test registration, inspect the
visitor's confirmation email, and follow its action only through the intended
confirmation flow. Then inspect the administrator notification, carry out the
accept or decline action, and verify the resulting visitor notification.

For each message, check the recipient, sender, reply-to address, subject,
plain-text and HTML bodies, and every link target. Include a registration that
renders each local `.txt` override: Fluid's normal template analyzer only
selects `*.fluid.*` files and does not validate sf_register mail templates.
The confirmation and approval links must use the local DDEV base URL. Mailpit
capture works when TYPO3 uses
the DDEV-provided sendmail transport; if TYPO3 is configured for an external
SMTP provider, point it at `localhost:1025` for local testing or use the
project's approved development mail configuration. Never copy real passwords,
confirmation hashes, or test mail contents into tickets or logs.

## Primary sources

- sf_register documentation: <https://docs.typo3.org/p/evoweb/sf-register/14.0/en-us/>
- sf_register extendability (captcha adapter): <https://docs.typo3.org/p/evoweb/sf-register/14.0/en-us/Extendability/Index.html>
- TYPO3 felogin documentation: <https://docs.typo3.org/c/typo3/cms-felogin/main/en-us/Index.html>
- bw_captcha repository and usage guidance: <https://github.com/maikschneider/bw_captcha>
- DDEV Mailpit documentation: <https://docs.ddev.com/en/stable/users/usage/developer-tools/>
