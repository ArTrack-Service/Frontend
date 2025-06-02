'use client'

import { useEffect, useRef } from 'react'

export default function MapWithRoute({ routeItems }) {
  const mapRef = useRef(null)

  useEffect(() => {
    const loadMap = async () => {
      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(37.5665, 126.9780),
        zoom: 12,
      })

      const positions = await Promise.all(
        routeItems.map(item =>
          new Promise((resolve) => {
            naver.maps.Service.geocode({ address: item.address }, (status, response) => {
              if (status === naver.maps.Service.Status.OK) {
                const result = response.v2.addresses[0]
                const latlng = new naver.maps.LatLng(result.y, result.x)
                resolve({ latlng, item })
              } else {
                resolve(null)
              }
            })
          })
        )
      )

      validPoints.forEach(({ latlng }, idx) => {
        new naver.maps.Marker({
          position: latlng,
          map,
          icon: {
            content: `<div style="background:#3b82f6;color:white;border-radius:50%;padding:4px 8px;font-size:12px">${idx + 1}</div>`
          }
        })
      })

      if (validPoints.length > 1) {
        new naver.maps.Polyline({
          path: validPoints.map(p => p.latlng),
          strokeColor: '#3b82f6',
          strokeWeight: 4,
          map,
        })
      }

      if (validPoints.length > 0) {
        const avgLat = validPoints.reduce((sum, p) => sum + p.latlng.lat(), 0) / validPoints.length
        const avgLng = validPoints.reduce((sum, p) => sum + p.latlng.lng(), 0) / validPoints.length
        map.setCenter(new naver.maps.LatLng(avgLat, avgLng))
      }
    }
}, [routeItems])

return <div ref={mapRef} className="w-full h-64 rounded-lg shadow-md" />
}