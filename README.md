# GaltonKS website

Marketing site for Galton AI (the `advisor-engine` product). One page: a live Galton
board hero, the number-check replay, the household risk profile, security, and a
contact form for booking meetings.

Next.js 16 (App Router) · Tailwind CSS 4 · Framer Motion · TypeScript

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Contact form

The form posts to `src/app/api/contact/route.ts`, which validates the request (same
rules as the form, in `src/lib/contact.ts`), drops bot submissions caught by a hidden
honeypot field, and then:

- **No email settings:** writes the request to the server log. Fine for trying it out.
- **With email settings:** emails it to you through [Resend](https://resend.com).

| Variable | Meaning |
|---|---|
| `RESEND_API_KEY` | Resend API key (secret) |
| `CONTACT_TO_EMAIL` | where meeting requests go |
| `CONTACT_FROM_EMAIL` | sender, e.g. `GaltonKS <hello@yourdomain.com>` (a domain verified in Resend). Defaults to Resend's test sender |
| `NEXT_PUBLIC_CONTACT_DEMO` | `1` makes the form simulate success without a server (used for the static preview only) |

To send requests to a CRM or calendar tool instead, replace the Resend call in the route.

## Deploy

Vercel is the simplest: import the repo, add the variables above, deploy. Any host that
runs Node works too (`npm run build && npm start`).

## Where things are

```
src/app/page.tsx            section order
src/app/globals.css         brand palette and fonts (from advisor-engine/web)
src/components/
  GaltonBoard.tsx           canvas animation in the hero
  Hero.tsx  Measures.tsx  Steps.tsx  NumberCheck.tsx  Household.tsx  Security.tsx
  Contact.tsx  Nav.tsx  Footer.tsx
  Logo.tsx                  ported from advisor-engine/web/src/components/Logo.tsx
src/lib/contact.ts          form fields, validation, submit
src/app/api/contact/route.ts  form endpoint
public/                     logo artwork, favicon, privacy policy PDF
```

## Notes

- Every animation respects the visitor's reduced-motion setting: the board renders
  finished and the replays show their final state.
- Portfolio and household figures on the page are illustrative examples, and the footer
  says so. Keep them that way unless a real, approved case study replaces them.
- Fonts (Newsreader, IBM Plex Sans) are self-hosted through Fontsource, so the page makes
  no third-party font requests.

## Product screenshots

`public/live/` holds real screens of the advisor-engine app (the `-app` frame and the `-card`
pulled forward), shown by `LiveShot.tsx`. To retake them after the product changes:

1. Run the product locally with dev auth (`uvicorn advisor_engine.api.main:app` and
   `VITE_DEV_USER=alice npm run dev` in `web/`), starting from an empty `data/api/`.
2. `python scripts/seed.py` loads the example Whitfield household and prints its ids.
3. `python scripts/live_shots.py <client> <before> <after>` writes PNGs to `live-raw/`;
   convert them to WebP in `public/live/`.

The shots hide dev-only header badges and the workspace tab bar (its assistant tab still
reads "Galton AI"). All figures come from synthetic returns and are illustrative.
