# Using this template

This repo is set up as a **GitHub template**: fork or “Use this template” to create a new project without carrying over git history you do not want.

## 1. Create your repo

On GitHub: **Use this template** → name your new repository → clone it locally.

## 2. Configure environment

1. Copy `.env.example` to `.env.local`.
2. Fill in every `NEXT_PUBLIC_*` variable. They control branding, contact info, social links, SEO text, and structured data (JSON-LD).  
3. Set `NEXT_PUBLIC_SITE_URL` to your real URL (e.g. `https://your-project.vercel.app` or your custom domain) **before** you care about correct Open Graph and sitemap URLs.
4. Add the same variables in **Vercel → Project → Settings → Environment Variables** for Production (and Preview if you use it).

Rebuild after changing `NEXT_PUBLIC_*` values (they are inlined at build time).

## 3. Replace content that is not env-driven

| Area | What to change |
|------|----------------|
| `src/data/menuData.ts` | Menu items, prices, images |
| `src/app/about/page.tsx` | Story, team copy, long-form text |
| `public/` assets | `favicon.ico`, logos, `Truck/`, `Food/`, `Menu_Images/` as needed |
| `public/llms.txt` | Facts for AI crawlers — align with your real address and links |
| `public/manifest.json` | PWA `name` / `short_name` |
| `tailwind.config.ts` | Colors under `desi.*` if you rebrand |

## 4. Optional: GitHub template settings

In the template repository settings, enable **Template repository** so the green “Use this template” button appears.

## 5. Deploy

Connect the new repo to **Vercel** (import project → select repo). Use the default Next.js preset; no separate “export `out/`” step is required.

## 6. Search Console

See `GOOGLE_VERIFICATION_SETUP.md` if you use Google Search Console (`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`).

---

**Tip:** Search the codebase for `Your ` and `example.com` only if you left generic defaults in `src/config/site.ts` — the template is designed to be driven by `.env.local` instead.
