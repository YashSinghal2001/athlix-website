# Image Optimization Audit — Athlix Website

Scope: `client/` (React 19 + Vite 8). All `<img>` usages in `src/App.jsx` and `src/components/TransformationComparisonCard.jsx`, plus `index.html` and `src/index.css` for preload/CLS-relevant rules. No files were modified — findings only.

## Summary table

| # | Image / element | Format | Source size | Display size | Lazy | width/height | decoding | Verdict |
|---|---|---|---|---|---|---|---|---|
| 1 | Header logo (`Logo()`, App.jsx:299) | PNG | 3281×1875, **1.33 MB** | 37/34/31px tall | eager (default, correct — above fold) | ❌ | ❌ | 🔴 Critical — oversized, wrong format |
| 2 | Method-section logo (App.jsx:698) | PNG (same 1.33MB file) | 3281×1875, 1.33 MB | 60px wide | ❌ missing (loads eager, below fold) | ❌ | ❌ | 🔴 Critical |
| 3 | Hero image (App.jsx:446) | WebP | 1200×1068, 66.7 KB | ~345×432 (4:5 box) | eager + `fetchpriority="high"` (correct — LCP) | ❌ (CSS `aspect-ratio` covers it) | ❌ | 🟡 Not preloaded — see Preload section |
| 4 | Verified-badge tick (App.jsx:465) | PNG | 512×512, 20.9 KB | 18×18 | eager (correct — above fold) | ✅ `width="18" height="18"` | ❌ | 🟡 Oversized ~28× |
| 5 | Before/After cover cards (App.jsx:610) | WebP | 1000×818, 25–53 KB each | responsive card | ✅ `loading="lazy"` | ❌ (CSS `aspect-ratio` covers it) | ❌ | 🟢 Mostly fine |
| 6 | Coach photo (App.jsx:798) | WebP | 1080×1439, 59.3 KB | 4:5 box | ✅ `loading="lazy"` | ❌ (CSS covers it) | ❌ | ⚪ Currently disabled (`SHOW_COACH_IMAGE = false`) |
| 7 | Certification logos ×12 (App.jsx:850) | Mixed: 8× PNG/JPEG, 3× WebP, 1× AVIF | see breakdown below | 72px tall box | ✅ `loading="lazy"` | ❌ (CSS covers it) | ❌ | 🔴 8 of 12 never ran through the WebP pipeline |
| 8 | Testimonial avatars (App.jsx:893) | WebP | 480×267ish, 6.5–14.4 KB | 44×44 circle | ✅ `loading="lazy"` | ❌ (CSS covers it) | ❌ | 🟢 Fine |
| 9 | `og:image` / JSON-LD image (`index.html:47,75`) | — | — | — | n/a | n/a | n/a | 🔴 **Broken — `og-cover.jpg` does not exist in `client/public/`** |
| 10 | `TransformationComparisonCard.jsx` | WebP (via props) | — | — | ✅ `loading="lazy"` | ❌ | ❌ | ⚪ Dead code — component is unused (import commented out in App.jsx:11) |

---

## 1. Lazy loading

**Mostly good, one gap.** Every below-the-fold `<img>` except the method-section logo (App.jsx:698) has `loading="lazy"`. Above-the-fold images (header logo, hero, verified tick) correctly omit it and load eagerly, which is right.

- **Gap:** `App.jsx:698` — the `.method-logo` inside the "Coaching Method" section (well below the fold) has no `loading` attribute, so it loads eagerly by default. It happens to share the same module as the header logo, so the browser dedupes the network request — but it still means this image is exempt from lazy-loading semantics and, more importantly, is riding on the 1.33 MB PNG described below.

## 2. Proper width/height (CLS prevention)

**No `<img>` except the 18×18 verified-tick badge has explicit `width`/`height` attributes.** However, every image container that matters for layout (`.hero-photo`, `.coach-photo`, `.ba-frame`, `.cert-logo`, `.tst-avatar`, `.logo-mark img`, `.method-logo`) has a **fixed size or CSS `aspect-ratio`/`height` in `index.css`**, which is bundled and applied before/with initial paint, so real CLS from these images is unlikely in practice.

- This still falls short of the literal best practice (explicit `width`/`height` or the equivalent `aspect-ratio` set inline) because:
  - It relies on the CSS bundle loading in time; in edge cases (slow CSS parse, no-JS fallback, RSS/AMP readers, print stylesheets) there's no intrinsic size hint on the element itself.
  - Lighthouse's "Image elements have explicit width and height" audit will still flag every image in this file, since it only recognizes the HTML attributes / inline `aspect-ratio`, not external stylesheet rules.
- **CLS prevention is otherwise solid** — no image lacks a sized ancestor.

## 3. srcset / responsive images

**Not used anywhere in the codebase.** No `srcSet`, `sizes`, or `<picture>` element exists. Every image ships one fixed-resolution file to every viewport and pixel density.

- Impact is currently **low-to-moderate** because most source files are already fairly small (hero 66.7 KB, transformations 25–53 KB, coach 59.3 KB) — this is a "leave more on the table" finding, not a critical one, for those specific images.
- Impact is **higher** for the oversized logo/cert files below, where a correctly-sized single file would already solve most of the problem without needing srcset at all.

## 4. WebP / modern format support

**Good baseline, inconsistently applied.** The team clearly has a conversion pipeline (`client/scripts/optimize-images.mjs`, `optimize-beforeafter.mjs`, using `sharp`) and most photographic content (hero, coach, transformations, testimonial photos) is already WebP. A few cert logos use AVIF/WebP too (`jf-logo.avif`, `ace-logo.webp`, `teamboss-logo.webp`).

**But 10 files were never run through that pipeline and remain raw PNG/JPEG:**

