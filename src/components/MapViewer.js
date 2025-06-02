import { useEffect, useRef } from 'react'

export default function MapViewer({ items, setSelectedItem, routeItems, setRouteItems }) {
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const currentPositionRef = useRef(null)
   const setLocalStorage = (items) => {
          try {
              localStorage.setItem('routeItems', JSON.stringify(items))
          } catch (e) {
              console.error('로컬스토리지 쓰기 오류:', e)
          }
      }

  // localStorage에서 캐시된 좌표 불러오기
  const loadGeocodedCache = () => {
    if (typeof window === 'undefined') return {}
    try {
      return JSON.parse(localStorage.getItem('geocodedData')) || {}
    } catch (e) {
      return {}
    }
  }

  // localStorage에 좌표 캐시 저장
  const saveGeocodedCache = (cache) => {
    localStorage.setItem('geocodedData', JSON.stringify(cache))
  }

  useEffect(() => {
    const script = document.createElement('script')
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`
    script.async = true

    script.onload = () => {
      if (!window.naver) {
        console.error('Naver maps failed to load')
        return
      }

      const initMap = (center) => {
        if (!mapRef.current) {
          mapRef.current = new naver.maps.Map('map', {
            center,
            zoom: 14,
            scaleControl: false,
            logoControl: false,
            mapDataControl: false,
          })

          new naver.maps.Marker({
            position: center,
            map: mapRef.current,
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
        }

        currentPositionRef.current = center
        renderMarkers(items)
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords
            initMap(new naver.maps.LatLng(latitude, longitude))
          },
          () => {
            initMap(new naver.maps.LatLng(37.5665, 126.9780))
          }
        )
      } else {
        initMap(new naver.maps.LatLng(37.5665, 126.9780))
      }
    }

    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
      if (markersRef.current.length) {
        markersRef.current.forEach(marker => marker.setMap(null))
        markersRef.current = []
      }
      if (mapRef.current) {
        mapRef.current.destroy()
        mapRef.current = null
      }
    }
  }, [clientId])

  const renderMarkers = async (data) => {
    if (!mapRef.current || !window.naver) return

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    let cache = loadGeocodedCache()

    const geocodePromises = data.map(item => {
      const cached = cache[item.id]
      if (cached) {
        return Promise.resolve({ item, latLng: new naver.maps.LatLng(cached.lat, cached.lng) })
      }

      return new Promise(resolve => {
        naver.maps.Service.geocode({ address: item.address }, (status, response) => {
          if (status === naver.maps.Service.Status.OK && response.result.items.length > 0) {
            const point = response.result.items[0].point
            const latLng = new naver.maps.LatLng(point.y, point.x)
            // 캐시에 저장
            cache[item.id] = { lat: point.y, lng: point.x }
            resolve({ item, latLng })
          } else {
            resolve(null)
          }
        })
      })
    })

    const results = await Promise.all(geocodePromises)
    saveGeocodedCache(cache)

    results.forEach(result => {
      if (!result) return
      const { item, latLng } = result

      const marker = new naver.maps.Marker({
        position: latLng,
        map: mapRef.current,
        title: item.name,
      })

        const infowindow = new naver.maps.InfoWindow({
        content: `
            <div style="display:flex;flex-direction:column;padding:5px;font-size:14px;max-width:220px;word-break:break-word;">
            <p style="font-size:15px; font-weight:bold; margin:0;">${item.name}</p>
            <p style="margin:4px 0;">${item.address}</p>
            <button id="add-button-${item.id}" style="margin-top:5px;padding:5px 10px;font-size:12px;background-color:#3b82f6;color:white;border:none;border-radius:5px;cursor:pointer;">
                추가
            </button>
            </div>
        `,
        maxWidth: 250,
        disableAutoPan: false, // 지도 중심 자동 이동 허용
        borderWidth: 0,
        backgroundColor: "#fff"
        })

      marker.addListener('click', () => {
        mapRef.current.setCenter(marker.getPosition())
        infowindow.open(mapRef.current, marker)
        setSelectedItem(item)

        setTimeout(() => {
          const btn = document.getElementById(`add-button-${item.id}`)
          if (btn) {
            btn.addEventListener('click', () => {
              if (!routeItems.find(i => i.id === item.id)) {
                const confirmAdd = window.confirm('이 항목을 추가하시겠습니까?')
                if (confirmAdd) {
                  setLocalStorage([...routeItems, item])
                  setRouteItems(prev => [...prev, item])
                   
                }
              } else {
                alert('이미 추가된 항목입니다.')
              }
            })
          }
        }, 0)
      })

      markersRef.current.push(marker)
    })
  }

  useEffect(() => {
    if (mapRef.current && window.naver) {
      renderMarkers(items)
    }
  }, [items])

  return <div id="map" className="w-full h-full" style={{ minHeight: '400px' }} />
}