# Cloudflare Pages deployment

## Recommended

This is a Vite + React project. For Cloudflare Pages, connect the repository and use:

- Build command: `npm run build`
- Build output directory: `dist`
- Node.js: 20+

The app is responsive and works on phone, tablet and desktop.

## Direct Upload

Cloudflare Pages **Direct Upload** accepts already-built static assets. This source ZIP is therefore not the direct-upload artifact; it must first be built with `npm run build`. After building, upload the contents of `dist/` to Pages.
