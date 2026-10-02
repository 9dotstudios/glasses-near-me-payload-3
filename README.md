# Glasses Near Me — Payload 3

Marketing site for [Glasses Near Me](https://glassesnearme.org): Payload CMS 3 and Next.js on Cloudflare Workers, D1, and R2. The app follows the Studios Payload Cloudflare template (OpenNext, Users, Media, Worker bindings) and is branded as its own project.

The public theme is built with [`@relume_io/relume-ui`](https://react-docs.relume.io/) and Tailwind CSS 3. Colors, type, and chrome follow the live Relume site: forest `#074F37`, near-black `#080706`, mint `#EAF9F4`, Fraunces headings, Inter body text, 16px radii, and the same header and footer information architecture. Directory, search-index, and geo JavaScript are not included.

## Stack

- Payload 3.90, Next.js 16, React 19
- `@payloadcms/db-d1-sqlite`, `@payloadcms/storage-r2`, `@opennextjs/cloudflare`
- `@relume_io/relume-ui` and `@relume_io/relume-tailwind` (Tailwind 3 — Relume does not support Tailwind 4 yet)

Node `>=24.15` and pnpm 9, 10, or 11.

## Run it locally

```bash
pnpm install
cp .env.example .env
# put a secret in .env — openssl rand -hex 32
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the seeded homepage and [http://localhost:3000/admin](http://localhost:3000/admin) to create the first user.

The first boot creates demo Pages when a slug is missing. Later edits in the admin are left alone. Set `SKIP_SEED=true` to disable that.

Local development uses Wrangler’s local D1 (Drizzle push). You do not need a Cloudflare account to view the theme. If you have already run `pnpm payload migrate` against that same local database, delete `.wrangler` before `pnpm dev` so push and migrations are not applied twice.

## Try a page

1. Sign in at `/admin` and open **Pages**.
2. The document with slug `home` is served at `/`. Other slugs map to that path with no leading slash. `find-a-shop/malaysia` is `/find-a-shop/malaysia`.
3. Build the layout from blocks: Hero, Search prompt, Feature grid, Process, Stats, Content feed, FAQ, CTA, Rich content, Logo strip, Two column.
4. Set the color scheme on each block (white, near-black, forest, white with green accent, mint).
5. Fill SEO title and description, save, and open the slug.

Seeded routes:

| Path | What it is |
| --- | --- |
| `/` | Home: hero, search chrome, features, process, countries, stats, guides, FAQ, claim CTA |
| `/about` | Method, coverage stats, FAQ |
| `/for-opticians` | Owner routes |
| `/for-opticians/claim-or-correct-a-listing` | Claim, correct, remove |
| `/guides` and four guide articles | Plain-English guide shells |
| `/find-a-shop`, `/find-a-shop/malaysia`, `/singapore`, `/australia` | Country hubs without the town index |
| `/add`, `/privacy-policy`, `/terms-of-use` | Owner and legal shells |
| `/blocks` | Logo strip and two-column, for reviewing those optional blocks |

Search fields keep the live layout (heading beside a Relume `Input` and `Button`) and submit to the hub. They do not query a shop index.

## Theme

- Tokens live in `src/app/(frontend)/styles.css` (`--color-forest`, schemes 1–5).
- `tailwind.config.ts` loads the Relume preset and overrides `background`, `text`, `border`, and `link` so Relume `Button` and form controls use ink `#1C1917` and accent `#0D9769` instead of stock Relume black.
- Tailwind preflight is off so `/admin` keeps Payload’s own reset.
- Header and footer are site chrome (`SiteHeader`, `SiteFooter`) matching the live nav: Find a shop, Guides, About, For opticians, Add your shop, and the same footer columns.

## Deploy

This app is an OpenNext Worker (Payload server, D1, R2, and `/admin`). Cloudflare Pages’ Next.js preset is a static HTML export and cannot host this stack, so the preview is a Worker on `*.workers.dev`, the same pattern as studios-payload. Do not attach `glassesnearme.org` or any other custom hostname. `wrangler.jsonc` sets `workers_dev: true` and has no `routes`.

Dedicated resources (do not reuse `studios-payload`):

| Resource | Name |
| --- | --- |
| Worker | `glasses-near-me-payload` |
| D1 | `glasses-near-me-payload-db` (`4403dc2d-fbce-474c-b527-2c2e47eaec6b`) |
| R2 | `glasses-near-me-payload-media` |

`PAYLOAD_SECRET` is a Worker secret, not a file in git. `pnpm deploy` runs `scripts/ensure-payload-secret.mjs`, which sets it with `wrangler secret put PAYLOAD_SECRET` only when it is missing and does not print the value. To set it yourself:

```bash
openssl rand -hex 32 | pnpm exec wrangler secret put PAYLOAD_SECRET
```

```bash
pnpm payload migrate:create   # after schema changes
pnpm generate:types
pnpm build && pnpm deploy
```

`pnpm build` is the OpenNext Cloudflare build (`next build --webpack`) plus the Workers PBKDF2 patch from the Studios template. `pnpm deploy` migrates remote D1, deploys the Worker, and creates `PAYLOAD_SECRET` if it is missing. This bundle is in the same size class as the Payload Cloudflare template and is meant for the Workers paid plan. Wrangler must already be logged in (`wrangler login` or `CLOUDFLARE_API_TOKEN`).

`wrangler.jsonc` targets the 9dot account resources above and sets `workers_dev: true` with no `routes`, so a logged-in deploy stays on `https://glasses-near-me-payload.<account-subdomain>.workers.dev`. The D1 binding is marked `remote: true` so `pnpm deploy` migrates that remote database. Local `pnpm dev` still uses Wrangler’s local D1, because remote bindings are enabled only when `NODE_ENV` is production.

The clickable preview from this environment is a temporary Workers account, because Wrangler here is not logged into the 9dot account (the Cloudflare API token can create D1 and R2, and cannot upload this Worker). That preview is `https://glasses-near-me-payload.aboard-second.workers.dev`. It has its own D1 database, no R2 binding, and no custom hostname. `PAYLOAD_SECRET` is set on that Worker and is not stored in git. Open `/admin` to create the first user. The temporary account must be claimed from the deploy report or Cloudflare deletes it.

After `wrangler login` on the 9dot account, `pnpm build && pnpm deploy` publishes this config onto that account’s `workers.dev` subdomain and the R2 bucket above. Still do not attach `glassesnearme.org`.

## Scripts

```bash
pnpm dev                 # Next.js dev server
pnpm test:int            # Payload API smoke test, including the seeded home page
pnpm generate:types      # Wrangler Env types and payload-types.ts
pnpm payload migrate     # apply src/migrations to the local D1
```

Migrations: the Studios users/media snapshots, plus `20261002_032654` for Pages and blocks.
