import { useEffect, useState } from 'react'
import QRCodeLib from 'qrcode'

export default function QRCode({ value, size = 120 }) {
  const [dataUrl, setDataUrl] = useState(null)

  useEffect(() => {
    let cancelled = false
    QRCodeLib.toDataURL(value, {
      width: size,
      margin: 1,
      color: { dark: '#15201A', light: '#FFFFFF' },
    }).then((url) => {
      if (!cancelled) setDataUrl(url)
    })
    return () => {
      cancelled = true
    }
  }, [value, size])

  if (!dataUrl) return <div className="qr-placeholder" style={{ width: size, height: size }} />

  return <img className="qr-code" src={dataUrl} width={size} height={size} alt="QR code linking to this page" />
}
