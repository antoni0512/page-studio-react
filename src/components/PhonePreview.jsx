import BusinessPageContent from './BusinessPageContent'

// Editor-only affordance: wraps the real page content in a phone bezel
// so it's obvious what device this is meant to be viewed on.
export default function PhonePreview({ business }) {
  return (
    <div className="phone">
      <div className="phone-screen">
        <BusinessPageContent business={business} />
      </div>
    </div>
  )
}
