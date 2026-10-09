# GloGraph — Landing Page

> **UPDATE 2026-06-15 — GloGraph is completely free, full access, no tiers.** The Free/Pro model was
> dropped entirely (see HANDOFF Phase 78). The site has no pricing, no tier table, no Pro waitlist, and
> no Buy buttons; the primary CTA is the free download, with an email list for new builds. **Every
> section below mentioning Buy, `buy_intent`, `CHECKOUT_URLS`, a tier table, or a "Pro" tier is
> historical and does NOT apply** — there is no paid tier to reintroduce. `../specs/product/PRICING_AND_GTM_SPEC.md`
> is likewise superseded.

A **zero-build static site** (plain HTML + CSS + one small JS file) for GloGraph. Pre-launch its job is
**email capture** (`../specs/product/PRICING_AND_GTM_SPEC.md §6`); the original Buy-button demand test is
deferred until pricing is shown. Drop it on any static host.

It is intentionally framework-free and dependency-free — no npm install, no build step. Open
`index.html` in a browser and it works.

```
website/
├── index.html     # all page content, section order per PRICING_AND_GTM_SPEC §4
├── privacy.html   # privacy policy (cookieless analytics + email list; linked in the footer)
├── 404.html       # custom not-found page
├── styles.css     # industrial-workstation aesthetic (tokens mirror AESTHETIC_SPEC.md)
├── main.js        # CTA tracking + buy-button demand test + email capture (founder segmentation)
├── favicon.svg    # connected-nodes mark (matches the app logo)
├── og-image.svg   # 1200×630 social card source (assets/og-image-v3.png is generated from it)
├── assets/        # real app screenshots (hero + gallery) + og-image-v3.png
├── demo/          # GENERATED — the live demo IS the real app, built for the web
│                  #   (`vite build --mode demo`; source in src/demo/). Do not hand-edit.
├── LAUNCH_CHECKLIST.md  # stand-up + deploy status (live)
└── README.md      # this file
```

**Live:** https://glograph.com · redeploy with **`npm run deploy`** (from the repo root). The deploy
(`../GloGraphDesktopApplication/scripts/deploy-site.mjs`) publishes a copy of `website/` with all `*.md` excluded, so these internal
docs are never served. Unknown paths return `404.html`.
**Copy conventions (website):** sentence case, **no em dashes**, "GloGraph" capitalized, kicker labels
in UPPERCASE mono. Pricing shows Pro $49 (beta, rising back to ~$99). Legal: `/privacy` covers it now;
Terms/refund/EULA come at paid launch. (The all-lowercase voice is for the **social posts** in
`../specs/product/LAUNCH_POSTS.md`, not this site.)

## The live demo (`/demo/`) — the real app in the browser

