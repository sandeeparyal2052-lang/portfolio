# Sandeep Aryal — Portfolio (Plain HTML/CSS/JS)

No build step, no framework, no dependencies. Open `index.html` in a
browser, or host the folder as-is on any static host.

The visual language borrows from civil-engineering drawing sheets:
dimension lines, a recurring "title block" (the small labeled data table
in the hero and Contact section), a section numbering system
("SHEET 01", "SHEET 02"...), and a faint blueprint grid backdrop.

## File structure

```
index.html        All page content and structure (single page)
css/styles.css     All styling — colors, type, layout, components
js/script.js       Dark mode, mobile nav, gallery filter, scroll reveal, contact form
images/            Placeholder SVGs (profile, projects, gallery) — swap for real photos
documents/         Resume, CV, and certificate PDFs
```

## Running locally

Just open `index.html` directly, or serve the folder for the cleanest
experience (some browsers restrict certain features on `file://`):

```bash
# Python
python3 -m http.server 8000

# or Node
npx serve .
```

Then visit http://localhost:8000.

## Editing content

Everything lives directly in `index.html` — there's no separate data file
or build step. Each section is clearly commented
(`<!-- ============ SECTION NAME ============ -->`) so you can find and
edit text in place.

- **Experience**: each role is a `.timeline-item` block inside
  `<div class="timeline">`. Copy a block to add a new role.
- **Projects**: each project is an `<article class="project-card">` inside
  `.project-grid`. Copy a card, update the text, and point `image` at a
  file in `/images`.
- **Gallery**: each photo is a `<figure class="gallery-item" data-category="...">`.
  The `data-category` attribute drives the filter buttons — use one of
  `Site`, `Drawings`, `Certificates`, `Events`, or add a new category (and
  a matching filter button) if needed.
- **Documents**: each file is a `.doc-row` link. Point `href` at a file in
  `/documents`.
- **Skills, Certifications, Achievements, Testimonials**: plain repeated
  markup blocks — copy/edit/remove as needed.

### Replacing photos

Drop a `.jpg`/`.png`/`.webp` into `/images` and either overwrite the
placeholder file (same filename) or update the `src` in `index.html`.

### Colors, fonts, and layout

All design tokens are CSS custom properties at the top of
`css/styles.css` (`:root { ... }`), with the dark-mode overrides in
`html.dark { ... }` right below. Change those variables to re-theme the
whole site. Fonts are loaded via Google Fonts in the `<head>` of
`index.html`: Space Grotesk (display), IBM Plex Sans (body), IBM Plex
Mono (data/labels/UI text).

### Contact form

The form in the Contact section currently opens the visitor's email
client with a pre-filled message (see `initContactForm` in
`js/script.js`) — no backend required. To collect submissions directly,
either:
- Use **Netlify Forms** (add `netlify` and `data-netlify="true"`
  attributes to the `<form>` tag if hosting on Netlify), or
- Point the form at a service like Formspree, or
- Wire up a small backend endpoint and change the JS to `fetch()` it
  instead of building a `mailto:` link.

## Deploying

This folder can be hosted as-is on Netlify (drag-and-drop), GitHub Pages,
Cloudflare Pages, Vercel, or any static file host — no build command
needed, since there's nothing to build.
