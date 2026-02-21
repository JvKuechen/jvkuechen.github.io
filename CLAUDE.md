# CLAUDE.md

Portfolio website for jvkuechen.com / setcookie.dev. Static site with no build step.

## Architecture

```
GitHub Pages (jvkuechen.github.io)         Homelab nginx (setcookie.dev)
  custom domain: jvkuechen.com               git-pull same repo
  always up (resume domain)                  can go down
         |                                          |
         +--- Same static files, JS domain router --+
         |
    Docsify fetches .wiki repos from GitHub raw URLs
    Cloudflare Worker proxies Groq API for chat widget
```

**Dual-domain routing:** `js/router.js` checks hostname:
- `jvkuechen.com` / `jvkuechen.github.io` -> portfolio landing
- `setcookie.dev` -> same for now, different default route later

## Tech Stack

- **Frontend:** Vanilla JS + Bootstrap 3 (Agency theme)
- **Wiki:** Docsify (client-side markdown renderer from CDN)
- **AI Chat:** Groq API via Cloudflare Worker proxy (`worker/`)
- **Hosting:** GitHub Pages (primary), homelab nginx (secondary)

## Development

```bash
python -m http.server 8000
# Main: http://localhost:8000
# Wiki: http://localhost:8000/wiki/
```

No build step. Edit HTML/CSS/JS directly, push to deploy.

## Directory Structure

```
index.html              # Main landing page + chat widget
404.html                # Error page
CNAME                   # GitHub Pages custom domain (jvkuechen.com)
css/                    # Theme variables, agency, chat widget, wiki theme
js/                     # Router, chat, quick actions
lib/                    # Vendor: Bootstrap, jQuery, agency.js
fonts/                  # Font Awesome
wiki/                   # Docsify wiki (index.html + sidebar + content)
demos/                  # Demo pages with homelab offline fallback
tools/security-dashboard/ # Security assessment tool
worker/                 # Cloudflare Worker source (not served by GH Pages)
```

## Key Files

- `js/router.js` - Domain-based routing (hostname check)
- `js/chat.js` - AI chat widget (Groq API via Cloudflare Worker)
- `js/quick-actions.js` - Deterministic quick action responses
- `wiki/index.html` - Docsify config (multi-repo wiki rendering)
- `worker/groq-proxy.js` - Cloudflare Worker for Groq API proxy
- `css/theme-vars.css` - Central color/typography variables

## Deployment

**GitHub Pages:** Push to main branch. Pages serves from root `/`.

**Cloudflare Worker:**
```bash
cd worker
npm install -g wrangler
wrangler login
wrangler secret put GROQ_API_KEY
wrangler deploy
```

**Homelab (setcookie.dev):** git pull on edge VM, nginx serves static files.

## Constraints

- All content must work as static files on GitHub Pages
- API keys proxied through Cloudflare Worker (never in frontend)
- Demo servers may be offline - always show graceful fallback
- Wiki content lives in .wiki repos, fetched at runtime by Docsify
