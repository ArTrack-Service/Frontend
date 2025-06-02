'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import BottomNav from '../../components/BottomNav'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { useRouter } from 'next/navigation'

const MapWithRoute = dynamic(() => import('../../components/MapWithRoute'), { ssr: false })

function SortableItem({ item, onRemove, onClick }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: item.id.toString(), 
    })
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <li
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="border border-gray-300 rounded-lg p-4 flex justify-between items-center bg-white shadow-sm hover:shadow-md hover:bg-gray-50 transition cursor-move"
        >
        <div
            onClick={() => onClick(item.id)}
            className="flex flex-col flex-1 cursor-pointer"
        >
            <p className="font-semibold text-base text-gray-900">{item.name}</p>
            <p className="text-sm text-gray-500 mt-1">{item.address}</p>
        </div>

        <button
            onClick={() => onRemove(item.id)}
            className="text-red-600 text-sm font-medium hover:text-red-800 transition"
            aria-label={`삭제 ${item.name}`}
        >
            삭제
        </button>
        </li>
    )
    }

    export default function RoutePreviewPage() {
    const [routeItems, setRouteItems] = useState([])
    const [showDialog, setShowDialog] = useState(false)
    const [memo, setMemo] = useState('')
    const [routeName, setRouteName] = useState('')
    const [share, setShare] = useState(false)

    const [detailOpen, setDetailOpen] = useState(false)
    const [detailData, setDetailData] = useState(null)
    const [detailLoading, setDetailLoading] = useState(false)

    const router = useRouter()
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('routeItems')
                if (saved) setRouteItems(JSON.parse(saved))
            } catch (e) {
                console.error('로컬스토리지 읽기 오류:', e)
            }
        }
    }, [])

    const setLocalStorage = (items) => {
        try {
            localStorage.setItem('routeItems', JSON.stringify(items))
        } catch (e) {
            console.error('로컬스토리지 쓰기 오류:', e)
        }   
    }

    const handleRemove = (id) => {
        const updated = routeItems.filter((i) => i.id !== id)
        setRouteItems(updated)
        setLocalStorage(updated)
    }

    const mouseSensor = useSensor(MouseSensor)
    const touchSensor = useSensor(TouchSensor, {
    })
    const sensors = useSensors(mouseSensor, touchSensor)

    function handleDragEnd(event) {
        const { active, over } = event

        if (active.id !== over?.id) {
            const oldIndex = routeItems.findIndex((item) => item.id.toString() === active.id)
            const newIndex = routeItems.findIndex((item) => item.id.toString() === over.id)

            const newItems = arrayMove(routeItems, oldIndex, newIndex)
            setRouteItems(newItems)
            setLocalStorage(newItems)
        }
    }

    const openDetailModal = async (artworkId) => {
        setDetailLoading(true)
        setDetailOpen(true)
        try {
            const res = await fetch(`${BASE_URL}/artwork/${artworkId}`, {
                method: 'GET',
                credentials: 'include',
        })
        if (!res.ok) throw new Error('상세정보 로딩 실패')
            const data = await res.json()
            setDetailData(data)
        } catch (err) {
            console.error('작품 상세정보 불러오기 오류:', err)
            alert('작품 상세정보를 불러오지 못했습니다.')
            setDetailOpen(false)
        } finally {
            setDetailLoading(false)
        }
    }

    const handleSaveCourse = async () => {
        if (!routeName.trim()) {
            alert('경로 이름을 입력해주세요.')
        return
        }
        if (routeItems.length === 0) {
            alert('경로에 포함할 장소가 없습니다.')
        return
        }

        const payload = {
            name: routeName,
            description: memo,
            points: routeItems.map((item) => item.id),
            canShare: share,
        }

        try {
            const res = await fetch(`${BASE_URL}/course`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            })

            if (!res.ok) throw new Error('서버 오류')

            alert('경로가 저장되었습니다.')
            router.push('/mypath')
            setRouteItems([])
            setLocalStorage([])
        } catch (err) {
            console.error('코스 저장 실패:', err)
            alert('경로 저장에 실패했습니다.')
        }
    }

    return (
        <div className="p-4 space-y-4 pb-20">
            <h1 className="text-2xl mt-10 mb-5 font-bold">나의 예술 산책 경로</h1>

            <div className="w-full h-64 rounded-xl overflow-hidden border">
                <MapWithRoute routeItems={routeItems} />
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
            >
                <SortableContext
                    items={routeItems.map((i) => i.id.toString())}
                    strategy={verticalListSortingStrategy}
                >
                <ul className="space-y-2">
                    {routeItems.map((item) => (
                    <SortableItem
                        key={item.id}
                        item={item}
                        onRemove={handleRemove}
                        onClick={openDetailModal}
                    />
                    ))}
                </ul>
                </SortableContext>
            </DndContext>

            <div className="pt-4">
                <button
                    onClick={() => router.push('/home')}
                    className="w-full bg-blue-600 text-white py-2 rounded shadow hover:bg-blue-700 transition"
                >
                작품 추가하기
                </button>
            </div>

            <div>
                <button
                    onClick={() => setShowDialog(true)}
                    className="w-full bg-indigo-500 text-white py-2 rounded shadow hover:bg-indigo-600 transition"
                >
                경로 추가하기
                </button>
            </div>

            <Dialog
                open={showDialog}
                onClose={() => setShowDialog(false)}
                className="fixed inset-0 z-2000"
            >
                <div className="flex items-center justify-center min-h-screen bg-black/40 px-4">
                <Dialog.Panel className="bg-white w-full max-w-md rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center">
                    <Dialog.Title className="text-lg font-semibold">경로 정보 입력</Dialog.Title>
                    <button onClick={() => setShowDialog(false)}>
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                    </div>

                    <input
                        type="text"
                        value={routeName}
                        onChange={(e) => setRouteName(e.target.value)}
                        placeholder="경로 이름을 입력하세요"
                        className="w-full border rounded p-2 text-sm"
                    />

                    <textarea
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="이 경로에 대해 메모를 남겨주세요"
                        className="w-full border rounded p-2 text-sm"
                        rows={4}
                    />

                    <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={share}
                        onChange={(e) => setShare(e.target.checked)}
                    />
                    다른 사람과 공유하시겠습니까?
                    </label>

                    <button
                        onClick={handleSaveCourse}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                    추가하기
                    </button>
                </Dialog.Panel>
                </div>
            </Dialog>

            <Dialog
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                className="fixed inset-0 z-3000"
            >
                <div className="flex items-center justify-center min-h-screen bg-black/50 px-4">
                <Dialog.Panel className="bg-white w-full max-w-lg rounded-lg p-6 space-y-4 overflow-y-auto max-h-[80vh]">
                    <div className="flex justify-between items-center">
                        <Dialog.Title className="text-xl font-bold">
                            {detailLoading ? '로딩 중...' : detailData?.name || '작품 상세정보'}
                        </Dialog.Title>
                        <button onClick={() => setDetailOpen(false)}>
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    {detailLoading ? (
                        <p className="text-center text-gray-500">잠시만 기다려주세요...</p>
                    ) : detailData ? (
                        <div className="space-y-4">
                            <img
                                src={detailData.image}
                                alt={detailData.name}
                                className="w-full h-60 object-cover rounded-md shadow-md"
                                loading="lazy"
                            />

                            <div className="space-y-2">
                                <p className="text-base text-gray-600">
                                    <span className="font-semibold">카테고리:</span> {detailData.category}
                                </p>
                                <p className="text-base text-gray-600">
                                    <span className="font-semibold">위치:</span> {detailData.address}
                                </p>
                                <p className="text-base text-gray-600">
                                    <span className="font-semibold">평점:</span> {detailData.rating} / 5
                                </p>
                                <p className="text-base text-gray-600">
                                    <span className="font-semibold">설명:</span>
                                </p>
                                <p className="text-gray-700 whitespace-pre-line">{detailData.description}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">정보를 불러올 수 없습니다.</p>
                    )}
                </Dialog.Panel>
                </div>
            </Dialog>

            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50">
                <BottomNav activeIndex={2} />
            </div>
        </div>
    )
}
