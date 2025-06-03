'use client'
import { useEffect, useState } from 'react'
import BottomNav from '../../components/BottomNav'

export default function Recommend() {
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const [timeMin, setTimeMin] = useState('')
  const [timeMax, setTimeMax] = useState('')


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

  const handleTimeChange = (e) => {
    const selected = JSON.parse(e.target.value)
    setTimeMin(selected.min)
    setTimeMax(selected.max)
  }


  return (
    <div className="flex flex-col h-screen bg-gray-50 pt-20">
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-semibold text-gray-800">산책 추천</h1>
        <p className="text-sm text-gray-500 mt-1">원하는 조건을 선택하고 시작을 눌러주세요</p>
      </div>

      <div className="flex-1 flex justify-center items-start px-6">
        <form
          method="get"
          action="/recommend/recpaths"
          className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-6"
        >
          <input type="hidden" name="timeMin" value={timeMin} />
          <input type="hidden" name="timeMax" value={timeMax} />

          <div className="flex flex-col">
            <label htmlFor="Time" className="text-sm font-medium text-gray-700 mb-2">
              시간
            </label>
            <select
              id="Time"
              onChange={handleTimeChange}
              className="max-w-full border border-gray-300 rounded-md p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              defaultValue=""
            >
              <option value="" disabled>시간 선택</option>
              <option value='{"min":0,"max":0.5}'>30분 미만</option>
              <option value='{"min":0.5,"max":1.0}'>30분 이상 1시간 미만</option>
              <option value='{"min":1.0,"max":1.5}'>1시간 이상 1시간 30분 미만</option>
              <option value='{"min":1.5,"max":2.0}'>1시간 30분 이상 2시간 미만</option>
              <option value='{"min":2.0}'>2시간 이상</option>
            </select>
          </div>


          <div className="flex flex-col">
            <label htmlFor="Items" className="text-sm font-medium text-gray-700 mb-2">
              작품 수
            </label>
            <select
              name="maxLocations"
              id="Items"
              className="max-w-full border border-gray-300 rounded-md p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="1">1개</option>
              <option value="2">2개 이하</option>
              <option value="3">3개 이하</option>
              <option value="4">4개 이하</option>
              <option value="5">5개 이하</option>
            </select>
          </div>

          <div className="flex justify-center">
            <input
              type="submit"
              value="시작"
              className="w-32 py-3 bg-blue-500 text-white text-lg font-semibold rounded-full hover:bg-blue-600 transition"
            />
          </div>
        </form>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <BottomNav activeIndex={1} />
      </div>
    </div>
  )
}
