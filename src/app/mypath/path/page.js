"use client"

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ChevronLeft, GripVertical, X } from 'lucide-react'
import QRCodeWrapper from '@/components/QRcode'

const MapViewer = dynamic(() => import('@/components/MapViewer'), { ssr: false })
const MapWithRoute = dynamic(() => import('@/components/MapWithRoute'), { ssr: false })

export default function MyPath() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const searchParams = useSearchParams()
  const [path, setPath] = useState({ name: '', description: '' })
  const [isEdit, setIsEdit] = useState(false)
  const [memo, setMemo] = useState('')
  const [name, setName] = useState('')
  const [share, setShare] = useState(false)
  const [routeItems, setRouteItems] = useState([])
  const [originalItems, setOriginalItems] = useState([])
  const router = useRouter()

  const categoriesMap = {
    '전체': '전체',
    'publicArt': '공공미술',
    'gallery': '갤러리',
    'sculpture': '조각',
    'statue': '동상',
  }

  useEffect(() => {
    const pathString = searchParams.get('path')
    const parsedPath = pathString ? JSON.parse(decodeURIComponent(pathString)) : null
    if (parsedPath) {
      setPath(parsedPath)
      setMemo(parsedPath.description || '')
      setName(parsedPath.name || '')
    }

    if (!parsedPath || !parsedPath.points) return

    const fetchData = async () => {
      const results = []
      for (const point of parsedPath.points) {
        try {
          const res = await fetch(`${BASE_URL}/artwork/${point}`)
          if (!res.ok) throw new Error('API 요청 실패')
          const result = await res.json()
          results.push(result)
        } catch (error) {
          console.error(error.message)
        }
      }

      setRouteItems(results)
      setOriginalItems(results)
      setShare(parsedPath.canShare)
    }
    fetchData()

  }, [])

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('drag-index', index)
  }

  const handleDrop = (e, dropIndex) => {
    const dragIndex = Number(e.dataTransfer.getData('drag-index'))
    if (dragIndex === dropIndex) return
    const updated = [...routeItems]
    const [dragged] = updated.splice(dragIndex, 1)
    updated.splice(dropIndex, 0, dragged)
    setRouteItems(updated)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleSave = async () => {
    const updatedPath = {
      name: name, // 제목 상태값
      description: memo, // 메모 상태값
      points: routeItems.map(item => item.id), // 예술작품 id 리스트
      canShare: share
    }

    try {
      const res = await fetch(`${BASE_URL}/course`, {
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


  return (
    <div className="flex flex-col h-screen px-4 py-5 bg-white">
      <div className="relative p-4 pb-2 rounded-md">
        <button onClick={() => router.back()} className="absolute top-4 left-4 text-gray-500 hover:text-gray-700">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="pl-10 pr-10 flex flex-row justify-between items-center">
          {isEdit ? (
            <>
              <input
                type='text'
                value={name}
                onChange={e => setName(e.target.value)}
                className="text-lg font-semibold text-gray-800 border rounded px-2 py-1"
              />
              <label className="inline-flex items-center cursor-pointer ml-4">
                <span className="mr-2 text-sm text-gray-700">공유</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={share}
                    onChange={(e) => setShare(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600" />
                  <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition peer-checked:translate-x-full" />
                </div>
              </label>
            </>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-gray-800">{path.name}</h1>
              {share && <QRCodeWrapper />}
            </>
          )}
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
        <div className={`${isEdit ? '' : 'max-h-64 overflow-y-auto'} flex flex-col gap-4`}>
          {routeItems.map((artwork, idx) => (
            <div key={idx}
              className="flex gap-3 items-center bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
              draggable={isEdit}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, idx)}>

              <div className="w-4 text-gray-500 cursor-grab">
                {isEdit && <GripVertical className="w-4 h-4" />}
              </div>
              <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-500 overflow-hidden">
                {artwork.image ? (
                  <img
                    src={artwork.image}
                    alt={artwork.name}
                    className="w-full h-full object-cover rounded-md"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                    이미지
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-base">{artwork.name}</h4>
                <p className="text-sm text-gray-500">{artwork.address}</p>
                <p className="text-xs text-blue-400 mt-0.5"># {categoriesMap[artwork.type]}</p>
              </div>
              {isEdit && (
                <button
                  onClick={() => {
                    setRouteItems(prev => prev.filter((_, i) => i !== idx))
                  }}
                  className="text-red-600 text-sm font-medium hover:text-red-800 transition"
                >
                  제거
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {isEdit ? (
        <div>
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">메모</p>
            <textarea
              className='w-full h-40 overflow-y-auto shadow-lg border rounded p-2 text-sm'
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => {
                // 새 path 객체 구성
                const updatedPath = {
                  ...path,
                  name: name, // 사용자 입력으로 변경된 제목
                  description: memo, // 사용자 입력으로 변경된 메모
                  points: routeItems.map(item => item.id), // 순서 반영된 예술작품 ID 목록
                  canShare: share // 공유할지 여부
                }

                // 상태 업데이트
                setPath(updatedPath)
                setOriginalItems(routeItems) // 원본도 갱신 (취소 시 이 상태로 복원됨)
                setIsEdit(false)
                handleSave()


              }}

              className="flex-1 bg-blue-600 text-white py-2 rounded shadow hover:bg-blue-700"
            >
              저장하기
            </button>
            <button
              onClick={() => {
                setRouteItems(originalItems)
                setName(path.name)
                setMemo(path.description)
                setIsEdit(false)
              }}
              className="flex-1 bg-red-600 text-white py-2 rounded shadow hover:bg-gray-400"
            >
              취소하기
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">메모</p>
            <p className='w-full h-40 overflow-y-auto shadow-lg rounded p-2 text-sm'>{memo}</p>
          </div>
          <div className="pt-4">
            <button
              onClick={() => setIsEdit(true)}
              className="w-full bg-blue-600 text-white py-2 rounded shadow hover:bg-blue-700"
            >
              수정하기
            </button>
          </div>
        </div>
      )}
      <div className="h-16" />
    </div>
  )
}
