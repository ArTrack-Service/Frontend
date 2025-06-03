'use client'

import { useEffect, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

export default function QRCodeWrapper() {
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(window.location.href)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center p-4 shadow-md rounded-md shadow-md bg-white w-fit">
      {url && <QRCodeCanvas value={url} size={80} />}
    </div>
  )
}