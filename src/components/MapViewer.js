import { useEffect } from 'react'

export default function MapViewer() {
const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
useEffect(() => {
    if (typeof window !== 'undefined') {
    const script = document.createElement('script')
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`
    script.async = true
    script.onload = () => {
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
            })
        })
        }
    }
    document.head.appendChild(script)
    }
}, [])

return <div id="map" className="w-full h-full" />
}
