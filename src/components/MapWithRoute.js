'use client'
import { useEffect, useRef } from 'react'

export default function MapWithRoute({ routeItems }) {
  const mapRef = useRef(null)

  useEffect(() => {
    // SDK가 없는 경우 로드
    if (!window.naver && !document.getElementById('naver-map-sdk')) {
      const script = document.createElement('script')
      script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}&submodules=geocoder`
      script.async = true
      script.id = 'naver-map-sdk'

      script.onload = () => {
        console.log('🧭 SDK 로드됨')
        initMap()
      }

      document.head.appendChild(script)
    } else if (window.naver) {
      initMap()
    }

    async function initMap() {
      if (!mapRef.current || !window.naver) return

      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(37.5665, 126.9780),
        zoom: 12,
      })

      const positions = await Promise.all(
        routeItems.map(item =>
          new Promise((resolve) => {
            naver.maps.Service.geocode({ address: item.location || item.address }, (status, response) => {
              if (status === naver.maps.Service.Status.OK) {
                const result = response.v2.addresses?.[0]
                if (result) {
                  const latlng = new naver.maps.LatLng(result.y, result.x)
                  resolve({ latlng, item })
                } else {
                  resolve(null)
                }
              } else {
                resolve(null)
              }
            })
          })
        )
      )

      const validPoints = positions.filter(Boolean)

      validPoints.forEach(({ latlng, item }, idx) => {
        new naver.maps.Marker({
          position: latlng,
          map,
          icon: {
            content: `<div style="background:#3b82f6;color:white;border-radius:50%;padding:4px 8px;font-size:12px">${idx + 1}</div>`,
            anchor: new naver.maps.Point(12, 12),
          },
          title: item.name,
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
