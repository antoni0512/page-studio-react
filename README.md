# Page Studio (React + Vite)

Same prototype as the HTML version, rebuilt as a proper React app so it can grow into the real product.

## Run it

```bash
npm install
npm run dev
```

Then open the printed localhost URL.

## Structure

```
src/
  data/
    themes.js               # the 3 theme presets (colors)
    defaultBusiness.js       # seed data shown on load
  utils/
    text.js                  # slugify() and initials()
    vcard.js                  # builds and downloads the .vcf file
    storage.js                 # save/load a business by slug (localStorage stand-in for an API)
  components/
    BusinessForm.jsx          # the editing console
    BusinessPageContent.jsx    # the actual page sections — hero, about, gallery, services,
                                # location, social, sticky CTA bar. Used by BOTH routes below.
    PhonePreview.jsx            # phone bezel wrapper around BusinessPageContent (editor-only)
    QRCode.jsx                   # renders a real scannable QR for a given URL
  pages/
    StudioPage.jsx               # route "/" — the editor: form + phone preview + share box
    PublicPage.jsx                 # route "/:slug" — the real full-screen page a customer sees
  App.jsx                          # router: "/" -> StudioPage, "/:slug" -> PublicPage
  styles/index.css                  # all design tokens + layout
```

## Two separate things, one shared renderer

- **`/`** — the Studio. You edit a business here; the phone preview is just an
  editor affordance so you can see roughly how it'll look on a screen.
- **`/:slug`** — the real page. This is what the QR code and "Copy link" button
  point to. It's full-screen, no phone bezel, and is what you'd actually hand a
  customer.

Both routes render the same `BusinessPageContent` component from the same
`business` object, so the studio preview and the live page can never drift out
of sync — there's only one definition of what the page looks like.

## About persistence (read this before demoing)

There's no backend yet, so `utils/storage.js` saves the business object to
`localStorage` every time you edit it in the Studio, keyed by slug. That's why
opening `/your-business-name` in a new tab works — it's a real, separate route,
just backed by the browser instead of a database for now.

To go from prototype to product, replace the two functions in `storage.js`:

```js
saveBusiness(slug, business)  ->  PUT /api/businesses/:slug
loadBusiness(slug)             ->  GET /api/businesses/:slug
```

Nothing else in the app needs to change — `StudioPage` and `PublicPage` don't
care where the data comes from.

## Turning this into the real product next

- Swap `storage.js` for real API calls (above) — this is the main thing standing
  between this and a working multi-tenant product
- Add auth so a business owner can only edit their own page
- Add image upload (replacing the raw URL fields) once you have storage (S3, etc.)
- Wire the map placeholder to a real Google Maps / Mapbox embed using `business.address`
- Custom domains: map a business's own domain to `/:slug` server-side later
