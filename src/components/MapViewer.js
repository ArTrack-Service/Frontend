import { useEffect } from 'react'

export default function MapViewer({ items }) {
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID

  useEffect(() => {
    if (typeof window === 'undefined') return

    const script = document.createElement('script')
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`
    script.async = true

    script.onload = () => {
      if (!window.naver) {
        console.error('Naver maps failed to load')
        return
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const { latitude, longitude } = pos.coords

          const map = new naver.maps.Map('map', {
            center: new naver.maps.LatLng(latitude, longitude),
            zoom: 14,
            scaleControl: false,
            logoControl: false,
            mapDataControl: false,
          })

          new naver.maps.Marker({
            position: new naver.maps.LatLng(latitude, longitude),
            map,
            title: '내 위치',
            icon: {
                content: `
                <div class="relative w-6 h-6">
                    <div class="absolute w-6 h-6 rounded-full bg-blue-500 opacity-60 animate-ping"></div>
                    <div class="absolute inset-1/2 w-3 h-3 rounded-full bg-blue-500 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                `
            }
          })

          items.forEach(({ id, name, location }) => {
            naver.maps.Service.geocode({ address: location }, (status, response) => {
              if (status === naver.maps.Service.Status.OK) {
                const result = response.result
                if (result.items && result.items.length > 0) {
                  const point = result.items[0].point
                  const latLng = new naver.maps.LatLng(point.y, point.x)

                  const marker = new naver.maps.Marker({
                    position: latLng,
                    map,
                    title: name,
                  })

                  const infowindow = new naver.maps.InfoWindow({
                    content: `<div style="padding:5px;font-size:14px;">${name}<br/>${location}</div>`
                  })

                  marker.addListener('click', () => {
                    infowindow.open(map, marker)
                  })
                }
              } else {
                console.warn(`Geocode 실패: ${location}`, status)
              }
            })
          })
        })
      }
    }

    document.head.appendChild(script)
  }, [clientId, items]) 

  return <div id="map" className="w-full h-full" style={{ minHeight: '400px' }} />
}
