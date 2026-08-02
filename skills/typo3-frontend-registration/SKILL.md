---
name: typo3-frontend-registration
description: Use when setting up or reviewing a TYPO3 protected frontend area with self-registration, email confirmation, administrator approval, CAPTCHA, group assignment, and frontend login using felogin, sf_register, and bw_captcha.
---

# TYPO3 Protected Frontend Registration

## Outcome

Implement or review a TYPO3 v14 protected area in which a visitor can register,
prove control of their email address, be approved by an administrator, and only
then authenticate with `felogin`. The registration form is protected by
`bw_captcha`; the final account receives the group that unlocks the protected
page.

This skill owns the integration, its end-to-end verification, and the technical
implementation of clear, accessible notification emails. It does not choose
privacy policy or membership eligibility rules.

## Workflow

1. Establish the account-state contract before changing configuration.

   Identify the frontend-user storage folder; four page IDs (registration,
   confirmation, login, protected target); the final frontend-user group; the
   administrator mailbox; sender/reply-to addresses; and whether user
   confirmation must occur before administrator approval. Use this state order:

   `submitted (disabled)` → `email confirmed (disabled)` → `admin accepted
   (enabled, final group)`.

   Completion: no state before the final transition can authenticate or holds
   the group used by the protected page.

2. Install dependencies and add their site sets.

   Run from the project root:

   ```bash
   composer require evoweb/sf-register typo3/cms-felogin blueways/bw-captcha
   ```

   In the site package `Configuration/Sets/Rskv/config.yaml`, add:

   ```yaml
   dependencies:
     - typo3/felogin
     - evoweb/sf-register-maximum
     - blueways/bw-captcha
   ```

   Configure the same `fe_users` storage PID for sf_register and felogin.
   Never add a second login mechanism.

   Completion: the site sets resolve, the login can find created user records,
   and `ddev composer install` exits cleanly.

3. Configure sf_register for email confirmation followed by administrator
   acceptance.

   Select the Create plugin/action on the registration page. Use the exact
   TypoScript settings and the confirmed group assignments in
   [the registration workflow reference](references/registration-workflow.md).
   The key pair is `confirmEmailPostCreate = 1` (visitor confirmation first)
   and `acceptEmailPostConfirm = 1` (admin approval second).

   Keep `autologinPostRegistration = 0` and `autologinPostConfirmation = 0`.
   Assign non-access groups during the interim states; assign the final
   protected-area group only at acceptance.

   Enable `enableConfirmationButtonForEmailLinks = 1`, then also set
   `forceConfirmationButtonForEmailLinks = 1` to prevent security scanners or
   link-preview features from advancing account state via a HEAD/GET request
   alone.

   Inspect the effective frontend TypoScript after site-set and plugin
   configuration are merged. Do not assume a value in `settings.yaml` is active:
   a FlexForm, TypoScript override, or missing import can leave an effective
   notification or scanner-protection setting disabled.

   Completion: a new account remains disabled through email confirmation and
   is enabled only by the administrator-accept action; enabling either autologin
   setting must be treated as a regression.

4. Customize the visitor and administrator emails.

   Configure the notification switches for every message that is needed, then
   override only the matching Fluid email templates in the site package. Use
   the template paths, supplied variables, safe action-link helpers, and
   improved copy patterns in [the email customization reference](references/email-customization.md).

   In the confirmation-before-acceptance workflow, the essential templates are
   `NotifyUserCreateSave` (visitor confirmation request),
   `NotifyAdminCreateConfirm` (administrator review with accept/decline
   links), `NotifyUserCreateAccept`, and `NotifyUserCreateDecline`. The
   acceptance template should state the outcome and give the normal login URL;
   it does not need a state-changing action link. Provide HTML and plain-text
   variants where practical; emails must not depend on images, colour, or
   button styling to convey their meaning.

   Never hand-build confirmation, accept, decline, or refuse URLs. Generate
   them with `register:link.action` and retain
   `enableConfirmationButtonForEmailLinks` plus
   `forceConfirmationButtonForEmailLinks`. Do not include passwords,
   confirmation hashes, or more submitted personal data than the recipient
   needs.

   In `.txt` Fluid templates, import custom ViewHelpers using Fluid's inline
   namespace syntax, for example
   `{namespace register=Evoweb\SfRegister\ViewHelpers}`. The `f` namespace is
   predefined. Do not put `xmlns:f` or `xmlns:register` on a ViewHelper tag:
   the text-template parser treats those attributes as ViewHelper arguments and
   throws `UndeclaredArgumentException`. See the text-template pattern in
   [the email customization reference](references/email-customization.md).

   Completion: every enabled notification has a clear subject, identifies the
   next action and expected result, preserves extension-generated action links,
   and renders both MIME bodies without a Fluid exception.

