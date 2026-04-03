# Pitch Tool

A voice-first pitch generator that crafts cold emails, LinkedIn DMs, cover letters, interview prep guides, and elevator pitches — powered by Claude.

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Add your Anthropic API key
#    Edit .env.local and replace "your-api-key-here" with your real key
#    Get one at https://console.anthropic.com

# 3. Run the dev server
npm run dev

# 4. Open http://localhost:3000
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo
4. Add your environment variable:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your API key from console.anthropic.com
5. Click Deploy

That's it — Vercel handles everything else automatically.

## Project Structure

```
pitch-tool/
├── app/
│   ├── layout.js          # Root layout with fonts
│   ├── page.js            # Main pitch tool UI
│   └── api/
│       ├── generate/
│       │   └── route.js   # Server-side Anthropic API calls
│       └── scrape/
│           └── route.js   # Server-side company website scraping
├── .env.local             # Your API key (never committed to git)
├── .gitignore
├── next.config.js
├── package.json
└── README.md
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key from console.anthropic.com |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI**: Claude Sonnet via Anthropic API
- **Voice**: Web Speech API (Chrome, Safari, Edge)
- **Hosting**: Vercel
- **Cost**: ~$0.02-0.08 per generated output