| File | Format | Dimensions | Size | Displayed at |
|---|---|---|---|---|
| `logo-mark.png` | PNG | 3281×1875 | **1,362,730 bytes (1.33 MB)** | 60px / 37px / 34px / 31px |
| `Blue_tick.png` | PNG | 512×512 | 21,410 bytes | 18×18 |
| `mnu-logo.png` | PNG | 418×419 | 86,918 bytes | 72px box |
| `k11-logo.jpg` | JPEG | 1280×720 | 40,702 bytes | 72px box |
| `efka-logo.png` | PNG | 140×146 | 21,733 bytes | 72px box |
| `aiq-logo.png` | PNG | 786×180 | 25,418 bytes | 72px box |
| `rep-logo.png` | PNG | 261×141 | 11,217 bytes | 72px box |
| `usrep-logo.png` | PNG | 267×87 | 8,192 bytes | 72px box |
| `aic-logo.jpeg` | JPEG | 225×225 | 14,959 bytes | 72px box |
| `FM-logo.png`, `ecna-logo.png` | PNG | small | 8–10 KB | 72px box |

The single biggest win in this entire audit is **`logo-mark.png`**: a 1.33 MB, 3281×1875 PNG rendered at a maximum of 60 CSS pixels wide, loaded on **every single page view** (it's the site's own logo, used twice). At typical logo compression ratios, a correctly-sized WebP/PNG of this mark would be **a few KB**, not 1.33 MB — this is roughly 100–300× more data than needed.

`k11-logo.jpg` (1280×720 sports-photo-resolution JPEG for what should be a small badge logo) and `mnu-logo.png` (85 KB for a 72px-tall badge) are the next-largest offenders.

## 5. Preload only critical images

**No `<link rel="preload">` exists anywhere** (checked `index.html` source and the built `dist/index.html`). The hero image — the page's LCP candidate — is marked `fetchpriority="high"` on the `<img>` itself, but that only affects fetch priority *once the browser has discovered the URL*. Because the hero image is imported as an ES module (`import heroImage from "./assets/1.webp"`) and rendered by React, its hashed URL is only known **after the JS bundle downloads, parses, and executes** — the browser's preload scanner can't discover it early the way it could a `<link rel=preload>` or a plain `<img src>` in the initial HTML. This likely costs measurable LCP time.

- **Correctly, nothing else is preloaded** — no over-preloading of non-critical images was found.
- The gap is specifically: the one image that *should* be preloaded (hero) isn't reachable by a preload hint under the current architecture (asset import + client-rendered React, no SSR).

## 6. decode="async"

**Not used on a single `<img>` in the codebase.** Zero instances of `decoding="async"` (or any `decoding` attribute) were found. This is a low-severity, easy, zero-risk addition — it's most valuable on the below-the-fold/lazy images (cert logos, testimonial avatars, before/after cards) so their decode doesn't compete with main-thread work when they scroll into view.

## 7. Loading priority

- Hero image: `fetchpriority="high"` ✅ (see Preload note above for the caveat).
- Header logo / verified tick: default eager, correct for above-the-fold content, no explicit priority set (acceptable — `fetchpriority` isn't required for every eager image).
- Everything else: default priority + `loading="lazy"`, which is appropriate.
- No image was found with an *incorrect* priority (e.g., `fetchpriority="high"` on an offscreen image, or eager-loading something far below the fold) other than the method-logo lazy-loading gap noted in §1.

## 8. CLS prevention

Covered in §2. Net assessment: **low real-world CLS risk** today because every image sits in a CSS-sized container, but it's not belt-and-suspenders — it depends entirely on the stylesheet, with no redundant intrinsic-size hints on the elements themselves.

## Bonus finding (outside the checklist, but image-related)

- **Broken `og:image`**: `index.html` references `https://athlix.co/og-cover.jpg` in both the Open Graph meta tag and the JSON-LD structured data, but no `og-cover.jpg` file exists anywhere in `client/public/` or the repo. Social shares (Facebook/LinkedIn/Slack/Twitter) and rich-result crawlers will get a broken image today.
- **Dead code**: `client/src/components/TransformationComparisonCard.jsx` (an interactive before/after slider with its own lazy-loaded images) is unused — its import is commented out in `App.jsx:11` with a note that transformations are now single combined images. Not an optimization issue, but worth knowing it doesn't need auditing effort and could eventually be deleted.

---

## Priority ranking of fixes (no changes made — for your review)

1. **`logo-mark.png`** — recompress/resize via the existing `sharp` pipeline (the repo already has the tooling in `client/scripts/`, it just wasn't run on this file). Target ~120×68px @2x, WebP or optimized PNG. Expected: 1.33 MB → likely under 10 KB.
2. **Fix the missing `og-cover.jpg`** — either add the file to `client/public/` or remove the dangling reference.
3. **Run the remaining 9 cert logos + `Blue_tick.png` + `k11-logo.jpg`** through the same optimize pipeline (resize to ~2× display size, convert to WebP).
4. **Add `loading="lazy"`** to the method-section logo (App.jsx:698).
5. **Add a preload hint for the hero image** — since it's a Vite-hashed asset, this needs either (a) moving the hero image to `public/` with a stable filename and adding `<link rel="preload" as="image" href="/hero.webp" fetchpriority="high">` to `index.html`, or (b) a small Vite plugin that injects the hashed asset URL into the built `index.html`'s `<head>`.
6. **Add `decoding="async"`** to all `<img>` tags — cheap, zero-risk, applies everywhere.
7. *(Optional/lower priority)* Add explicit `width`/`height` attributes to images as redundant CLS insurance, even though CSS already covers layout today.

No files were changed as part of this audit.
