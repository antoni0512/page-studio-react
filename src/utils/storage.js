// Prototype-only persistence. In the real product this becomes:
//   saveBusiness -> POST/PUT /api/businesses/:slug
//   loadBusiness -> GET  /api/businesses/:slug
// Swapping these two functions for real API calls is the only change
// StudioPage and PublicPage need when a backend exists.

const PREFIX = 'page-studio:business:'

export function saveBusiness(slug, business) {
  try {
    localStorage.setItem(PREFIX + slug, JSON.stringify(business))
  } catch (e) {
    console.error('Could not save business', e)
  }
}

export function loadBusiness(slug) {
  try {
    const raw = localStorage.getItem(PREFIX + slug)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    console.error('Could not load business', e)
    return null
  }
}
