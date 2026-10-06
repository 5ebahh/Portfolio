# Sebastian Vega — portfolio

Live at **sebavega.com** (GitHub Pages, domain from Porkbun).

Plain HTML, CSS and JavaScript. There's no build step: upload this folder's
contents as-is to GitHub Pages. Links between pages are written without ".html" (e.g. `href="work"`), so
addresses look like `sebavega.com/work`. GitHub Pages adds the ".html" for
you. Because of that, test changes on the live site (or in a GitHub Pages
preview) rather than by double-clicking files on your computer.

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
  Add `?fish=betta` to the address (e.g. `sebavega.com/work?fish=betta`) to always see Mr. Blue.
- **Where the homepage stationery sits:** `home.js` → `TARGETS`.
- **Where the three homepage icons go:** `home.js` → `PAGES`.
- **What the fishbowl note shouts:** `work-fishbowl.js` → `EXCLAMATIONS`.
- **Photo-booth strip photos (homepage):** see the comment above `paper-photostrip` in `index.html`.
- **Pixel art colours:** `home.js` → section 1 (each shape has a hex colour).
- **Resume:** the Resume button opens your PDF on Google Drive. Update the file in Drive, or change the link in `contact.html` (search for "RESUME").
- **Figma prototypes:** in each UX page's HTML, find "FIGMA PROTOTYPE EMBED" and follow the steps.

## Favicon (browser tab icon)

The tab icon is Mr. Blue the betta from the Work page fishbowl, in pixel art:
`favicon.ico` (in the main folder, where browsers look for it automatically),
`assets/favicon-16.png`, `assets/favicon-32.png`, and
`assets/apple-touch-icon.png` (used when someone saves the site to a phone's
home screen). Every page links to them near the top of its `<head>`.
Browsers cache favicons hard, so after publishing you may need to reload or
open the site in a private window to see a change.

## Link previews (share cards)

When a page is shared (LinkedIn, iMessage, Discord, Slack, forums, X), sites
read the Open Graph tags near the top of each page's `<head>` and show a card
with the page title, description and a 1200 x 630 image from `assets/og/`:

- `home.png`: the pixel-paper card, used by the homepage, Work, Gallery and
  Contact pages.
- `united.jpg`, `yelp.jpg`, `cura.jpg`, `scope.jpg`, `ctp.jpg`, `bauhaus.jpg`:
  one per case study.

The tags use full addresses (https://sebavega.com/...), so previews only work
once the site is live on that domain. To check a page, paste its link into
https://www.opengraph.xyz or LinkedIn's Post Inspector. Sites cache previews,
so after changing an image, re-check the link there to refresh it.

## Project thumbnails

The homepage favorites and Work page cards use the images in
`assets/thumbs/` (united, yelp, cura, scope, ctp, bauhaus `.webp`).
To swap one, replace the file with the same name.

Frames always fill edge to edge without stretching; anything outside the
frame's shape is trimmed evenly. Shapes are set in `styles.css` (Part 2):

- `--thumb-ratio` (3:2): graphic design cards on the Work page.
- `--thumb-ratio-wide` (16:9): the Yelp and Cura cards and the homepage
  favorites. Cura's current thumbnail is 16:9 with
  text near its edges, so 3:2 would cut it off. Export Cura at 3:2 and you
  can switch this to `3 / 2`.

Best export sizes: 3:2 at 1200 x 800, 16:9 at 1600 x 900, saved as WebP.

The Work page's featured United card has its own two covers:
`united-featured.webp` (wide, 1600 x 1014) on screens 900px and wider, and
`united-mobile.webp` (tall, 1000 x 1250, 4:5) below 900px. The switch is
the `<picture>` in `work.html`; the frame shapes are in `work.css`. If you
re-export either one at a different shape, update its `aspect-ratio` there.

The case-study pages still use grey placeholder boxes for their images.

## Fonts

Gabarito and Pixelify Sans come from Google Fonts. Headings use **Salted**
from Adobe Fonts (kit `rzu3vfi`). Add your live domain (and `localhost`) to
that kit in Adobe Fonts, or headings fall back to Gabarito.
