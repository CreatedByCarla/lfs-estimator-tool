# LFS Estimator Tool

An instant, embeddable fire sprinkler installation cost estimator, built
for **London Fire Sprinklers** ([londonfiresprinklers.com](https://londonfiresprinklers.com/)).

A visitor picks a property type, floor area, and number of floors, and
gets an instant indicative price range plus a call-to-action to request
a full survey and fixed quote.

This is a standalone project, unrelated to any other client work.

## What it is

- A single, dependency-free JavaScript file (`lfs-estimator.js`) that
  injects a styled form and calculates an estimate client-side.
- No backend, no build step — just host the file somewhere public and
  drop in a two-line embed snippet.

## Embedding on londonfiresprinklers.com

```html
<div data-lfs-estimator></div>
<script src="https://YOUR-HOSTED-URL/lfs-estimator.js"></script>
```

Optional per-instance overrides via data attributes on the container:

```html
<div
  data-lfs-estimator
  data-title="Get Your Instant Sprinkler Quote"
  data-contact-url="https://londonfiresprinklers.com/contact"
></div>
```

### Hosting the script

Because it's loaded via `<script src="...">`, the file needs to live
somewhere publicly reachable. Options, easiest first:

1. **GitHub Pages** — enable Pages for this repo (Settings → Pages →
   deploy from `main` branch, root). The script will then be available at:
   `https://createdbycarla.github.io/lfs-estimator-tool/lfs-estimator.js`
2. **jsDelivr CDN** (no setup needed, works off any public GitHub repo):
   `https://cdn.jsdelivr.net/gh/createdbycarla/lfs-estimator-tool@main/lfs-estimator.js`
3. Upload it directly into London Fire Sprinklers' own site hosting.

## Updating the pricing logic

All pricing figures live at the top of `lfs-estimator.js`, in
`PRICING_CONFIG`. **These are placeholder rates** — replace them with
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

Colours are exposed as CSS custom properties on `.lfs-estimator`, so you
can restyle it to match the client's brand without touching the JS.
Add an override stylesheet after the widget's own styles are injected:

```css
.lfs-estimator {
  --lfs-primary: #your-brand-colour;
  --lfs-primary-dark: #your-brand-colour-darker;
}
```

## Testing locally

Open `demo/index.html` directly in a browser — it loads the widget
exactly as it would be embedded, so you can try it end-to-end before
sending anything to the client.
