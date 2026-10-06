# Deploying to production

Written for the Plesk hosting at Ethio Telecom (`app.wisdomcourse.com.et`, Node.js 22). The same
steps work on any host that can run Node.js 20.9+ and reach a MySQL 8.0+ database.

What has been checked: a release built on Windows with `npm run deploy:plesk` was installed with
production dependencies only, set up against an empty database, and started with `node app.js`,
both on Windows and in a Linux container with Node.js 22 (health probe, pages, sign-in, access
control). What has not: the Plesk server itself. Steps that depend on that server are marked
**check on the server**.

## 1. Before you start

| You need | Notes |
|---|---|
| **MySQL 8.0+** | Required. Use a dedicated, initially empty database. The app does not support MariaDB or PostgreSQL. |
| Node.js 20.9+ | Plesk → Node.js shows 22.x: fine. |
| HTTPS | Plesk → SSL/TLS Certificates → install a free Let's Encrypt certificate and turn on "Redirect from http to https". Sign-in cookies are only sent over HTTPS. |
| Two secrets | `AUTH_SECRET` and `DATA_ENCRYPTION_KEY`, generated in §4. |
| A mailbox for sending | Plesk → Mail → create e.g. `no-reply@your-domain`. Used for password resets. |

**Rotate exposed passwords first.** Earlier versions of this repository (public on GitHub)
contained account passwords in seed scripts, and they remain in its history. Change the password
of every account that used them, and never reuse them. Passwords typed into chats or tickets
should be changed too.

## 2. The database

Create a dedicated MySQL 8 database and database user in Plesk → Databases, or use a managed MySQL
8 service that permits connections from the Plesk host. Confirm the database host, port (normally
3306), database name, username, and password with the provider. Percent-encode special characters
in the username or password before placing them in `DATABASE_URL`.

Run the first deployment against an empty database. The checked-in MySQL baseline creates the
application's tables; it will not import or convert data from the former PostgreSQL database.
Before cutover, export any data separately, transform and validate it in a staging database, and
keep the PostgreSQL backup until the MySQL deployment has been verified.

## 3. Folders in Plesk

Keep the application **outside** the folder the web server publishes, so `.env` and source files
can never be downloaded:

```
/app.wisdomcourse.com.et/            ← subscription folder
    app/                             ← Application Root (the code lives here)
        public/                      ← Document Root
        app.js                       ← Application Startup File
    private/uploads/                 ← UPLOAD_DIR (client photos and voice notes)
```

Plesk → Node.js:

| Setting | Value |
|---|---|
| Node.js version | 22.x |
| Application mode | production |
| Application root | `/app` |
| Document root | `/app/public` |
| Application startup file | `app.js` |

## 4. Settings (environment variables)

Put them in a file named `.env` in the Application Root (copy `.env.example`, fill it in, and
upload it with Plesk → Files; it is never part of the Git repository). The application and the
set-up scripts both read it. Plesk → Node.js → Custom environment variables also works for the
running application, but scripts started by Git's post-deployment actions do not see those, so the
file is the one place that always works. The server refuses to start, with a clear `[config]`
line in the log, when a required setting is missing.

