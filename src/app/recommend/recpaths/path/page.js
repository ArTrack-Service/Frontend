'use client'

import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ChevronLeft, X } from 'lucide-react'

const MapViewer = dynamic(() => import('@/components/MapViewer'), { ssr: false })
const MapWithRoute = dynamic(() => import('@/components/MapWithRoute'), { ssr: false })

export default function RecommendedPath() {
  const searchParams = useSearchParams()
  const [path, setPath] = useState([])
  const [showDialog, setShowDialog] = useState(false)
  const [memo, setMemo] = useState('')
  const [title, setTitle] = useState('')
  const [share, setShare] = useState(false)
  const [routeItems, setRouteItems] = useState([])

  const router = useRouter()

  const handleSave = async () => {
    const updatedPath = {
      name: title,
      description: memo,
      points: routeItems.map(item => item.id),
      canShare: share
    }

    try {
      const res = await fetch('https://api.artrack.moveto.kr/api/v1/course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedPath)
      })

      if (!res.ok) {
        throw new Error(`서버 오류: ${res.status}`)
      }

      const result = await res.json()
      console.log('저장 성공:', result)
    } catch (error) {
      console.error('저장 실패:', error)
    }
  }

  useEffect(() => {
    const pathString = searchParams.get('path')
    const parsedPath = pathString ? JSON.parse(decodeURIComponent(pathString)) : null
    if (!parsedPath || !parsedPath.points) return

    setPath(parsedPath)
    setTitle(parsedPath.name || '')
    setMemo(parsedPath.description || '')
    setShare(parsedPath.canShare || false)

    const fetchData = async () => {
      const results = []
      for (const point of parsedPath.points) {
        try {
          const res = await fetch(`https://api.artrack.moveto.kr/api/v1/artwork/${point}`)
          if (!res.ok) throw new Error('API 요청 실패')
          const result = await res.json()
          result.location = result.address
          result.category = result.type
          results.push(result)
        } catch (error) {
          console.error(error.message)
        }
      }
      setRouteItems(results)
    }

    fetchData()
  }, [])

  return (
    <div className="flex flex-col h-screen px-4 py-5 bg-white">
      <div className="relative p-4 pb-2 rounded-md">
        <button onClick={() => router.back()} className="absolute top-4 left-4 text-gray-500 hover:text-gray-700">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="pl-10">
          <h1 className="text-lg font-semibold text-gray-800">{path.name}</h1>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">지도</p>
        <div className="w-full h-64 rounded-md overflow-hidden shadow-md">
          <MapWithRoute routeItems={routeItems} />
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">예술작품</p>
        <div className="flex flex-col gap-4 max-h-64 overflow-y-auto">
          {routeItems.map((artwork, idx) => (
            <div key={idx} className="flex gap-3 items-center bg-white rounded-xl shadow-md p-4 mb-4 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-500 overflow-hidden">
                <img src={artwork.image} alt={artwork.name} className="w-full h-full object-cover rounded-md" loading="lazy" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{artwork.name}</h4>
                <p className="text-sm text-gray-500">{artwork.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <button onClick={() => setShowDialog(true)} className="w-full bg-blue-600 text-white py-2 rounded shadow hover:bg-blue-700 transition">
          추가하기
        </button>
      </div>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} className="fixed inset-0 z-2000">
        <div className="flex items-center justify-center min-h-screen bg-black/40 px-4">
          <Dialog.Panel className="bg-white w-full max-w-md rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <Dialog.Title className="text-lg font-semibold">경로 메모</Dialog.Title>
              <button onClick={() => setShowDialog(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <input type='text' value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded p-2 text-md" />
            <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="이 경로에 대해 메모를 남겨주세요" className="w-full border rounded p-2 text-sm" rows={4} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={share} onChange={e => setShare(e.target.checked)} />
              다른 사람과 공유하시겠습니까?
            </label>
            <button onClick={handleSave} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              추가하기
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>

      <div className="h-16" />
    </div>
  )
}