The demo at https://glograph.com/demo/ is **the actual GloGraph application compiled for the web**,
not a separate viewer. `vite build --mode demo` (see `vite.config.ts`) builds the real
React/React Flow frontend with the five Tauri modules aliased to in-browser shims
(`../GloGraphDesktopApplication/src/demo/shims/`), and `invoke()` dispatched to an in-memory store seeded from the bundled
`../GloGraphDesktopApplication/demos/*.glograph` files (`../GloGraphDesktopApplication/src/demo/runtime.ts`). Output lands in `website/demo/` and is served at
`/demo/`. Source of truth: `../GloGraphDesktopApplication/src/demo/` (excluded from the app's `tsc` via `tsconfig.json`).

It is **fully interactive** in-session (add/move/connect/edit nodes, regions, undo/redo, tabs, Graph
Settings) with **hard demo limits**, all enforced in `../GloGraphDesktopApplication/src/demo/runtime.ts`:

- Nothing persists — a refresh resets everything (no `localStorage` for graph data, no disk).
- Save / CSV / PNG "export" become **browser downloads**; **Open Project** uses a file picker;
  the embedded HTTP API does not exist.
- You can create up to **255 graph objects** (nodes + regions) — shown in a header **objects badge**;
  a blocked create shows an inline notice (not a toast). You can open up to **6 project tabs**.
- The demo **resets every 30 minutes** — a header **timer badge** counts down, then reloads.
- A **first-visit tutorial** explains the interactions (reopen via the **"? Tutorial"** badge).
- The header is the **same `.nav` as the marketing site** (brand, links, Plex fonts, Buy button),
  with the **Founder's-deal strip** above it.

Build it standalone with **`npm run build:demo`**; **`npm run deploy`** builds it, then publishes the
whole site. (The old hand-built static viewer — `demo.html`/`demo.js`/`demo.css`/`demo-data.js` —
was replaced by this approach in 2026-06.)

---

## Run it locally

Just open the file:

```
# from this folder
start index.html            # Windows
```

Or serve it (so relative paths/analytics behave like production):

```
python -m http.server 8000  # then visit http://localhost:8000
```

No dependencies, no build.

---

## The demand test (the whole point)

Every call-to-action carries a `data-cta="..."` attribute. `main.js` logs each click through
`trackEvent()`. **Pre-launch, the Buy buttons deliberately have no checkout** — a click is recorded as
`buy_intent` and nudges the visitor to the email list. That click *is* the demand signal.

To read the signal you need analytics. Wire `trackEvent()` in `main.js` to your provider:

| Provider  | One-liner to drop into `trackEvent()`                         | Script tag in `<head>` |
|-----------|--------------------------------------------------------------|------------------------|
| Plausible | `window.plausible && window.plausible(name, { props })`      | from plausible.io      |
| Fathom    | `window.fathom && window.fathom.trackEvent(name)`            | from usefathom.com     |
| GA4       | `window.gtag && window.gtag('event', name, props)`           | from Google Analytics  |

Events emitted: `cta_click` (every CTA, with which one), `buy_intent` (a Buy click pre-launch),
`checkout_start` (a Buy click once checkout is configured), `notify_submit` (email capture).

> Privacy-friendly analytics (Plausible/Fathom) are recommended — they need no cookie banner and fit
> the local-first / own-your-data brand.

---

## Going live (turn the test into a store)

### 1. Wire the Merchant-of-Record checkout
Open `main.js` → `CONFIG.CHECKOUT_URLS` and paste your hosted-checkout links. Recommended MoR:
**Lemon Squeezy** (indie-friendly) — see `../specs/product/PRICING_AND_GTM_SPEC.md §2`.

```js
CHECKOUT_URLS: {
  pro:        "https://YOURSTORE.lemonsqueezy.com/checkout/buy/XXXX",
  commercial: "https://YOURSTORE.lemonsqueezy.com/checkout/buy/YYYY",
},
```

Once a URL is set, the matching Buy button (`data-checkout="pro"` / `"commercial"` in `index.html`)
redirects to checkout instead of running the demand test. For Lemon Squeezy's **overlay** checkout,
add their `lemon.js` script and the `lemonsqueezy-button` class — the data attributes are already in
place.

### 2. Wire the email list
In `index.html`, set the `action` on `<form id="notifyForm">` to your provider's embed endpoint
(Buttondown / ConvertKit / Mailchimp / Formspree). Example (Buttondown):

```html
<form id="notifyForm" action="https://buttondown.email/api/emails/embed-subscribe/YOURNAME" method="post">
```

With no `action`, the form runs as a demand test (shows a thank-you, no network call).

### 3. Visuals — already wired
The real app screenshots you added are already in use:

- **Hero:** `assets/agent-memory-hero.png` (a canvas crop of the system-map demo, in a window frame).
  Swap the `<img class="winchrome__shot">` for `assets/demo.gif` once the demo loop is ready.
- **Gallery:** `assets/agent-memory-screenshot.png` (System Map), then `macro-economics-demo.png`,
  `system-behavior-demo.png`, `knowledge-map-demo.png`, `project-tracker-demo.png`.

**Branding (built):**
- `favicon.svg` — the amber "G" mark, matching the app icon. Already linked in `<head>`.
- `og-image.svg` — 1200×630 social card source. **`assets/og-image-v3.png` is generated from it** and is
  what `og:image` points to (with `twitter:card` = summary_large_image). Regenerate after editing the
  SVG with the resvg-js pipeline (`@resvg/resvg-js` devDep; loads system fonts — no browser needed):
  ```
  node scripts/render-og.mjs
  ```
  > **Cache-busting:** social scrapers (X / Facebook / LinkedIn / Slack) cache the OG image by URL.
  > When the card changes, **bump the filename** (`og-image-v3.png`, …) and update the `og:image`
  > URL in `index.html` so the new card is treated as brand-new instead of a stale cache hit.

**Go-live:** see [`LAUNCH_CHECKLIST.md`](LAUNCH_CHECKLIST.md) for the steps gated on your accounts
(analytics, email, Merchant-of-Record checkout, hosting).

---

## Copy guardrails (keep these honest)

From `PRICING_AND_GTM_SPEC.md §1 / §7`:

- **"Maps, does not simulate."** GloGraph maps and queries typed relationships; it does **not** run
  numerical simulations. The hero, comparison, and FAQ all say so — don't remove it.
- **Pay once / own your data** is the brand. Never imply a subscription.
- Prices are the **beta** set: Pro **$49** (with an on-site notice it rises back to ~$99 as the app
  matures); founders (the first 200) **lock in the $49 price** before it rises. Updates are included for
  everyone and the site states no update policy (a one-time purchase implies it). Hypotheses; adjust
  after the demand test and first reviews.
- Match the app's aesthetic (`../specs/design/AESTHETIC_SPEC.md`, `../specs/design/STYLE_PHILOSOPHY.md`): warm-neutral
  charcoal, amber `#ffb000`, bevel borders, hard edges, mono numerics. No SaaS gradients/pills.

---

## Hosting

Any static host works — no server needed:

- **Cloudflare Pages / Netlify:** connect the repo, set the build output dir to `website/` (no build
  command).
- **GitHub Pages:** push and point Pages at this folder (or copy its contents to the Pages root).
- **Manual:** upload `index.html`, `styles.css`, `main.js`, and `assets/` to any static bucket/CDN.

Point a domain at it, add your analytics snippet, and the demand test is live.
