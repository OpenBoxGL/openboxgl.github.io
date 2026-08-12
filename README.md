# OpenBoxGL Documentation

The public OpenBoxGL documentation site is published at https://openboxgl.github.io.

This repository contains the Next.js site source (static export, deployed to GitHub Pages) plus a small backend server for API endpoints when self-hosting. The application source and maintenance documents remain at https://github.com/vindeckyy/OpenBoxGL.

## Static site

```bash
bun install
bun run test        # builds docs index + static export + verifies all routes
bun run dev         # Next.js dev server
bun run build       # static export into out/
```

## Backend server (optional)

The site is fully static on GitHub Pages. When you want the API endpoints, run the server:

```bash
bun run build       # produces out/
bun run serve       # node server/index.mjs, serves out/ + /api/*
```

See [server/README.md](server/README.md) for the endpoint list, Docker usage, and deploy notes. The GitHub Pages static site and the server mode are independent; nothing in CI depends on the server.

## Content

Docs live in `content/docs/` as MDX/Markdown with frontmatter (`title`, `description`, optional `sidebar: false`). The sidebar tree is built in `lib/docs.ts`; add a new page there to place it. Home page sections live in `components/` and are composed in `app/page.tsx`.
