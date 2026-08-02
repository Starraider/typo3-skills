# typo3-frontend-registration

Use when setting up or reviewing a TYPO3 protected frontend area with
self-registration, email confirmation, administrator approval, CAPTCHA, group
assignment, and frontend login using `felogin`, `sf_register`, and
`bw_captcha`.

## What this skill solves

It produces a reviewable, secure registration-to-access workflow. A visitor
submits a CAPTCHA-protected registration, confirms their email, waits for an
administrator to accept the account, then logs in with `felogin` to reach a
page restricted to the final frontend-user group. It also shows how to override
sf_register's visitor and administrator notifications with clear Fluid HTML and
plain-text email templates.

## Use when

- Adding this approval-gated frontend registration flow to a TYPO3 v14 project.
- Reviewing why newly registered users can log in too early or cannot reach a
  protected page after approval.
- Integrating `bw_captcha` with `sf_register`'s Create form and needing
  server-side validation wiring.
- Understanding how an administrator should accept or decline a pending
  registration from the TYPO3 backend or via email action links.
- Replacing the default sf_register confirmation, approval, acceptance, or
  decline email copy while preserving generated action links.

## Expected outputs

- Site package and TYPO3 configuration for the three extensions.
- A CAPTCHA adapter class, registration partial, and server-side validation
  wiring.
- Site-package email template overrides, localized subject guidance, and
  accessible HTML/plain-text notification copy.
- An account-state design and evidence from the end-to-end verification matrix.

## Context requirements

- TYPO3 version, Composer dependencies, and the site package/site-set layout.
- IDs for the user storage folder, pages, and final frontend-user group.
- A test mailbox and the approval policy/administrator recipient.

## Installation

This repository uses the portable Agent Skills project location:
`.agents/skills/typo3-frontend-registration/`.

The same directory also works in compatible project locations, including
`.claude/skills/`, `.cursor/skills/`, `.opencode/skills/`, and `.qoder/skills/`.

## Example prompts

- "Set up an approval-gated member area in our TYPO3 14 site with sf_register
  and felogin."
- "Add bw_captcha to the sf_register create form and make invalid CAPTCHAs fail
  server-side."
- "Review why a confirmed user can log in before the administrator has accepted
  them."
- "Explain how the administrator approves a pending sf_register registration."
- "Replace our sf_register confirmation and admin-approval emails with clearer
  text while keeping the links scanner-safe."

## Validation

Run the structural validator from the `new-skill` source, then verify a fresh,
confirmed-only, rejected, and accepted test user against the matrix in
`references/registration-workflow.md`.

## Related skills

- `typo3-secure-form` — securing TYPO3 EXT:form forms and configuring
  reCAPTCHA; relevant when bw_captcha is not the chosen provider.
- `typo3-site-config-sets` — deciding where site-handling configuration belongs
  in TYPO3 v14 site sets; relevant for step 2 (dependency declaration).

## License

Follow the license of the containing project. This skill does not redistribute
extension source code.
