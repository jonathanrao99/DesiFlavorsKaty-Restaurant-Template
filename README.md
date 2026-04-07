# Restaurant site template (Next.js + Vercel)

**Use this as a GitHub template:** see **[TEMPLATE.md](./TEMPLATE.md)** for the full checklist (env vars, content to replace, deploy).

**Demo / live example:** [yourflavorskaty.vercel.app](https://yourflavorskaty.vercel.app) (your brand).

---

Brand, contact, social, SEO, and JSON-LD are driven by **`NEXT_PUBLIC_*` environment variables** (see `.env.example`). After creating a new repo from the template, copy `.env.example` → `.env.local`, fill in your values, and mirror them in Vercel.

This codebase was originally built for **your brand** (Indian street food in Katy, Texas). Fork it, change the env and content, and make it yours.

If you are a developer: hi, thanks for reading. If you are here because someone dropped a GitHub link in your lap with zero explanation: also hi. The food is real, the truck is real, and the menu has opinions.

## What is actually on the site

- **Home** — Photos, energy, and a reason to stay longer than five seconds  
- **Menu** — Full spread with vegetarian flags, heat warnings, and the occasional item that will judge you if you order mild  
- **About** — The story, the truck, the “why Katy?” energy  
- **Catering** — For when your office or your cousin’s wedding needs trays, not tiny samples  
- **Order** — Big friendly buttons that send people to Square and the delivery apps so nobody gets lost  

We are not trying to win a minimalist yourgn award for an empty white page. We are trying to make you hungry and then hand you a link.

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

Copy `.env.example` to `.env.local` and add at least `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` if you want maps to work locally. Optional: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` for Search Console—see `GOOGLE_VERIFICATION_SETUP.md` if you are setting that up.

## Deploy

**Vercel** is the happy path: push, build, done. Set `NEXT_PUBLIC_SITE_URL` to your production URL (and your custom domain when you add one) so Open Graph, `robots.txt`, and `sitemap.xml` stay correct.

## Cool people disclaimer

Contributions and issues are welcome if you are fixing a bug or making the experience better for guests. Drive-by refactors that “simplify” the brand voice into corporate oatmeal will be read with the same suspicion as unsalted butter.

## License

Released under the [MIT License](LICENSE). You can use this template for your own restaurant, client work, or learning—just keep the copyright and license notice in copies of the source you distribute. If you fork for a new brand, updating the copyright line in `LICENSE` for your own project is fine.

---

**Order link** is configured with `NEXT_PUBLIC_ORDER_URL` (e.g. Square, Toast, or your ordering page).

Built for people who like flavor, loud colors, and websites that admit they are selling food. Business questions? Hit the contact info on the live site. Code questions? Open an issue or bribe your friend with chaat.
