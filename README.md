# Desi Flavors Katy

**Live site:** [desiflavorskaty.vercel.app](https://desiflavorskaty.vercel.app)

Go click that. Order something. Come back if you are still curious about the code. We will wait.

---

This repo powers the website for **Desi Flavors Katy**—Indian street food out of Katy, Texas, where the hard questions include “dum biryani or masala dosa?” and “how spicy is *spicy*?” The site exists so nobody has to dig through three apps and a group chat just to figure out what we serve and how to get it in front of their face.

If you are a developer: hi, thanks for reading. If you are here because someone dropped a GitHub link in your lap with zero explanation: also hi. The food is real, the truck is real, and the menu has opinions.

## What is actually on the site

- **Home** — Photos, energy, and a reason to stay longer than five seconds  
- **Menu** — Full spread with vegetarian flags, heat warnings, and the occasional item that will judge you if you order mild  
- **About** — The story, the truck, the “why Katy?” energy  
- **Catering** — For when your office or your cousin’s wedding needs trays, not tiny samples  
- **Order** — Big friendly buttons that send people to Square and the delivery apps so nobody gets lost  

We are not trying to win a minimalist design award for an empty white page. We are trying to make you hungry and then hand you a link.

## Stack, but make it quick

Next.js (App Router), React, Tailwind, Framer Motion when a section needs a little drama, and Vercel for hosting. No separate “upload the `out/` folder” step—`git push` and let Vercel run `next build`. If you wanted a forty-bullet architecture doc, wrong README; this one believes in sunlight and garlic.

## Run it on your machine

You need Node.js. Then:

```bash
npm install
npm run dev
```

Your terminal will nag you with a URL—usually `http://localhost:3000`. Open it. Hot reload will do its thing while you pretend you are not refreshing every twelve seconds.

Production build (same command Vercel runs):

```bash
npm run build
```

Optional: `npm start` after a build to smoke-test the production server locally.

## Secrets and env files

Copy `.env.example` to `.env.local` and fill in the blanks: maps, optional analytics, anything else the build whines about. If the map looks like a sad gray rectangle, it is almost never your destiny—it is usually a missing key.

## Deploy

**Vercel** is the happy path: push, build, done. If you graduate to a custom domain, bump `SITE_URL` in `src/lib/siteUrl.ts` so Open Graph, sitemaps, and robots.txt do not tell lies about where the site lives.

## Cool people disclaimer

Contributions and issues are welcome if you are fixing a bug or making the experience better for guests. Drive-by refactors that “simplify” the brand voice into corporate oatmeal will be read with the same suspicion as unsalted butter.

---

**Order online:** [Square site](https://desiflavorskaty.square.site/) (linked from the live site too—no Easter egg hunt required.)

Built for people who like flavor, loud colors, and websites that admit they are selling food. Business questions? Hit the contact info on the live site. Code questions? Open an issue or bribe your friend with chaat.