5. Configure the administrator acceptance workflow.

   The administrator accepts or declines a pending registration from the TYPO3
   backend. There are two supported approaches — choose one:

   a. **Email action links** (recommended): sf_register sends the admin a
      notification email with Accept and Decline links. Ensure `notify.admin`
      and the notify-to address are set. The link targets the `Accept` and
      `Decline` actions on the site-package confirmation page; these must be
      publicly reachable without backend login.

   b. **List module**: The admin opens the fe_users record in the List module,
      unchecks `Disable`, and manually assigns the final group. This bypasses
      sf_register's state machine and skips the acceptance notification email;
      only use as a fallback.

   In both cases, grant the administrator only the least-privileged TYPO3
   backend access needed (typically: read + write on the fe_users sysfolder,
   no backend admin rights).

   Completion: an accept action enables the account and assigns the final group;
   a decline action leaves the account disabled; the user receives the
   appropriate notification in both cases.

6. Integrate `bw_captcha` with sf_register.

   `bw_captcha` is a TYPO3 Form CAPTCHA element; sf_register requires an
   adapter extending `\Evoweb\SfRegister\Services\Captcha\AbstractAdapter`.
   Follow the four-step adapter boundary in
   [the registration workflow reference](references/registration-workflow.md):

   - Create the adapter class in the site package.
   - Register it and the field type in TypoScript.
   - Wire server-side validation with `CaptchaValidator`.
   - Add the CAPTCHA field to the Create form only, using a `ProcessInitializeActionEvent`
     listener or the static sf_register field configuration.

   Do not use a CAPTCHA that only renders without server-side validation.

   Completion: missing or invalid CAPTCHA prevents the `fe_users` record from
   being saved; a valid CAPTCHA works with page caching and keyboard/audio use.

7. Configure access and login.

   Add the felogin content element to the login page. Configure a safe redirect
   flow (`getpost` is appropriate for returning to a requested protected page)
   and allowed redirect domains. Restrict the protected page to the final
   group in page access settings. Keep the registration, confirmation, and
   login pages publicly reachable.

   Completion: anonymous visitors are redirected or denied at the protected
   page, while only a final-group user gains access after login.

8. Validate the entire state machine in a safe test environment.

   Run the project's configuration/static checks, flush TYPO3 caches, and
   execute every row in [the verification matrix](references/registration-workflow.md#verification-matrix).
   In a DDEV project, use `ddev mailpit` to inspect the captured confirmation,
   administrator approval, acceptance, and decline messages. Confirm their
   recipients, sender/reply-to values, accessible text, and action URLs point
   to the expected local base URL; do not send test registrations to production
   recipients. `fluid:analyze` only scans `*.fluid.*` files, so it does not
   validate sf_register's `.html` or `.txt` mail templates; Mailpit or a
   controlled render is required for those files.

   Completion: every negative path remains unable to log in, and the approved
   final-group account can access the protected page.

## Safety

Creating or modifying user groups, frontend-user records, page restrictions,
email routing, site settings, and database schema changes project state. Inspect
existing values first; do not overwrite a production user, group, mailbox, or
page restriction without explicit authorization. Use a test mailbox and test
account for verification. Never log CAPTCHA solutions, passwords, confirmation
hashes, or access tokens. Treat administrator acceptance as a backend action
with least-privileged editorial access.

## Resources

- [Registration workflow reference](references/registration-workflow.md) — exact
  sf_register TypoScript settings, bw_captcha adapter boundary, and verification
  matrix.
- [Email customization reference](references/email-customization.md) — Fluid
  template overrides, subjects, action links, and accessible email-copy patterns.
