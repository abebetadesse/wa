# Case review, analysis and chat delivery

How a request travels from the person to a reviewer and back, what the reviewer's analysis contains, and how to switch on Telegram and WhatsApp.

## 1. The loop

```text
Person submits a request
  → analysis and draft report are built        (src/server/cases/analysis.ts, domains/)
  → the assigned role is notified               (Admin → Case routing decides which role)
  → person is told "We received your request"

Reviewer claims the request (/case-review)
  → person is told "A reviewer has started"
  → reviewer reads the analysis, edits the report, may ask the person a question
        → person answers in the app, or by replying on Telegram / WhatsApp
        → the answer is added to the request and the analysis is rebuilt
  → reviewer completes the checklist, writes a note and approves
  → person is told "Your report is ready", with the reviewer's note
```

Every update is an in-app notification first (`notify()` in `src/server/marketplace/notifications.ts`). The same call forwards it to each chat app the person connected and left switched on (`deliverToUser()` in `src/server/messaging/accounts.ts`), so anything the platform tells a person reaches their Telegram or WhatsApp too: case updates, reviewer messages, bookings and payments.

### Privacy rule

Chat apps show previews on a phone other people may see. When the safety screen raised any concern for a request (for example possible violence at home), updates about it say only that there is news and link to the app. The reviewer's words stay behind the sign-in. The rule lives in `src/server/cases/notices.ts` and is covered by tests.

## 2. The reviewer's analysis

Built when a request is submitted, rebuilt when the person adds information, and available on demand with **Run analysis again**. It is stored with the case and never sent to the person.

| Part | What it is |
| --- | --- |
| Factors | Things the person said about their situation (sleep, money pressure, conflict, grief …), each with the sentence that shows it. Vocabulary: `src/server/cases/analysisLexicon.ts`. |
| Likely causes | Ranked hypotheses. Factors that commonly drive each other are joined ("Money pressure is feeding the conflict"); each cause quotes the person and carries a confidence label. |
| Proposed steps | A cautious plan per cause, plus advice from knowledge findings the person named directly. Medical, medicine and herbal items are marked as needing a professional's confirmation. |
| Knowledge by strand | All eleven strands are queried. A finding is kept only when the person's words, an extracted entity or their profile supports it, and the reason is shown ("Kept because …"). |
| Reflections | Cultural and astrological findings (Domain B), listed apart from causes and withheld while a safety signal is active. |
| Engines | Urgency detector, cross-strand integration, herb–medicine interactions, fasting calendar, agro-ecological zone and Rift Valley fluoride where the case and profile make them relevant. |
| Data quality | A 0–100 score, what was used, what is missing, and follow-up questions the reviewer can send with one click. |

Career and legal requests publish cultural and spiritual reflection only. For those, the evidence findings are shown to the reviewer as background but cannot be inserted into the report with one click.

Profile data (age, gender, region, medicines, conditions) is used only when the person consented to data usage when opening the case.

## 3. Review desk

`/case-review/{caseId}` for administrators and any role with `cases:review` that a case type is routed to.

- **Add to report** copies a cause, plan, finding or reflection into the report as a new section.
- The report editor changes the title, summary and every section, reorders and removes sections, and marks sections as full-report only. **Save draft** keeps the work without releasing it.
- **Ask and wait for a reply** sends a question; the case shows "your reviewer is waiting" until the person answers.
- **Approve and send response** releases the edited report with the reviewer's note.

## 4. Telegram

1. Create a bot with @BotFather and set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_BOT_USERNAME`.
2. Run `npm run telegram:setup` on the server. It registers the webhook (`/api/telegram/webhook`), generates `TELEGRAM_WEBHOOK_SECRET` and sets the bot's commands. Restart the app afterwards.
3. Optional: send `/setdomain` to @BotFather if you also want the "Log in with Telegram" button.

People connect from **Account → Telegram → Connect Telegram**: the button opens the bot with a one-time code and they press Start. The login button remains as an alternative.

## 5. WhatsApp

WhatsApp uses Meta's WhatsApp Business Cloud API. You need a Meta business account with a WhatsApp number added to an app.

| Variable | Where it comes from |
| --- | --- |
| `WHATSAPP_ACCESS_TOKEN` | A permanent system-user token with the `whatsapp_business_messaging` permission. |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Manager → API setup → Phone number ID. |
| `WHATSAPP_BUSINESS_NUMBER` | The number itself, international format (`+2519…`). Used for the connect link. |
| `WHATSAPP_APP_SECRET` | Meta app → Settings → Basic → App secret. Verifies incoming webhooks. |
| `WHATSAPP_VERIFY_TOKEN` | Any random value you choose. |
| `WHATSAPP_TEMPLATE_NAME`, `WHATSAPP_TEMPLATE_LANG` | An approved template (see below). |

Then, in the Meta app under **WhatsApp → Configuration**:

1. Callback URL: `https://YOUR-DOMAIN/api/whatsapp/webhook`. Verify token: the value of `WHATSAPP_VERIFY_TOKEN`.
2. Subscribe to the `messages` field.

People connect from **Account → WhatsApp → Connect WhatsApp**: the button opens a chat with the connect message typed in, and they press Send.

### The 24-hour rule and the template

WhatsApp lets a business send free-form text only within 24 hours of the person's last message. Outside that window a pre-approved template is required. Create one in WhatsApp Manager (category Utility) with two body variables, for example:

```text
{{1}}

{{2}}
```

`{{1}}` receives the title and `{{2}}` the text and link. Set its name in `WHATSAPP_TEMPLATE_NAME`. Without a template, updates still reach people who wrote to the number in the last 24 hours and are logged as failed for everyone else.

## 6. What people can send to the bot

| Message | Effect |
| --- | --- |
| The connect code (sent by the connect button) | Links the chat to the account. Codes work once and for 15 minutes. |
| `STATUS` (or `/status`, `ሁኔታ`) | Lists their recent requests. |
| `STOP` (or `/stop`, `አቁም`) | Turns updates off for that chat app. |
| `HELP`, `PRIVACY` | Explains the bot. |
| Anything else | A reply to the reviewer. It joins the request with an open question, otherwise the newest request under review. |

A chat that is not connected to an account cannot write into any case.

## 7. Checking the set-up

**Admin → Sign-up & Telegram → Updates and replies by chat** shows which parts are on. At start-up the server also logs a `[config]` warning for a partly configured WhatsApp or a Telegram bot without a webhook secret.

Database: the WhatsApp columns are added by `drizzle-mysql/0002_whatsapp_channel.sql` (`npm run db:migrate`).

Tests: `src/tests/case-analysis.test.mjs` and `src/tests/messaging.test.mjs`.
