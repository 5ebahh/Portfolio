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

**Keep the `CNAME` file.** Step 5 makes GitHub add a file called `CNAME` to the
repository (it just says `sebavega.com`). It isn't in this folder, so if you
ever delete everything in the repository before re-uploading, sebavega.com stops
working until you redo step 5 (type the domain in again, then tick Enforce
HTTPS). Easiest: skip `CNAME` when deleting, or just upload on top of the old
files, since files with the same name are replaced.


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
| `case-pages.css` | project pages | Base styles for the six case studies |
| `case-study.css` | project pages | Case-study layout: header, side nav, steps, carousel, embeds |
| `case-study.js` | project pages | Side nav progress, step panels, phone carousel, Figma placeholders |
| `ba-scroll.css` / `.js` | United, Yelp, Cura | The scroll-driven "Before & After" section: tabs, screens, phone arrows |
| `cereal-model.css` / `.js` | Cinnamon Toast Punk | The 3D box viewer, idle turn and drag |
| `ctp-box.css` / `.js` | Cinnamon Toast Punk | Sketch sheets, the scroll-driven 3D box sequence, the keychain section |
| `scope-flipbook.css` / `.js` | Scope | The self-hosted magazine flipbook (StPageFlip) |
| `page-flip.browser.js` | Scope | Backup copy of StPageFlip 2.0.7 (MIT), used only if its CDN fails (don't edit) |
| `ScrollTrigger.min.js` | Cinnamon Toast Punk | GSAP scroll plugin for the 3D box (don't edit) |
| `contact.css` | contact | The desk scene and the computer screen |
| `site.js` | every page | Phone menu and page loader |
| `home.js` | home | Pixel art, stationery placement and dragging |
| `home-notes.js` | home | Favorites cards lift on hover |
| `scroll-cue.js` | home | The "Scroll" arrow |
| `paper-motion.js` | work | Scroll-in motion and card hover |
| `work-fishbowl.js` | work | The fish, its jump and Mr. Blue |
| `contact-desk.js` | contact | Draws the desk scene; menu bar clock |
| `gsap.min.js` | home, work, Cinnamon Toast Punk | Animation library (don't edit) |

Folders: `model/` holds the 3D cereal box (`cinnamon-toast-punk.glb`, its
lighting, flat face images and the model-viewer library); `ctp/` holds the
Cinnamon Toast Punk sketch, drafts and keychain images; `scope-pages/` holds
the 48 Scope magazine pages (`page-01.webp` … `page-48.webp`, in reading order).
`ua/`, `yelp/` and `cura/` hold each UX case study's app screens (and United's
iPhone mockup frame, `phone-frame.webp`, used for every phone on all three
pages); `icons/figma.png` is the pixel Figma icon in the Tools row. To swap a
screen, replace its file with the same name (phone screens are 393 x 852 at 2x).

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
- **Figma prototypes:** in `unitedairlines.html`, `yelp.html` and `cura.html`, search for "FIGMA:" and
  paste the embed link over the `[Figma embed URL: …]` placeholder in the iframe's `src`. Until then the
  page shows a labelled placeholder box.
- **Scope magazine pages:** replace the images in `assets/scope-pages/` (same names, 1000 x 1294 px).
  If the page count changes, update the list near "FLIPBOOK" in `scopemagazine.html`.

## After updating CSS or JavaScript (cache version)

Every page loads its CSS and JS with a version tag, e.g.
`assets/styles.css?v=2026-10-06`. Browsers keep old copies of these files
for a while; changing the tag makes them download the new ones, so returning
visitors never see new HTML mixed with old styles or scripts.

Whenever you change any file in `assets/` that ends in `.css` or `.js`,
find and replace the old tag (e.g. `?v=2026-10-06d`) with today's date across
all the `.html` pages, and upload those pages along with the changed files.

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

The graphic design case studies (Scope, Bauhaus) still have a few bracketed
[add …] notes and a "Project context & draft notes" box to fill in or remove.

## Fonts

Body text is Gabarito (Google Fonts). Headings use **Salted** from Adobe Fonts
(kit `rzu3vfi`). Add your live domain (and `localhost`) to that kit in Adobe
Fonts, or headings fall back to Gabarito.

Pixel text uses **Determination** by anonymous-1438277, made with FontStruct
(https://fontstruct.com/fontstructions/show/2368299/determination-40), served
from `assets/fonts/determination.woff` and set up at the top of `styles.css`.
It's licensed **CC BY 3.0** (https://creativecommons.org/licenses/by/3.0/):
free to use, as long as the author is credited where it's used. Pixelify Sans
(Google Fonts) stays as the backup if the file can't load.
