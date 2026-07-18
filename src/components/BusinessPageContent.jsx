import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react'
import { THEMES } from '../data/themes'
import { initials } from '../utils/text'

export default function BusinessPageContent({ business }) {
  const theme = THEMES[business.themeIndex] || THEMES[0]
  const gallery = business.gallery.filter((item) => item.url)
  const services = business.services.filter((s) => s.title)
  const whatsapp = business.whatsapp || business.phone

  const scrollerRef = useRef(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const lightboxOpen = lightboxIndex !== null

  const scrollGallery = (direction) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  const showNext = () => setLightboxIndex((i) => (i + 1) % gallery.length)
  const showPrev = () => setLightboxIndex((i) => (i - 1 + gallery.length) % gallery.length)

  // Keyboard support while the lightbox is open: Esc to close, arrows to navigate.
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') showNext()
      if (e.key === 'ArrowLeft') showPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, gallery.length])

  const current = lightboxOpen ? gallery[lightboxIndex] : null

  return (
    <>
      <div className="pg-root" style={{ background: theme.bg, color: theme.text }}>
        {business.cover ? (
          <img className="pg-hero-photo" src={business.cover} alt="" />
        ) : (
          <div className="pg-hero-photo" style={{ background: theme.soft }} />
        )}

        <div className="pg-sidebar">
          <div className="pg-header">
            <div
              className="pg-logo"
              style={{ background: theme.accent, color: theme.accentText }}
            >
              {initials(business.name)}
            </div>
            <p className="pg-cat">{business.category || 'Business'}</p>
            <h2 className="pg-name">{business.name || 'Your Business Name'}</h2>
            <p className="pg-tagline">{business.tagline}</p>
          </div>

          <div className="pg-actions">
            <a
              className="pg-chip"
              style={{ background: theme.soft, color: theme.text }}
              href={business.phone ? `tel:${business.phone.replace(/\s+/g, '')}` : undefined}
            >
              ☎ Call
            </a>
            <a
              className="pg-chip"
              style={{ background: theme.soft, color: theme.text }}
              href={whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}` : undefined}
              target="_blank"
              rel="noreferrer"
            >
              💬 WhatsApp
            </a>
            <a
              className="pg-chip"
              style={{ background: theme.soft, color: theme.text }}
              href={
                business.address
                  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`
                  : undefined
              }
              target="_blank"
              rel="noreferrer"
            >
              📍 Directions
            </a>
            <a
              className="pg-chip"
              style={{ background: theme.soft, color: theme.text }}
              href={business.email ? `mailto:${business.email}` : undefined}
            >
              ✉ Email
            </a>
          </div>
        </div>

        <div className="pg-main">
          {business.about && (
            <div className="pg-section">
              <p className="pg-h">About</p>
              <p className="pg-about-text">{business.about}</p>
            </div>
          )}

          {gallery.length > 0 && (
            <div className="pg-section">
              <p className="pg-h">Gallery</p>
              <div className="pg-gallery-wrap">
                {gallery.length > 1 && (
                  <button
                    className="pg-gallery-arrow pg-gallery-arrow-left"
                    style={{ background: theme.bg, color: theme.text }}
                    onClick={() => scrollGallery(-1)}
                    aria-label="Scroll gallery left"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}

                <div className="pg-gallery-scroller" ref={scrollerRef}>
                  {gallery.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      className="pg-gallery-item"
                      onClick={() => setLightboxIndex(i)}
                      aria-label={item.type === 'video' ? 'Play video' : 'View photo'}
                    >
                      {item.type === 'video' ? (
                        <>
                          <video src={item.url} muted playsInline preload="metadata" />
                          <span className="pg-gallery-play">
                            <Play size={16} fill="#fff" color="#fff" />
                          </span>
                        </>
                      ) : (
                        <img src={item.url} alt="" />
                      )}
                    </button>
                  ))}
                </div>

                {gallery.length > 1 && (
                  <button
                    className="pg-gallery-arrow pg-gallery-arrow-right"
                    style={{ background: theme.bg, color: theme.text }}
                    onClick={() => scrollGallery(1)}
                    aria-label="Scroll gallery right"
                  >
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </div>
          )}

          {services.length > 0 && (
            <div className="pg-section">
              <p className="pg-h">Services</p>
              <div className="pg-svc-grid">
                {services.map((s, i) => (
                  <div className="pg-svc-card" key={i} style={{ background: theme.soft }}>
                    <p className="pg-svc-title">{s.title}</p>
                    <p className="pg-svc-desc">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pg-section">
            <p className="pg-h">Location</p>
            <div className="pg-map" style={{ backgroundColor: theme.soft }}>
              <div className="pin">📍</div>
            </div>
            <p className="pg-address">{business.address}</p>
            <a
              className="pg-directions"
              style={{ background: theme.accent, color: theme.accentText }}
              href={
                business.address
                  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`
                  : undefined
              }
              target="_blank"
              rel="noreferrer"
            >
              Get Directions
            </a>
          </div>

          {(business.instagram || business.facebook) && (
            <div className="pg-section">
              <p className="pg-h">Follow</p>
              <div className="pg-social">
                {business.instagram && <span className="pg-social-pill">{business.instagram}</span>}
                {business.facebook && <span className="pg-social-pill">{business.facebook}</span>}
              </div>
            </div>
          )}

          <div className="pg-footer">
            <p className="pg-footer-line">Built with Page Studio</p>
          </div>
        </div>

        <div className="pg-sticky" style={{ background: `${theme.bg}CC` }}>
          <a
            className="pg-sticky-btn"
            style={{ background: theme.soft, color: theme.text }}
            href={business.phone ? `tel:${business.phone.replace(/\s+/g, '')}` : undefined}
          >
            Call
          </a>
          <a
            className="pg-sticky-btn"
            style={{ background: theme.soft, color: theme.text }}
            href={whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}` : undefined}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          <button
            className="pg-sticky-btn"
            style={{ background: theme.accent, color: theme.accentText }}
            onClick={() => document.getElementById('save-contact-btn')?.click()}
          >
            Save Contact
          </button>
        </div>
      </div>

      {lightboxOpen && (
        <div className="pg-lightbox" onClick={() => setLightboxIndex(null)}>
          <button className="pg-lightbox-close" onClick={() => setLightboxIndex(null)} aria-label="Close">
            <X size={22} />
          </button>

          {gallery.length > 1 && (
            <button
              className="pg-lightbox-arrow pg-lightbox-arrow-left"
              onClick={(e) => {
                e.stopPropagation()
                showPrev()
              }}
              aria-label="Previous"
            >
              <ChevronLeft size={26} />
            </button>
          )}

          <div className="pg-lightbox-content" onClick={(e) => e.stopPropagation()}>
            {current.type === 'video' ? (
              <video src={current.url} controls autoPlay />
            ) : (
              <img src={current.url} alt="" />
            )}
          </div>

          {gallery.length > 1 && (
            <button
              className="pg-lightbox-arrow pg-lightbox-arrow-right"
              onClick={(e) => {
                e.stopPropagation()
                showNext()
              }}
              aria-label="Next"
            >
              <ChevronRight size={26} />
            </button>
          )}

          {gallery.length > 1 && (
            <div className="pg-lightbox-counter">
              {lightboxIndex + 1} / {gallery.length}
            </div>
          )}
        </div>
      )}
    </>
  )
}
