# Life in the UK Trainer — Mobile + Cloudflare

This version removes the original 1024px mobile block and adds a dedicated phone layout.

## Mobile fixes

- The 248px desktop sidebar is hidden below 768px.
- A compact mobile header is shown at the top.
- A six-item bottom navigation is fixed to the safe area.
- Main content uses the full phone width.
- Question cards and answer options reflow without horizontal overflow.
- Question navigation becomes horizontally scrollable.
- Keyboard-only hints are hidden on touch devices.
- Common 2/3/4/8-column layouts collapse for small screens.
- Tables can scroll horizontally rather than stretching the page.

## Cloudflare

This is a Vite source project. Build it with:

```bash
npm ci
npm run build
```

The resulting `dist/` directory is the static site to upload to Cloudflare Pages/Workers Assets.

For Cloudflare Workers, `wrangler.toml` points the assets directory at `./dist`.
