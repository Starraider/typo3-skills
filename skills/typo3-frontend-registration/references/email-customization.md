# sf_register email customization

## Scope and notification names

sf_register v14 renders an HTML notification template named after the recipient,
controller, and action. For the Create workflow, the relevant names are:

| Recipient and event | Notification switch | Template |
| --- | --- | --- |
| Visitor saved registration / must confirm | `notifyUserPostCreateSave` | `Email/NotifyUserCreateSave.html` |
| Administrator after visitor confirmation / must decide | `notifyAdminPostCreateConfirm` | `Email/NotifyAdminCreateConfirm.html` |
| Visitor accepted | `notifyUserPostCreateAccept` | `Email/NotifyUserCreateAccept.html` |
| Visitor declined | `notifyUserPostCreateDecline` | `Email/NotifyUserCreateDecline.html` |

Enable only the messages that serve the chosen state flow:

```typoscript
plugin.tx_sfregister.settings {
    notifyUserPostCreateSave = 1
    notifyAdminPostCreateConfirm = 1
    notifyUserPostCreateAccept = 1
    notifyUserPostCreateDecline = 1
}
```

The extension also supports `CreateRefuse`, `CreateSave`, `CreateConfirm`,
`CreateAccept`, and `CreateDecline` notifications for both recipient types.
Check the installed `Resources/Private/Templates/Email/` directory before
overriding an optional notification. Exact names changed from the old
`PostCreate…` naming convention; in v14 they are `Notify{User|Admin}Create…`.

## Use site-package template paths

Do not edit files in `EXT:sf_register` or `vendor/`. Copy only the templates
that need different content into the site package, preserving the `Email/`
subdirectory. Add the site package as the later (higher-priority) path:

```typoscript
plugin.tx_sfregister.view {
    templateRootPaths.10 = EXT:customer_sitepackage/Resources/Private/Templates/SfRegister/
    partialRootPaths.10 = EXT:customer_sitepackage/Resources/Private/Partials/SfRegister/
    layoutRootPaths.10 = EXT:customer_sitepackage/Resources/Private/Layouts/SfRegister/
}
```

For example, create:

```
EXT:customer_sitepackage/Resources/Private/Templates/SfRegister/Email/
├── NotifyUserCreateSave.html
├── NotifyAdminCreateConfirm.html
├── NotifyUserCreateAccept.html
└── NotifyUserCreateDecline.html
```

The mail renderer supplies `user` and `settings` to each template. Usual safe
fields include `{user.username}`, `{user.firstName}`, `{user.lastName}`, and
`{settings.sitename}`. Treat all submitted fields as untrusted: Fluid escapes
values by default. Do not use `f:format.raw` for user-provided values.

The standard templates use `Email` as their layout. A local template can retain
`<f:layout name="Email" />`; create a matching local layout only when the email
wrapper itself must change.

## Improved templates for the approval flow

These examples are intentionally text-first: they work when images are blocked,
make the required action explicit, and do not expose credentials or hashes.

### Visitor: confirm the registration

`Email/NotifyUserCreateSave.html`:

```html
<html xmlns:f="http://typo3.org/ns/TYPO3/CMS/Fluid/ViewHelpers"
      xmlns:register="http://typo3.org/ns/Evoweb/SfRegister/ViewHelpers"
      data-namespace-typo3-fluid="true">
<f:layout name="Email" />

<f:section name="Main">
    <p>Hello <f:if condition="{user.firstName}">{user.firstName}<f:else>{user.username}</f:else></f:if>,</p>
    <p>Thank you for registering with {settings.sitename}. Please confirm that
        you control this email address. Your account will remain inactive until
        it has been reviewed and approved.</p>
    <f:variable name="form" value="{f:if(condition: '{settings.enableConfirmationButtonForEmailLinks} == true', then: 'Form')}" />
    <p>
        <register:link.action arguments="{user: user.uid}" action="confirm{form}"
            controller="FeuserCreate" absolute="true">Confirm email address</register:link.action>
    </p>
    <p>If you did not request this registration, you can safely ignore this email.</p>
</f:section>
</html>
```

### Administrator: review a confirmed registration

`Email/NotifyAdminCreateConfirm.html`:

```html
<html xmlns:f="http://typo3.org/ns/TYPO3/CMS/Fluid/ViewHelpers"
      xmlns:register="http://typo3.org/ns/Evoweb/SfRegister/ViewHelpers"
      data-namespace-typo3-fluid="true">
<f:layout name="Email" />

<f:section name="Main">
    <p>A registration has been confirmed and needs your review.</p>
    <p>Account: {user.username}<br>Email: {user.email}</p>
    <p>Accepting enables access to the protected area. Declining keeps the
        account disabled and sends the visitor the decline notice.</p>
    <f:variable name="form" value="{f:if(condition: '{settings.enableConfirmationButtonForEmailLinks} == true', then: 'Form')}" />
    <p>
        <register:link.action arguments="{user: user.uid}" action="accept{form}"
            controller="FeuserCreate" absolute="true">Accept registration</register:link.action><br>
        <register:link.action arguments="{user: user.uid}" action="decline{form}"
            controller="FeuserCreate" absolute="true">Decline registration</register:link.action>
    </p>
</f:section>
</html>
```

