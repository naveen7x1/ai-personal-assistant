# Deploy and Host Personal AI Assistant on Railway

An open source personal AI assistant you can text. Message it on Telegram or iMessage and it searches the web, works on a computer of its own and sends files back to you.

Sign in, a paid plan and error tracking are already set up, so you start from a working product and change whatever you like.

[Watch it being built on YouTube](https://www.youtube.com/watch?v=5B1FGk3CMyg)

## Features

- Private chats on Telegram and iMessage, with the same agent behind both
- Live web search, page reading and structured data from marketplaces, travel sites and listings
- A Linux sandbox per user with a shell and files that stay between chats
- Send it a PDF, photo or document and it can send files and screenshots back
- The first message gets a sign in link, so every chat belongs to an account
- Only users on the Pro plan reach the agent, everyone else gets an upgrade link
- Long tasks run as background jobs with retries, up to 30 minutes per turn

## Before you deploy

This template deploys the webhook server. The agent itself runs on Trigger.dev, and Railway will ask you for the URLs and secrets of two Trigger.dev webhook endpoints. Deploy the tasks to Trigger.dev first:

```bash
git clone https://github.com/code-with-antonio/ai-personal-assistant.git
cd ai-personal-assistant
npm install
```

Put your Trigger.dev project ref in `.env` as `TRIGGER_PROJECT_REF`, then run:

```bash
npx trigger.dev@4.8.3 deploy
```

In the Trigger.dev dashboard, open the production `telegram` and `linq` webhook endpoints and copy the URL and secret of each one.

## About Hosting Personal AI Assistant

The template deploys one service from the [public repository](https://github.com/code-with-antonio/ai-personal-assistant): a Hono server that receives the Telegram and iMessage webhooks. It checks each message, links the sender to an account, checks their plan and passes the message to the agent on Trigger.dev. Everything else is a managed service you connect with a key.

| Service         | What it does here                                | Needed   |
| --------------- | ------------------------------------------------ | -------- |
| **Clerk**       | Sign in and Billing for the Pro plan             | Yes      |
| **Neon**        | Postgres for linked accounts and the AI Gateway  | Yes      |
| **Trigger.dev** | Runs the chat agent and the account linking task | Yes      |
| **Telegram**    | A bot from @BotFather                            | Yes      |
| **Daytona**     | One cloud sandbox per user                       | Yes      |
| **Firecrawl**   | Web search, scraping and structured data         | Yes      |
| **Linq**        | iMessage                                         | Optional |
| **Sentry**      | Errors, logs, traces and AI monitoring           | Optional |

## Variables

Railway asks for these when you deploy.

| Variable                                                          | Where to find it                                 |
| ----------------------------------------------------------------- | ------------------------------------------------ |
| `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`                       | Clerk dashboard, under API keys                  |
| `DATABASE_URL`                                                    | Neon, the pooled connection string               |
| `TRIGGER_SECRET_KEY`                                              | Trigger.dev, your production secret key          |
| `TELEGRAM_WEBHOOK_SECRET`                                         | Any random string. You give it to Telegram later |
| `TRIGGER_TELEGRAM_WEBHOOK_URL`, `TRIGGER_TELEGRAM_WEBHOOK_SECRET` | Trigger.dev, the production `telegram` endpoint  |
| `TRIGGER_LINQ_WEBHOOK_URL`, `TRIGGER_LINQ_WEBHOOK_SECRET`         | Trigger.dev, the production `linq` endpoint      |
| `LINQ_API_V3_API_KEY`, `LINQ_WEBHOOK_SECRET`                      | Linq dashboard. Leave empty if you skip iMessage |
| `SENTRY_DSN`                                                      | Sentry. Leave empty if you don't use it          |

## After you deploy

**1. Create the database tables**

Put your Neon direct connection string in `.env` as `DATABASE_URL_UNPOOLED`, then run:

```bash
npm run db:push
```

**2. Add the task variables in Trigger.dev**

Add these to the production environment of your Trigger.dev project: `DATABASE_URL`, `CLERK_OAUTH_ISSUER`, `CLERK_OAUTH_CLIENT_ID`, `CLERK_OAUTH_CLIENT_SECRET`, `NEON_AI_GATEWAY_BASE_URL`, `NEON_AI_GATEWAY_TOKEN`, `TELEGRAM_BOT_TOKEN`, `DAYTONA_API_KEY` and `FIRECRAWL_API_KEY`. Add `LINQ_API_V3_API_KEY` if you use iMessage and `TRIGGER_SENTRY_DSN` if you use Sentry.

The three `CLERK_OAUTH_*` values come from a confidential OAuth app in Clerk with the Device Authorization Grant turned on.

**3. Set up billing in Clerk**

Turn on Billing and create a user plan with the slug `pro`. Without it every message gets an upgrade link.

**4. Point Telegram at your Railway domain**

```bash
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -d "url=https://YOUR_RAILWAY_DOMAIN/telegram/webhook" \
  -d "secret_token=YOUR_TELEGRAM_WEBHOOK_SECRET"
```

For iMessage, set `https://YOUR_RAILWAY_DOMAIN/linq/webhook` as the `message.received` webhook in Linq.

Now message your bot, open the sign in link, subscribe to Pro and start chatting.

## Common Use Cases

- A starting point for your own assistant product that people text instead of opening an app
- An assistant that does errands on the web, like comparing prices, checking availability and summarising pages
- Learning how webhooks, account linking over chat, durable agent runs and sandboxes work together in a real codebase

## Dependencies for Personal AI Assistant Hosting

- A [Clerk](https://clerk.com) application with Billing and an OAuth app with the Device Authorization Grant
- A [Neon](https://neon.com) project with Postgres and an AI Gateway
- A [Trigger.dev](https://trigger.dev) project with the tasks deployed
- A Telegram bot from [@BotFather](https://t.me/BotFather)
- A [Daytona](https://www.daytona.io) API key and a [Firecrawl](https://firecrawl.dev) API key
- Optionally a [Linq](https://linqapp.com) account for iMessage and a [Sentry](https://sentry.io) project

### Deployment Dependencies

- [Source code and local setup](https://github.com/code-with-antonio/ai-personal-assistant)
- [Clerk Billing](https://clerk.com/docs/billing/overview)
- [Trigger.dev deployment](https://trigger.dev/docs/deployment/overview)
- [Telegram setWebhook](https://core.telegram.org/bots/api#setwebhook)
- [Neon connection strings](https://neon.com/docs/connect/connect-from-any-app)

## Why Deploy Personal AI Assistant on Railway?

The webhook server is the only part of the assistant that needs a server. Railway builds it from GitHub and gives it the public HTTPS domain that Telegram and Linq send messages to.

Built by [Code With Antonio](https://www.codewithantonio.com).
