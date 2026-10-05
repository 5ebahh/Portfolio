# Sebastian Vega — portfolio

Live at **sebavega.com** (GitHub Pages, domain from Porkbun).

Plain HTML, CSS and JavaScript. There's no build step: upload this folder's
contents as-is to any static host. All links are relative, so you can also
open `index.html` directly.

## Publishing on GitHub Pages

1. Create a public repository named `yourusername.github.io`.
2. Upload everything inside this folder (so `index.html` is at the top level).
3. Settings → Pages → Deploy from a branch → `main` / `(root)`.
4. In Porkbun DNS for sebavega.com, remove the default parking records, then add
   four A records (blank host) pointing to GitHub's Pages IPs and a `www` CNAME
   pointing to `yourusername.github.io` (see GitHub's "Managing a custom domain").
5. Settings → Pages → Custom domain: `sebavega.com`, then tick Enforce HTTPS.
6. Add `sebavega.com` and `www.sebavega.com` to the Adobe Fonts kit `rzu3vfi`.

To update the site later: edit the files, then commit and push with GitHub
Desktop (or upload the changed files on github.com).

To test it locally with the Salted font, run this in the folder and open
http://localhost:8000:

    python3 -m http.server 8000

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home (hero, about, experience, three favorites) |
| `work.html` | Selected work (with the fishbowl) |
| `gallery.html` | Photography (coming soon) |
| `contact.html` | Contact (pixel desk with LinkedIn, Instagram and Resume buttons) |
| `unitedairlines.html`, `yelp.html`, `cura.html` | UX case studies |
| `scopemagazine.html`, `cinnamontoastpunk.html`, `bauhausai.html` | Graphic design case studies |

## The assets folder

Every CSS and JS file starts with a comment explaining what it does and
how it's organised. Start there.

| File | Used on | What it does |
| --- | --- | --- |
| `styles.css` | every page | Colours, fonts, navbar, footer, homepage |
| `hero.css` | home | The first screen of the homepage |
| `home-notes.css` | home | Sticky notes and favorites cards |
| `work.css` | work | Selected Work page and fishbowl layout |
| `case-pages.css` | project pages | The six case studies |
| `contact.css` | contact | The desk scene and the computer screen |
| `site.js` | every page | Phone menu and page loader |
| `home.js` | home | Pixel art, stationery placement and dragging |
| `home-notes.js` | home | Favorites cards lift on hover |
| `scroll-cue.js` | home | The "Scroll" arrow |
| `paper-motion.js` | work + project pages | Scroll-in motion and card hover |
| `work-fishbowl.js` | work | The fish, its jump and Mr. Blue |
| `contact-desk.js` | contact | Draws the desk scene; menu bar clock |
| `gsap.min.js` | home, work, project pages | Animation library (don't edit) |

## Common changes

- **Site colours:** `styles.css` → Part 2, the `:root` block (`--blue`, `--paper`, `--ink`…).
- **Navbar / footer colour:** `--nav-bg` in the same block. The footer follows automatically.
- **Mr. Blue's odds, jump height, swim speed:** `work-fishbowl.js` → SETTINGS at the top.
  Add `?fish=betta` to the address (e.g. `work.html?fish=betta`) to always see Mr. Blue.
- **Where the homepage stationery sits:** `home.js` → `TARGETS`.
- **Where the three homepage icons go:** `home.js` → `PAGES`.
- **What the fishbowl note shouts:** `work-fishbowl.js` → `EXCLAMATIONS`.
- **Photo-booth strip photos (homepage):** see the comment above `paper-photostrip` in `index.html`.
- **Pixel art colours:** `home.js` → section 1 (each shape has a hex colour).
- **Resume:** save your PDF as `assets/resume.pdf` (the Resume button already points there).
- **Figma prototypes:** in each UX page's HTML, find "FIGMA PROTOTYPE EMBED" and follow the steps.

## Images still to add

Create these folders inside `assets/` and add the files:

- `united/rewards.webp`, `united/redemption.webp`
- `yelp/home.webp`
- `clinical/home.webp`
- `scope/page-01.webp`
- `ctp/page-07.webp`
- `bauhaus/page-03.webp`

See `portfolio-thumbnail-sizes.xlsx` for the ideal sizes.

## Fonts

Gabarito and Pixelify Sans come from Google Fonts. Headings use **Salted**
from Adobe Fonts (kit `rzu3vfi`). Add your live domain (and `localhost`) to
that kit in Adobe Fonts, or headings fall back to Gabarito.
