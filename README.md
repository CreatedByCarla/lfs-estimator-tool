# LFS Estimator Tool

An instant, embeddable fire sprinkler installation cost estimator, built
for **London Fire Sprinklers** ([londonfiresprinklers.com](https://londonfiresprinklers.com/)).

A visitor tells us who they are, their property details and contact
info, and gets an instant indicative price range plus a call-to-action
to request a full survey and fixed quote.

This is a standalone project, unrelated to any other client work.

## What it is

- A single, dependency-free JavaScript file (`lfs-estimator.js`) that
  injects a styled form and calculates an estimate client-side.
- No backend, no build step - just host the file somewhere public and
  drop in a two-line embed snippet.

### Form fields

| Field | Required? |
|---|---|
| Which best describes you? (homeowner / architect / builder-developer / other) | Yes |
| Property type | Yes |
| Property address | Yes |
| Total floor area (m²) | Yes |
| Number of floors | Yes |
| Email address | Yes |
| Phone number | No |

**Note:** there's currently no backend, so submitted contact details
(email/phone/address) aren't sent or stored anywhere - the form only
calculates and displays the estimate in the browser. If you want actual
leads delivered to London Fire Sprinklers (e.g. by email or into a CRM),
that needs a submission endpoint wiring up next (a form service like
Formspree, or a simple serverless function) - let me know and I'll add it.

## Embedding on londonfiresprinklers.com

```html
<div data-lfs-estimator></div>
<script src="https://YOUR-HOSTED-URL/lfs-estimator.js"></script>
```

Optional per-instance overrides via data attributes on the container:

```html
<div
  data-lfs-estimator
  data-title="Get an instant fire sprinkler quote"
  data-contact-url="https://londonfiresprinklers.com/contact"
></div>
```

### Hosting the script

Because it's loaded via `<script src="...">`, the file needs to live
somewhere publicly reachable. Options, easiest first:

1. **GitHub Pages** - enable Pages for this repo (Settings → Pages →
   deploy from `main` branch, root). The script will then be available at:
   `https://createdbycarla.github.io/lfs-estimator-tool/lfs-estimator.js`
2. **jsDelivr CDN** (no setup needed, works off any public GitHub repo):
   `https://cdn.jsdelivr.net/gh/createdbycarla/lfs-estimator-tool@main/lfs-estimator.js`
3. Upload it directly into London Fire Sprinklers' own site hosting.

## Updating the pricing logic

All pricing figures live at the top of `lfs-estimator.js`, in
`PRICING_CONFIG`. **These are placeholder rates** - replace them with
London Fire Sprinklers' real numbers before this goes live:

```js
var PRICING_CONFIG = {
  baseRatePerSqm: {
    residential: 45,   // £ per m²
    commercial: 55,
    warehouse: 35,
    mixed: 50
  },
  perExtraFloorMultiplier: 0.08, // +8% per floor above the first
  minimumProjectFee: 2500,       // floor for any estimate, in GBP
  rangeLowFactor: 0.9,           // low end of the displayed range
  rangeHighFactor: 1.25          // high end of the displayed range
};
```

The estimate is calculated as:

```
subtotal = baseRate × floorArea × (1 + (floors - 1) × 0.08)
low  = max(minimumProjectFee, subtotal × 0.9)
high = max(low, subtotal × 1.25)
```

## Customising the look

The widget is styled to brand: **#050505** (near-black, text/borders)
and **#EA1B1B** (red, buttons/price/accents), with **Mukta ExtraLight**
for the heading and **Lato Regular** for body copy (both loaded from
Google Fonts automatically).

Colours are exposed as CSS custom properties on `.lfs-estimator`, so you
can restyle it further without touching the JS. Add an override
stylesheet after the widget's own styles are injected:

```css
.lfs-estimator {
  --lfs-ink: #your-colour;
  --lfs-red: #your-accent-colour;
}
```

## Testing locally

Open `demo/index.html` directly in a browser - it loads the widget
exactly as it would be embedded, so you can try it end-to-end before
sending anything to the client.
