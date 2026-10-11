# Two-factor authentication and account security

Docktor can start, stop and delete every container on your host, so the account that signs in to it deserves more than a password. This page covers the second sign-in step (an authenticator app), recovery codes, requiring the second step for everyone, and the limit on sign-in attempts. For the bigger picture, see [Security](/security).

## Your account

The first account is created in the setup wizard. After that, self-registration is closed. Open **Account** from the user menu at the bottom of the sidebar to manage how you sign in. The **Security** section there holds everything below.

There is no screen for changing your password in v0.1.0, and no email-based password reset. If you lose access, an operator with shell access to the host can reset two-factor authentication (see [Lost your device and your recovery codes](#lost-your-device-and-your-recovery-codes)).

## Turning on two-factor authentication

You need an authenticator app, such as 1Password, Aegis or Google Authenticator.

1. On **Account**, under **Two-factor authentication**, choose **Set up two-factor authentication**. The dialog has three steps.
2. **Step 1 of 3.** Enter your password and choose **Continue**.
3. **Step 2 of 3, Save your recovery codes.** Docktor shows a set of ten recovery codes. Use **Copy codes** or **Download .txt**, store them somewhere safe, and tick **I have saved these recovery codes** to continue. They are shown once and cannot be displayed again.
4. **Step 3 of 3, Scan the QR code.** Scan the QR code with your authenticator app, or copy the setup key into it. Enter the 6-digit code the app shows under **Authentication code**, then choose **Verify and enable**.

Until you finish the last step the dialog can only be closed with **Cancel setup**, so you cannot end up half enrolled. When it succeeds, Docktor says "Two-factor authentication is on. Your other devices were signed out." The status then reads **Enabled**.

## Signing in with the second step

After you enter your email and password correctly, Docktor shows a second screen, **Two-factor authentication**:

- Enter the 6-digit **Authentication code** from your app and choose **Verify**.
- If you do not have your device, switch to **Use a recovery code** and enter one of your recovery codes. Each recovery code works once. **Use authenticator app instead** switches back.
- **Trust this device for 30 days** is an option on this screen, unticked by default. If you tick it, this browser skips the second step for 30 days. Without it, the code is always asked for.

## Recovery codes

Recovery codes are your way in when the authenticator is lost. On **Account**, **Regenerate recovery codes** creates a fresh set after you confirm your password; the old codes stop working immediately. Save the new set in the same way ("Save your new recovery codes").

## Turning it off

**Disable two-factor** (also behind your password) removes the second step, so the account is protected by the password alone. It is disabled while the instance requires two-factor for everyone; turn that requirement off first.

Whenever you turn two-factor on or off, or regenerate recovery codes, Docktor signs out your other devices and forgets your trusted browsers. Only the session you are using stays signed in.

## Requiring two-factor for everyone

On **Account**, the switch **Require two-factor for all users** makes the second step mandatory for the whole instance. Docktor asks you to confirm ("Require two-factor authentication?"). The switch is only available once you have turned on two-factor for your own account; this keeps you from locking yourself out.

Once it is on, anyone who signs in without two-factor is taken to **Account**, where a banner says "Two-factor authentication is required" and the setup dialog opens. They cannot use the rest of Docktor until they have finished enrolling. There is no grace period.

## Limit on sign-in attempts

To slow down password guessing, Docktor allows **5 attempts per 15 minutes per client IP** on sign-in, on entering two-factor codes and recovery codes, and on the password-confirmed actions above. When you go over, the form says "Too many attempts. Try again in N minutes." The count is kept in the database, so restarting Docktor does not reset it. Every other authentication request is allowed 100 times a minute.

### Behind a reverse proxy: set `TRUST_PROXY`

Docktor decides who is who by IP address. Behind a reverse proxy, every request seems to come from the proxy unless you tell Docktor how many proxies to trust. Without that, all your users share one bucket, and one person's failed attempts can lock everyone out of sign-in for 15 minutes.

Set `TRUST_PROXY=1` in `.env` when exactly one reverse proxy sits in front of Docktor, then restart. Leave it unset when people connect to Docktor directly. Docktor shows a warning at start-up if `BETTER_AUTH_URL` is `https://` and `TRUST_PROXY` is unset. The details, including the other accepted values, are in [Sign-in protection](/reference/deployment#sign-in-protection).

## Lost your device and your recovery codes

If you can no longer produce an authentication code or a recovery code, there is no way to recover them through the web interface. An operator with shell access to the host resets two-factor for that account with one command, after which you sign in with your password and set up two-factor again. The exact command, and a SQL alternative for when the container will not start, are in [Resetting two-factor authentication](/reference/deployment#resetting-two-factor-authentication).

## What the secrets protect

Docktor encrypts your two-factor secret and recovery codes with `BETTER_AUTH_SECRET`. If you ever change that secret, every enrolled authenticator and recovery code becomes unusable, and each user needs a reset and a fresh setup. Keep a copy of your `.env` file somewhere safe.