The `register:link.action` helper is essential. It produces the correct route
and state parameters; preserve its `absolute="true"` attribute for email.
When confirmation buttons are enabled, retain the `{form}` suffix so a link
opens the scanner-safe confirmation page instead of bypassing it.

For the accepted and declined templates, plainly state the outcome, identify
the site, and give a contact path. Do not promise access until acceptance has
actually occurred. For example: “Your registration for {settings.sitename} has
been approved. You can now sign in at [login-page URL].” A decline email should
avoid sensitive eligibility details: “Your registration could not be approved.
If you think this is an error, contact [support mailbox].”

## Plain-text alternatives

sf_register renders a text part when a `.txt` template with the same name is
available. Add it beside its HTML template, for example
`Email/NotifyUserCreateSave.txt` or `Email/NotifyAdminCreateConfirm.txt`.

Text templates are parsed as Fluid but do not have an HTML root element. Import
sf_register ViewHelpers on the first line with Fluid's inline syntax. The `f`
namespace is predefined; do **not** add `xmlns:*` attributes to `f:` or
`register:` tags. In a `.txt` template those attributes are parsed as
ViewHelper arguments and cause `UndeclaredArgumentException`.

```text
{namespace register=Evoweb\SfRegister\ViewHelpers}
<f:variable name="form" value="{f:if(condition: '{settings.enableConfirmationButtonForEmailLinks} == true', then: 'Form')}" />
Please confirm your email address for {settings.sitename}:
<register:link.action arguments="{user: user.uid}" action="confirm{form}" controller="FeuserCreate" absolute="true">Confirm email address</register:link.action>
```

Use the same supplied variables and generated action links as the HTML part,
but put each link on its own line with descriptive text. A normal login URL in
an accepted-registration message may be a standard absolute URL or a generated
page link; only confirmation, accept, decline, and refuse URLs must use
`register:link.action`. Never make the HTML part the only place that states an
action or outcome.

## Subjects, sender, and reply-to

sf_register looks up subjects using keys such as
`subjectNotifyUserCreateSave` and `subjectNotifyAdminCreateConfirm`, passing
the site name as `%1$s` and the username as `%2$s`. Override those source
labels in an XLIFF file from the site package, registered as a TYPO3 language
override, rather than changing the extension's XLIFF files. Keep subjects short
and action-oriented, for example:

| Key | Suggested subject |
| --- | --- |
| `subjectNotifyUserCreateSave` | `Please confirm your email address for %1$s` |
| `subjectNotifyAdminCreateConfirm` | `Registration awaiting review: %2$s` |
| `subjectNotifyUserCreateAccept` | `Your %1$s registration has been approved` |
| `subjectNotifyUserCreateDecline` | `Update on your %1$s registration` |

Configure `sitename`, and the nested `userEmail.*` / `adminEmail.*` sender,
reply-to, and admin-recipient settings. Verify that reply-to directs a visitor
to a monitored support mailbox and that administrative notices are not sent to
a shared public address.

## Review checklist

- The template/action pair matches the enabled notification switch.
- The user confirmation and administrator accept/decline links use
  `register:link.action`, are absolute, and keep the scanner-safe `{form}`
  suffix.
- The email explains one clear next action, its effect, and how to get help.
- HTML and text bodies contain the same essential information; no message
  relies on an image, CSS colour, or ambiguous “click here” link text.
- The administrator email contains only data needed for review.
- Mailpit confirms recipients, subject, sender, reply-to, text/HTML body, and
  local absolute links after a cache flush.
- Confirm the effective frontend TypoScript enables the notification and both
  scanner-protection settings; a source `settings.yaml` value alone is not
  evidence that the rendered plugin uses it.
- Do not rely on `fluid:analyze` for these files: it analyses `*.fluid.*`, not
  sf_register's `.html` or `.txt` mail templates. Trigger the notification in
  a safe local flow and inspect both parts in Mailpit.

## Sources

- sf_register v14: Emails: <https://docs.typo3.org/p/evoweb/sf-register/14.0/en-us/Configuration/Emails/Index.html>
- sf_register v14: Templating: <https://docs.typo3.org/p/evoweb/sf-register/14.0/en-us/Templating/Index.html>
- Installed `evoweb/sf-register` v14 mail service and default email templates
  (used to verify template resolution, variables, and action links).