| Name | Required | Value |
|---|---|---|
| `NODE_ENV` | yes | `production` |
| `DATABASE_URL` | yes | `mysql://USER:PASSWORD@HOST:3306/DATABASE` |
| `AUTH_SECRET` | yes | random, 32+ characters |
| `DATA_ENCRYPTION_KEY` | yes | a different random value, 32+ characters. **Keep a copy offline**: data encrypted with it cannot be read without it. |
| `APP_URL` | yes | `https://app.wisdomcourse.com.et` (no trailing slash) |
| `UPLOAD_DIR` | recommended | absolute path of `private/uploads` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` | recommended | the mailbox from §1. Without email (or Telegram) nobody can reset a forgotten password. |
| `CHAPA_SECRET_KEY`, `CHAPA_WEBHOOK_SECRET` | for online payments | from the Chapa dashboard. Set the webhook URL there to `<APP_URL>/api/payments/chapa/webhook`. Without them payments are recorded by hand. |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET` | optional | create the bot with @BotFather, then run `npm run telegram:setup` to configure its webhook and commands. |
| `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_NUMBER`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_TEMPLATE_NAME` | optional | WhatsApp updates and replies through Meta's Cloud API. Steps, including the webhook and the message template, are in `docs/MESSAGING.md`. |

Generate each secret on your own computer:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### Telegram setup

1. In Telegram, message `@BotFather`, run `/newbot`, and save its token privately.
2. Add `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME` (without `@`), and the production HTTPS `APP_URL` to the application's `.env`.
3. From the application root, run `npm run telegram:setup`. It verifies the token/username, generates `TELEGRAM_WEBHOOK_SECRET` in `.env` if needed, configures the `/start`, `/status`, `/stop`, `/help`, and `/privacy` commands, and registers `<APP_URL>/api/telegram/webhook`.
4. Restart the application so it reads the webhook secret. In @BotFather, run `/setdomain` and select the exact public hostname used by `APP_URL`; this enables the account's Telegram Login Widget.
5. Sign in to the website and connect Telegram from `/account`: **Connect Telegram** opens the bot with a one-time code (press Start), or use the login button. Case updates, reviewer messages, bookings and payments then arrive in the chat, and replies in the chat go to the reviewer.

Never paste the bot token or webhook secret into chat or commit them. Telegram accounts are linked with the official signed login widget or a signed one-time connect code; password reset links expire after one hour. The review loop, the reviewer's analysis and WhatsApp set-up are described in `docs/MESSAGING.md`.

## 5. Mobile installation

The site is an installable Progressive Web App (PWA), not a separate native application. Serve it over HTTPS. On Android, open the site in Chrome and choose **Install app** (or use the in-page Install prompt). On iPhone/iPad, open it in Safari, tap **Share**, then **Add to Home Screen**. The service worker caches public app pages and read-only knowledge data for offline use; sign-in, account data, bookings, messaging, and submissions still require a connection.

## 6. Getting the code onto the server

### Route A — Plesk Git (the repository already connected in Plesk)

Plesk → Git → `wa.git` → settings:

- Deployment directory: the Application Root (`/app`).
- Deployment mode: **Manual** for the first release, so you choose the moment. Switch to
  Automatic once a release has gone through cleanly.
- Enable post-deployment actions and enter:

```bash
export PATH=/opt/plesk/node/22/bin:$PATH
npm ci --include=dev
npm run build
npm run db:setup
mkdir -p tmp && touch tmp/restart.txt
```

`npm run build` compiles the site on the server. It needs roughly 2 GB of memory and a few
minutes; shared hosting may stop it. **Check on the server**: if the build is killed or times out,
use Route B, which needs no build on the server.

### Route B — upload a ready-made release

On your computer, in the project folder:

```bash
npm run deploy:plesk
```

This builds the site and writes `plesk-release.zip` (about 30 MB). Then:

1. Plesk → Files → open the Application Root → upload the zip → Extract files.
2. Plesk → Node.js → **NPM install**.
3. Plesk → Node.js → **Run script** → `db:setup`.
4. Plesk → Node.js → **Restart App**.

## 7. First set-up of the database

`npm run db:setup` (run by Route A's actions, or step 3 of Route B) does two things, both safe to
repeat on every release:

- `db:migrate` builds the schema on an empty database and applies pending MySQL migrations
  exactly once. `npm run db:status` shows what is applied and pending without changing anything.
- `db:reference` adds the system roles, the Ethiopian food-composition tables and the
  herb–medicine safety reference.

## 8. Your administrator account

Plesk → Node.js → Run script:

```
admin:create -- --email you@your-domain --name "Your Name"
```

The output shows a one-time password once. Sign in at `<APP_URL>/auth` and change it immediately.
To choose the password yourself instead, add `ADMIN_PASSWORD` to the environment for that one run
and remove it afterwards. No account or password is created by the code on its own.

## 9. Check that it is live

1. `https://app.wisdomcourse.com.et/api/health` shows `{"status":"ok"}` (it checks the database).
2. The home page loads over HTTPS; signing in works.
3. Plesk → Logs: a line `[config] environment ok`, and no `[config]` errors. `[config]` warnings
   name optional features that are switched off (email, payments).
4. Request a password reset for your own account and confirm the email arrives.
5. Make a test booking with a second account, including a photo upload, and open it in the
   business workspace. With two browser windows open, a new message should appear without
   refreshing. If it only appears after a refresh, add `proxy_buffering off;` under Plesk →
   Apache & nginx Settings → Additional nginx directives.

## 10. Backups

| What | How |
|---|---|
| Database | Daily. Use your database provider's automatic backups, or `npm run db:backup` from any machine that can reach the database (writes `backups/<name>-<date>.sql`). Keep copies off the server and test a restore with `mysql --host=HOST --user=USER --password DATABASE < file.sql`. |
| Uploads (`UPLOAD_DIR`) | Plesk → Backup & Restore, scheduled, including the `private` folder. |
| Secrets | `DATA_ENCRYPTION_KEY` and `AUTH_SECRET`, stored offline. |

## 11. Releasing an update

- Route A: push to `main`, then Plesk → Git → Deploy (or let Automatic do it).
- Route B: `npm run deploy:plesk`, upload and extract over the old files, NPM install, run
  `db:setup`, Restart App.

Migrations only add to the database, so going back means deploying the previous release. Take a
database backup before any release that includes a new file in `drizzle-mysql/`.

Generate schema changes with `npm run db:generate`; inspect the resulting MySQL SQL and commit it
with the corresponding change to `src/lib/db/schema`. Do not edit the initial migration or any
migration that has already been released. MySQL DDL implicitly commits, so repair a partially
applied migration before retrying it.

## 12. Before inviting real clients

These need people, not code:

- A pharmacist or other qualified reviewer checks the herb–medicine safety reference (Admin → Safety).
- The manuscript index entries marked "needs cultural review" are reviewed.
- Terms of use and the privacy policy are reviewed against Ethiopian personal-data law. The
  application stores medicines taken, pregnancy status, photos and voice notes.
- Chapa is switched from a test key to a live key, and one real payment is made and refunded.
