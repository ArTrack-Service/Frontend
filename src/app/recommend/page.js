'use client'
import { useEffect, useState } from 'react'
import BottomNav from '../../components/BottomNav'

export default function Recommend() {
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude)
          setLon(pos.coords.longitude)
        },
        (err) => {
          console.error('위치 정보를 가져올 수 없습니다:', err)
        }
      )
    }
  }, [])

  return (
  <div className="flex flex-col h-screen px-4 py-5 bg-white">
    <div className="mb-6">
      <h1 className="text-lg font-semibold text-gray-800">산책 추천</h1>
      <p className="text-sm text-gray-500">원하는 조건을 선택하고 시작을 눌러주세요</p>
    </div>
    <form method='get' action="/recommend/recpaths" className='flex flex-col'>
      <input type="hidden" name="lon" value={lon} />
      <div className="flex flex-col mb-6">
        <label htmlFor='Time' className="text-sm font-medium text-gray-700 mb-2">시간</label>
        <select name="time" id="Time" className="border border-gray-300 rounded-md p-2">
          <option value="0.5">30분 미만</option>``
          <option value="1.0">30분 이상 1시간 미만</option>
          <option value="1.5">1기시간 이상 1시간 30분 미만</option>
          <option value="2.0">1시간 30분 이상 2시간 미만</option>
          <option value="2.5">2시간 이상 2시간 30분 미만</option>
        </select>
      </div>
      <div className="flex flex-col mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2">작품 수</label>
        <select name="items" id="Items" className="border border-gray-300 rounded-md p-2">
            <option value="1">1개</option>
            <option value="2">2개</option>
            <option value="3">3개</option>
            <option value="4">4개</option>
            <option value="5">5개</option>
          </select>
      </div>
      <input
          type="submit"
          value="시작"
          className="w-24 h-24 mt-6 mx-auto rounded-full bg-blue-500 text-white text-lg font-bold hover:bg-emerald-600 transition"
        />
    </form>
    <BottomNav activeIndex={1}/>
  </div>
)
}