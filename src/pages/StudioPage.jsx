import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BusinessForm from '../components/BusinessForm'
import PhonePreview from '../components/PhonePreview'
import QRCode from '../components/QRCode'
import { defaultBusiness } from '../data/defaultBusiness'
import { slugify } from '../utils/text'
import { downloadVCard } from '../utils/vcard'
import { saveBusiness } from '../utils/storage'

export default function StudioPage() {
  const [business, setBusiness] = useState(defaultBusiness)
  const [copiedNote, setCopiedNote] = useState('')

  const slug = slugify(business.name)
  const pageUrl = `${window.location.origin}/${slug}`

  // Persist on every change so the public route (a real, separate page)
  // has something to load. This stands in for a "Save" API call.
  useEffect(() => {
    saveBusiness(slug, business)
  }, [slug, business])

  const handleCopy = () => {
    navigator.clipboard
      ?.writeText(pageUrl)
      .then(() => setCopiedNote(`Copied ${pageUrl}`))
      .catch(() => setCopiedNote(pageUrl))
    setTimeout(() => setCopiedNote(''), 2500)
  }

  return (
    <div className="shell">
      <div className="masthead">
        <div>
          <div className="eyebrow">Studio — editor</div>
          <h1>Page Studio</h1>
        </div>
        <div className="eyebrow">One scrollable page per business, not a card</div>
      </div>

      <div className="layout">
        <BusinessForm business={business} onChange={setBusiness} />

        <div className="preview-wrap">
          <div className="hint">Preview only — scroll inside the phone</div>

          <PhonePreview business={business} />

          <div className="share-box">
            <QRCode value={pageUrl} size={104} />
            <div className="share-box-info">
              <p className="share-box-label">Share this with customers</p>
              <div className="url-line">
                {window.location.host}/<b>{slug}</b>
              </div>
              <div className="copied-note">{copiedNote}</div>
              <div className="share-box-actions">
                <button className="btn btn-secondary" onClick={handleCopy}>
                  Copy link
                </button>
                <Link className="btn btn-primary" to={`/${slug}`} target="_blank">
                  Open live page ↗
                </Link>
              </div>
            </div>
          </div>

          <div className="actions-row">
            <button
              id="save-contact-btn"
              className="btn btn-primary"
              onClick={() => downloadVCard(business)}
            >
              ↓ Save to Contacts
            </button>
          </div>

          <p className="footnote">
            The phone above is an editing preview only. The QR code and link
            point to the actual page a customer would see — open it in a new
            tab to check.
          </p>
        </div>
      </div>
    </div>
  )
}
