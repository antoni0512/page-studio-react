import { slugify } from './text'

export function buildVCard(business) {
  const { name, phone, email, website, address, tagline } = business
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name || 'Your Business Name'}`,
    `ORG:${name || 'Your Business Name'}`,
    phone ? `TEL;TYPE=WORK,VOICE:${phone}` : '',
    email ? `EMAIL:${email}` : '',
    website ? `URL:https://${website.replace(/^https?:\/\//, '')}` : '',
    address ? `ADR;TYPE=WORK:;;${address};;;;` : '',
    tagline ? `NOTE:${tagline}` : '',
    'END:VCARD',
  ].filter(Boolean)

  return lines.join('\n')
}

export function downloadVCard(business) {
  const blob = new Blob([buildVCard(business)], { type: 'text/vcard' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${slugify(business.name)}.vcf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
