# NoteScript

Student SaaS that turns study material into handwritten-style notes using **rule-based processing** (no generative AI).

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- MongoDB + Mongoose
- JWT httpOnly sessions (jose + bcryptjs)
- Paddle billing + webhooks
- Tesseract OCR, unpdf, youtube-transcript

## Quick start

```bash
cp .env.example .env.local
# Set AUTH_SECRET (32+ chars) and MONGODB_URI
npm install
# Start MongoDB locally, then:
npm run dev
```

Open http://localhost:3000

For local note generation without email:

```
AUTH_SKIP_EMAIL_VERIFICATION=true
```

## Scripts

```bash
npm run dev
npm run build
npm start
npm run typecheck
npm run lint
npm test
```

## Environment

See `.env.example` for:

- `MONGODB_URI`, `AUTH_SECRET`
- Paddle: `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, price IDs
- OCR / YouTube flags

Webhook URL: `POST /api/webhooks/paddle`

## Plans (server-enforced)

| | Free | Student | Pro |
|---|---|---|---|
| Text | 3 total | Unlimited | Unlimited |
| PDF | — | Yes | Yes |
| Image | — | 3/mo | Unlimited |
| YouTube | — | — | Yes |
| Diagrams | — | 3/mo | Unlimited |

Plans activate only after verified Paddle webhooks — never from frontend alone.
