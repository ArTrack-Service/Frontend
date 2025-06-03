// mypath/path/path.js
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ChevronLeft, GripVertical, Trash2, QrCode, X } from 'lucide-react'
import { Dialog } from '@headlessui/react'
import QRCodeWrapper from '@/components/QRcode'

const MapWithRoute = dynamic(() => import('../../../components/MapWithRoute'), { ssr: false })

export default function MyPath() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const searchParams = useSearchParams()
  const router = useRouter()

  const [path, setPath] = useState({
    id: '',
    name: '',
    description: '',
    createdAt: '',
    points: [],
    canShare: false,
    time: 0,
  })

  const [isEdit, setIsEdit] = useState(false)
  const [memo, setMemo] = useState('')
  const [name, setName] = useState('')
  const [share, setShare] = useState(false)
  const [routeItems, setRouteItems] = useState([])
  const [originalItems, setOriginalItems] = useState([])
  const [time, setTime] = useState(0)

  const [showQRModal, setShowQRModal] = useState(false)

  const categoriesMap = {
    전체: '전체',
    publicArt: '공공미술',
    gallery: '갤러리',
    sculpture: '조각',
    statue: '동상',
  }

  useEffect(() => {
    const pathString = searchParams.get('path')
    if (!pathString) {
      router.replace('/mypath')
      return
    }
    const parsedPath = JSON.parse(decodeURIComponent(pathString))
    setPath(parsedPath)
    setName(parsedPath.name || '')
    setMemo(parsedPath.description || '')
    setShare(parsedPath.canShare || false)
    setTime(parsedPath.time || 0)

    if (Array.isArray(parsedPath.points) && parsedPath.points.length > 0) {
      Promise.all(
        parsedPath.points.map(async (pointId) => {
          const res = await fetch(`${BASE_URL}/artwork/${pointId}`, {
            method: 'GET',
            credentials: 'include',
          })
          if (!res.ok) throw new Error('작품 정보 로딩 실패')
          return res.json()
        })
      )
        .then((results) => {
          setRouteItems(results)
          setOriginalItems(results)
        })
        .catch((err) => console.error(err))
    }
  }, [searchParams, BASE_URL, router])

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('drag-index', index.toString())
  }
  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    const dragIndex = Number(e.dataTransfer.getData('drag-index'))
    if (dragIndex === dropIndex) return
    const updated = [...routeItems]
    const [dragged] = updated.splice(dragIndex, 1)
    updated.splice(dropIndex, 0, dragged)
    setRouteItems(updated)
  }
  const handleDragOver = (e) => e.preventDefault()

  const handleSave = async () => {
    const updatedPath = {
      id: path.id,
      createdAt: path.createdAt,
      name: name.trim(),
      description: memo.trim(),
      points: routeItems.map((item) => item.id),
      canShare: share,
      time: time,
    }

    try {
      const res = await fetch(`${BASE_URL}/course`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPath),
      })
      if (res.status === 401) {
        router.replace('/')
        return
      }
      if (!res.ok) throw new Error(`서버 오류: ${res.status}`)

      const result = await res.json()
      setPath(result)
      setOriginalItems(routeItems)
      setIsEdit(false)
      alert('경로가 성공적으로 수정되었습니다.')
      router.push('/mypath')
    } catch (error) {
      console.error('저장 실패:', error)
      alert('경로 저장에 실패했습니다.')
    }
  }

  const handleCancel = () => {
    setRouteItems(originalItems)
    setName(path.name)
    setMemo(path.description)
    setShare(path.canShare)
    setIsEdit(false)
    setTime(path.time)
  }

  const handleDelete = async () => {
    if (!window.confirm('해당 경로를 삭제하시겠습니까?')) return
    try {
      const res = await fetch(`${BASE_URL}/course/${path.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.status === 401) {
        router.replace('/')
        return
      }
      if (!res.ok) throw new Error(`삭제 실패: ${res.status}`)
      alert('경로가 삭제되었습니다.')
      router.push('/mypath')
    } catch (error) {
      console.error('삭제 실패:', error)
      alert('경로 삭제에 실패했습니다.')
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white border-b shadow-sm p-4 flex items-center">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800 transition mr-4"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {isEdit ? (
          <div className="flex-1 flex items-center gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="경로 이름 입력"
              className="flex-1 border-b border-gray-300 text-lg font-semibold text-gray-800 px-2 py-1 focus:outline-none focus:border-blue-500"
            />
            <label className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-sm text-gray-700">공유</span>
              <div className="relative inline-block w-11 h-6">
                <input
                  type="checkbox"
                  checked={share}
                  onChange={(e) => setShare(e.target.checked)}
                  className="absolute opacity-0 w-0 h-0 peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer-focus:ring-2 peer-focus:ring-blue-500 transition-colors peer-checked:bg-blue-600"></div>
                <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition transform peer-checked:translate-x-full"></div>
              </div>
            </label>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-800 truncate">{path.name}</h1>
            {share && (
              <button
                onClick={() => setShowQRModal(true)}
                className="ml-4 text-gray-600 hover:text-gray-800 transition"
                title="QR 코드 보기"
              >
                <QrCode className="w-6 h-6" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <section>
          <p className="text-sm font-medium text-gray-700 mb-2">지도</p>
          <div className="w-full h-52 bg-white rounded-lg overflow-hidden shadow-sm">
            <MapWithRoute routeItems={routeItems} />
          </div>
        </section>

        <section>
          <p className="text-sm font-medium text-gray-700 mb-2">예술작품</p>
          <div className={`${isEdit ? '' : 'max-h-64 overflow-y-auto'} flex flex-col gap-3`}>
            {routeItems.map((artwork, idx) => (
              <div
                key={artwork.id}
                className="bg-white rounded-lg shadow-sm p-3 flex items-center gap-3 hover:shadow-md transition"
                draggable={isEdit}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, idx)}
              >
                {isEdit && (
                  <div className="w-4 text-gray-400 cursor-grab">
                    <GripVertical className="w-4 h-4" />
                  </div>
                )}
                <div className="w-14 h-14 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                  {artwork.image ? (
                    <img
                      src={artwork.image}
                      alt={artwork.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-xs text-gray-400">이미지 없음</div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 truncate">{artwork.name}</h4>
                  <p className="text-sm text-gray-500 truncate">{artwork.address}</p>
                  <p className="text-xs text-blue-500 mt-0.5">
                    # {categoriesMap[artwork.type]}
                  </p>
                </div>
                {isEdit && (
                  <button
                    onClick={() =>
                      setRouteItems((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="text-red-500 hover:text-red-600 transition px-2"
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="text-sm font-medium text-gray-700 mb-2">메모</p>
          {isEdit ? (
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full h-32 border rounded-lg p-2 text-sm shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="메모를 입력하세요"
            />
          ) : (
            <div className="w-full h-32 border rounded-lg p-3 text-sm bg-white shadow-inner overflow-y-auto">
              {memo || '메모가 없습니다.'}
            </div>
          )}
        </section>
      </div>

      <div className="bg-white border-t shadow-inner p-4 flex items-center justify-between">
        {isEdit ? (
          <>
            <button
              onClick={handleSave}
              className="flex-1 mr-2 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              저장하기
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 ml-2 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition"
            >
              취소하기
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEdit(true)}
              className="flex-1 mr-2 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              수정하기
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 ml-2 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition flex items-center justify-center gap-1"
            >
              <Trash2 className="w-5 h-5" />
              삭제하기
            </button>
          </>
        )}
      </div>

      <Dialog
        open={showQRModal}
        onClose={() => setShowQRModal(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      >
        <Dialog.Panel className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">QR 코드</h2>
            <button onClick={() => setShowQRModal(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex justify-center">
            <QRCodeWrapper value={JSON.stringify(path)} />
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  )
}
