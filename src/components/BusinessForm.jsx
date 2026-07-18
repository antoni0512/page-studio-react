import { THEMES } from '../data/themes'

export default function BusinessForm({ business, onChange }) {
  const set = (key, value) => onChange({ ...business, [key]: value })

  const setGalleryItem = (index, key, value) => {
    const gallery = business.gallery.map((item, i) =>
      i === index ? { ...item, [key]: value } : item
    )
    set('gallery', gallery)
  }

  const addGalleryItem = (type) => {
    set('gallery', [...business.gallery, { type, url: '' }])
  }

  const removeGalleryItem = (index) => {
    set('gallery', business.gallery.filter((_, i) => i !== index))
  }

  const setService = (index, key, value) => {
    const services = business.services.map((s, i) =>
      i === index ? { ...s, [key]: value } : s
    )
    set('services', services)
  }

  return (
    <div className="console">
      <h2>Business Details</h2>
      <p className="sub">
        This is the onboarding form. The phone preview is the actual page a
        customer lands on — same idea as scanning a QR code or tapping a link.
      </p>

      <div className="field-group">
        <span className="label">Identity</span>
        <div className="row">
          <input
            placeholder="Business name"
            value={business.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </div>
        <div className="row">
          <input
            placeholder="Category"
            value={business.category}
            onChange={(e) => set('category', e.target.value)}
          />
        </div>
        <div className="row">
          <textarea
            placeholder="Tagline / one-liner"
            value={business.tagline}
            onChange={(e) => set('tagline', e.target.value)}
          />
        </div>
      </div>

      <div className="field-group">
        <span className="label">Photos</span>
        <div className="row">
          <input
            placeholder="Cover photo URL"
            value={business.cover}
            onChange={(e) => set('cover', e.target.value)}
          />
        </div>
      </div>

      <div className="field-group">
        <span className="label">Gallery — unlimited photos &amp; videos</span>
        {business.gallery.map((item, i) => (
          <div className="gallery-row" key={i}>
            <select
              className="gallery-type-select"
              value={item.type}
              onChange={(e) => setGalleryItem(i, 'type', e.target.value)}
            >
              <option value="photo">Photo</option>
              <option value="video">Video</option>
            </select>
            <input
              placeholder={item.type === 'video' ? 'Video URL (.mp4)' : 'Photo URL'}
              value={item.url}
              onChange={(e) => setGalleryItem(i, 'url', e.target.value)}
            />
            <button
              type="button"
              className="gallery-remove-btn"
              onClick={() => removeGalleryItem(i)}
              aria-label="Remove"
            >
              ×
            </button>
          </div>
        ))}
        <div className="gallery-add-row">
          <button type="button" className="btn-add" onClick={() => addGalleryItem('photo')}>
            + Add photo
          </button>
          <button type="button" className="btn-add" onClick={() => addGalleryItem('video')}>
            + Add video
          </button>
        </div>
      </div>

      <div className="field-group">
        <span className="label">About</span>
        <div className="row">
          <textarea
            placeholder="A short paragraph about the business"
            value={business.about}
            onChange={(e) => set('about', e.target.value)}
          />
        </div>
      </div>

      <div className="field-group">
        <span className="label">Services (up to 3)</span>
        {business.services.map((s, i) => (
          <div className="svc-row" key={i}>
            <input
              placeholder="Title"
              value={s.title}
              onChange={(e) => setService(i, 'title', e.target.value)}
            />
            <input
              placeholder="One line"
              value={s.desc}
              onChange={(e) => setService(i, 'desc', e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="field-group">
        <span className="label">Contact &amp; location</span>
        <div className="row">
          <input
            placeholder="Phone"
            value={business.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
        </div>
        <div className="row">
          <input
            placeholder="WhatsApp (blank = same as phone)"
            value={business.whatsapp}
            onChange={(e) => set('whatsapp', e.target.value)}
          />
        </div>
        <div className="row">
          <input
            placeholder="Email"
            value={business.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </div>
        <div className="row">
          <input
            placeholder="Website"
            value={business.website}
            onChange={(e) => set('website', e.target.value)}
          />
        </div>
        <div className="row">
          <input
            placeholder="Full address"
            value={business.address}
            onChange={(e) => set('address', e.target.value)}
          />
        </div>
      </div>

      <div className="field-group">
        <span className="label">Social links</span>
        <div className="row">
          <input
            placeholder="Instagram handle"
            value={business.instagram}
            onChange={(e) => set('instagram', e.target.value)}
          />
        </div>
        <div className="row">
          <input
            placeholder="Facebook page"
            value={business.facebook}
            onChange={(e) => set('facebook', e.target.value)}
          />
        </div>
      </div>

      <div className="field-group">
        <span className="label">Page theme</span>
        <div className="theme-row">
          {THEMES.map((t, i) => (
            <div
              key={t.id}
              className={`swatch ${business.themeIndex === i ? 'active' : ''}`}
              style={{ background: t.accent }}
              title={t.name}
              onClick={() => set('themeIndex', i)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
