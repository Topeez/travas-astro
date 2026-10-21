# Travas Stínění

Webová prezentace firmy Travas Stínění (stínící technika, garážová vrata, montáž a servis). Statický web postavený na Astro, nasazený na Cloudflare.

Produkce: https://travasstineni.cz/

## Obsah

- [Technologie](#technologie)
- [Požadavky](#požadavky)
- [Rychlý start](#rychlý-start)
- [Skripty](#skripty)
- [Struktura repozitáře](#struktura-repozitáře)
- [Konfigurace](#konfigurace)
- [Nasazení](#nasazení)
- [Poznámky k vývoji](#poznámky-k-vývoji)

## Technologie

| Oblast | Řešení |
| --- | --- |
| Framework | Astro 7 |
| UI komponenty | React 19 (Astro islands), Radix UI primitives |
| Styling | Tailwind CSS 4 (přes `@tailwindcss/vite`), `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate` |
| Formuláře a validace | React Hook Form, `@hookform/resolvers`, Zod |
| Ikony | `@lucide/astro`, `lucide-react`, `astro-icon` s Iconify sadami (`mdi`, `lucide`) |
| Písmo | Open Sans Variable (`@fontsource-variable/open-sans`) |
| Carousel | Embla Carousel |
| Notifikace a téma | Sonner, next-themes |
| SEO | `astro-seo-schema` (strukturovaná data), `@vercel/og` (OG obrázky) |
| Obrázky | `sharp` |
| Hosting | Cloudflare (konfigurace ve `wrangler.jsonc`) |
| Správce balíčků | pnpm |

## Požadavky

- Node.js (aktuální LTS)
- pnpm

Projekt vynucuje použití pnpm přes `preinstall` skript (`only-allow pnpm`). Instalace přes npm nebo yarn skončí chybou.

## Rychlý start

```bash
git clone git@github.com:Topeez/travas-astro.git
cd travas-astro
pnpm install
pnpm dev
```

Vývojový server běží standardně na `http://localhost:4321`.

## Skripty

| Příkaz | Popis |
| --- | --- |
| `pnpm dev` | Spustí vývojový server s HMR |
| `pnpm build` | Produkční build do složky `dist/` |
| `pnpm preview` | Lokální náhled produkčního buildu |
| `pnpm astro ...` | Přístup k Astro CLI (např. `pnpm astro check`) |

## Struktura repozitáře

```text
.
├── public/               Statické soubory servírované beze změny
├── schemas/              Schémata (např. strukturovaná data a validace)
├── src/
│   ├── assets/           Obrázky a další assety zpracovávané buildem
│   ├── components/       Astro a React komponenty
│   ├── data/             Datové podklady (služby, reference, kontakty)
│   ├── layouts/          Layouty stránek
│   ├── lib/              Pomocné funkce a utility
│   ├── pages/            Routing založený na souborech
│   ├── seo/              SEO komponenty a generování metadat
│   └── styles/           Globální styly a Tailwind
├── astro.config.mjs      Konfigurace Astro
├── wrangler.jsonc        Konfigurace Cloudflare
├── pnpm-workspace.yaml   Konfigurace pnpm
├── tsconfig.json         Konfigurace TypeScriptu
└── package.json
```

## Konfigurace

- `astro.config.mjs` obsahuje integrace (React, ikony) a Vite plugin pro Tailwind.
- `wrangler.jsonc` definuje nasazení na Cloudflare.
- `tsconfig.json` nastavuje TypeScript a případné path aliasy.
- `pnpm-workspace.yaml` obsahuje nastavení pnpm pro tento projekt.

Projekt aktuálně nevyžaduje žádné povinné proměnné prostředí pro základní běh. Případné tajné hodnoty nepatří do repozitáře.

## Nasazení

Repozitář je propojený s Cloudflare přes GitHub integraci. Push do produkční větve spustí automatický build a nasazení.

Postup při ručním ověření buildu:

```bash
pnpm build
pnpm preview
```

Pokud se build nespustí automaticky, zkontrolujte v Cloudflare dashboardu:

- nastavenou produkční větev a povolené automatické deploymenty,
- přístup Cloudflare GitHub aplikace k repozitáři,
- build watch paths a příznaky `[skip ci]` v commit zprávě.

## Poznámky k vývoji

- Store pnpm je možné přesměrovat mimo domovský adresář: `pnpm config set store-dir <cesta> --global`. Po změně je nutné znovu spustit `pnpm install`.
- Při chybách typů po instalaci nové závislosti restartujte TypeScript server v editoru (`TypeScript: Restart TS Server`).
- Adresář `.wrangler/` je lokální cache nástroje Wrangler a nemá být součástí verzování.

## Licence

Privátní repozitář, všechna práva vyhrazena.
