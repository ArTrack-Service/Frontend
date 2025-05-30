import { useEffect, useRef } from 'react'

export default function MapViewer({ items, setSelectedItem }) {
    const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
    const mapRef = useRef(null)
    const markersRef = useRef([])
    const currentPositionRef = useRef(null)

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
            currentPositionRef.current = new naver.maps.LatLng(latitude, longitude)

            if (!mapRef.current) {
                mapRef.current = new naver.maps.Map('map', {
                center: currentPositionRef.current,
                zoom: 14,
                scaleControl: false,
                logoControl: false,
                mapDataControl: false,
                })

                new naver.maps.Marker({
                position: currentPositionRef.current,
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

            markersRef.current.forEach(marker => marker.setMap(null))
            markersRef.current = []

            items.forEach((item) => {
                const { name, location } = item
                naver.maps.Service.geocode({ address: location }, (status, response) => {
                if (status === naver.maps.Service.Status.OK) {
                    const point = response.result.items[0].point
                    const latLng = new naver.maps.LatLng(point.y, point.x)

                    const marker = new naver.maps.Marker({
                    position: latLng,
                    map: mapRef.current,
                    title: name,
                    })

                    const infowindow = new naver.maps.InfoWindow({
                    content: `<div style="padding:5px;font-size:14px;">${name}<br/>${location}</div>`
                    })

                    marker.addListener('click', () => {
                    mapRef.current.setCenter(marker.getPosition())
                    infowindow.open(mapRef.current, marker)
                    setSelectedItem(item)
                    })

                    markersRef.current.push(marker)
                }
                })
            })
            }, () => {
            const defaultPosition = new naver.maps.LatLng(37.5665, 126.9780)
            currentPositionRef.current = defaultPosition

            if (!mapRef.current) {
                mapRef.current = new naver.maps.Map('map', {
                center: defaultPosition,
                zoom: 14,
                scaleControl: false,
                logoControl: false,
                mapDataControl: false,
                })
            }
            })
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

    useEffect(() => {
        if (!mapRef.current) return

        markersRef.current.forEach(marker => marker.setMap(null))
        markersRef.current = []

        items.forEach((item) => {
        const { name, location } = item
        naver.maps.Service.geocode({ address: location }, (status, response) => {
            if (status === naver.maps.Service.Status.OK) {
            const point = response.result.items[0].point
            const latLng = new naver.maps.LatLng(point.y, point.x)

            const marker = new naver.maps.Marker({
                position: latLng,
                map: mapRef.current,
                title: name,
            })

            const infowindow = new naver.maps.InfoWindow({
                content: `<div style="padding:5px;font-size:14px;">${name}<br/>${location}</div>`
            })

            marker.addListener('click', () => {
                mapRef.current.setCenter(marker.getPosition())
                infowindow.open(mapRef.current, marker)
                setSelectedItem(item)
            })

            markersRef.current.push(marker)
            }
        })
        })
    }, [items, setSelectedItem])

    return <div id="map" className="w-full h-full" style={{ minHeight: '400px' }} />
}
