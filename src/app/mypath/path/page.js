// mypath/path/path.js
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ChevronLeft, Trash2, QrCode, X } from 'lucide-react'
import { Dialog } from '@headlessui/react'

import {
  DndContext,
  closestCenter
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import QRCodeWrapper from '@/components/QRcode'

// 지도를 클라이언트 전용으로 로드
const MapWithRoute = dynamic(() => import('../../../components/MapWithRoute'), { ssr: false })

// SortableItem: 각 리스트 항목 하나 
function SortableItem({ item, onRemove, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id.toString(),
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'none', // 모바일 터치 환경에서도 드래그가 되도록
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow-sm p-3 flex items-center gap-3 hover:shadow-md transition cursor-grab"
    >
      {/* 드래그 핸들 */}
      <div className="w-4 text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4m-4 4h4m-4 4h4m-4 4h4m-4 4h4" />
        </svg>
      </div>

      {/* 클릭 시 상세 처리 */}
      <div
        onClick={() => onClick(item.id)}
        className="flex-1 flex flex-col cursor-pointer"
      >
        <p className="font-semibold text-gray-800">{item.name}</p>
        <p className="text-sm text-gray-500 break-words whitespace-normal">
          {item.address}
        </p>
      </div>

      <button
        onClick={() => onRemove(item.id)}
        className="text-red-500 hover:text-red-600 transition px-2"
        aria-label={`삭제 ${item.name}`}
      >
        삭제
      </button>
    </li>
  )
}


export default function MyPath() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const searchParams = useSearchParams()
  const router = useRouter()

  // 경로 전체 데이터
  const [path, setPath] = useState({
    id: '',
    name: '',
    description: '',
    createdAt: '',
    points: [],
    canShare: false,
    time: 0,
  })

  // 편집 모드 / 일반 모드
  const [isEdit, setIsEdit] = useState(false)
  const [memo, setMemo] = useState('')
  const [name, setName] = useState('')
  const [share, setShare] = useState(false)
  const [time, setTime] = useState(0)

  // 예술작품 리스트 (상세 정보)
  const [routeItems, setRouteItems] = useState([])
  // 편집 취소 시 원본 복구용
  const [originalItems, setOriginalItems] = useState([])

  // QR 모달 열림/닫힘
  const [showQRModal, setShowQRModal] = useState(false)

  const categoriesMap = {
    전체: '전체',
    publicArt: '공공미술',
    gallery: '갤러리',
    sculpture: '조각',
    statue: '동상',
  }

  // 1) URL 쿼리에서 path 객체 파싱 + 예술작품 상세 fetch
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

    // artwork ID 배열이 있으면, 각 아이디로 상세 정보 가져오기
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

  // 2) 드래그 종료 시 호출 → 배열 순서 교체
  function handleDragEnd(event) {
    const { active, over } = event
    if (!over) return
    if (active.id !== over.id) {
      const oldIndex = routeItems.findIndex(i => i.id.toString() === active.id)
      const newIndex = routeItems.findIndex(i => i.id.toString() === over.id)
      const newItems = arrayMove(routeItems, oldIndex, newIndex)
      setRouteItems(newItems)
    }
  }

  // 3) 저장 (PUT 요청)
  async function handleSave() {
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

  // 4) 편집 취소
  function handleCancel() {
    setRouteItems(originalItems)
    setName(path.name)
    setMemo(path.description)
    setShare(path.canShare)
    setTime(path.time)
    setIsEdit(false)
  }

  // 5) 삭제 (DELETE 요청)
  async function handleDelete() {
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

  // 6) 작품 클릭 시 상세보기 처리 (필요 시 구현)
  function handleItemClick(artworkId) {
    router.push(`/artwork/${artworkId}`) // 예시: 상세 페이지로 이동
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* ─── 헤더 ─── */}
      <div className="bg-white border-b shadow-sm p-4 flex items-center">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800 transition mr-4"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {isEdit ? (
          <div className="flex-1 flex items-center gap-4">
            {/* 경로 이름 입력 */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="경로 이름 입력"
              className="flex-1 border-b border-gray-300 text-lg font-semibold text-gray-800 px-2 py-1 focus:outline-none focus:border-blue-500"
            />
            {/* 공유 토글 */}
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

      {/* ─── 본문 (스크롤 가능) ─── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* 지도 섹션 */}
        <section>
          <p className="text-sm font-medium text-gray-700 mb-2">지도</p>
          <div className="w-full h-52 bg-white rounded-lg overflow-hidden shadow-sm">
            <MapWithRoute routeItems={routeItems} />
          </div>
        </section>

        {/* 예술작품(드래그/소팅) 섹션 */}
        <section>
          <p className="text-sm font-medium text-gray-700 mb-2">예술작품</p>
          {isEdit ? (
             <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={routeItems.map((i) => i.id.toString())}
              strategy={verticalListSortingStrategy}
            >
              <ul className={`${isEdit ? '' : 'max-h-64 overflow-y-auto'} flex flex-col gap-3`}>
                {routeItems.map((artwork) => (
                  <SortableItem
                    key={artwork.id}
                    item={artwork}
                    onRemove={(id) => {
                      const filtered = routeItems.filter((i) => i.id !== id)
                      setRouteItems(filtered)
                    }}
                    onClick={handleItemClick}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
          ) : (
            <ul className="flex flex-col gap-3 max-h-64 overflow-y-auto">
              {routeItems.map((artwork) => (
                <li
                  key={artwork.id}
                  className="bg-white rounded-lg shadow-sm p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition"
                  onClick={() => handleItemClick(artwork.id)}
                >
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
                        이미지 없음
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-base">{artwork.name}</h4>
                    <p className="text-sm text-gray-500">{artwork.address}</p>
                    <p className="text-xs text-blue-400 mt-0.5"># {categoriesMap[artwork.type]}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
         
        </section>

        {/* 메모 섹션 */}
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

      {/* ─── 하단 고정 버튼 ─── */}
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

      {/* ─── QR 코드 모달 ─── */}
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
