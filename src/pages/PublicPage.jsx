import { Link, useParams } from 'react-router-dom'
import BusinessPageContent from '../components/BusinessPageContent'
import { loadBusiness } from '../utils/storage'

export default function PublicPage() {
  const { slug } = useParams()
  const business = loadBusiness(slug)

  if (!business) {
    return (
      <div className="empty-state">
        <p className="empty-state-eyebrow">Page not found</p>
        <h1>This page hasn't been published yet.</h1>
        <p>
          Nothing is saved for <b>/{slug}</b> yet. Go to the studio and enter
          business details — this URL will start working immediately.
        </p>
        <Link className="btn btn-primary" to="/">
          Open the studio
        </Link>
      </div>
    )
  }

  return (
    <div className="public-page">
      <BusinessPageContent business={business} />
    </div>
  )
}
