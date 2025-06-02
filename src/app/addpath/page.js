'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import BottomNav from '../../components/BottomNav'
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

const MapWithRoute = dynamic(() => import('../../components/MapWithRoute'), { ssr: false })

function SortableItem({ item, onRemove }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id })
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
        <div className="flex flex-col">
            <p className="font-semibold text-base text-gray-900">{item.name}</p>
            <p className="text-sm text-gray-500 mt-1">{item.location}</p>
        </div>
        <button
            onClick={() => onRemove(item.id)}
            className="text-red-600 text-sm font-medium hover:text-red-800 transition"
            aria-label={`삭제 ${item.name}`}
        >
            삭제
        </button>
        </li>
    )}

    export default function RoutePreviewPage() {
    const [routeItems, setRouteItems] = useState([])
    const [showDialog, setShowDialog] = useState(false)
    const [memo, setMemo] = useState('')
    const [share, setShare] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('routeItems')
        if (saved) setRouteItems(JSON.parse(saved))  
    }, [])

    const handleRemove = (id) => {
        setRouteItems(prev => prev.filter(i => i.id !== id))
    }

    function handleDragEnd(event) {
        const { active, over } = event

        if (active.id !== over?.id) {
            const oldIndex = routeItems.findIndex(item => item.id === active.id)
            const newIndex = routeItems.findIndex(item => item.id === over.id)

            const newItems = arrayMove(routeItems, oldIndex, newIndex)
            setRouteItems(newItems)
        }
    }
    
    return (
        <div className="p-4 space-y-4 pb-20">
            <h1 className="text-2xl mt-10 mb-5 font-bold">나의 예술 산책 경로</h1>
            {/* 지도 */}
            <div className="w-full h-64 rounded-xl overflow-hidden border">
                <MapWithRoute routeItems={routeItems} />
            </div>

            {/* 리스트 */}
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                <SortableContext items={routeItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-2">
                    {routeItems.map(item => (
                    <SortableItem key={item.id} item={item} onRemove={handleRemove} />
                    ))}
                </ul>
                </SortableContext>
            </DndContext>

            {/* 추가하기 버튼 */}
            <div className="pt-4">
                <button
                    onClick={() => setShowDialog(true)}
                    className="w-full bg-blue-600 text-white py-2 rounded shadow hover:bg-blue-700 transition"
                >
                    추가하기
                </button>
            </div>

            {/* 팝업 */}
            <Dialog open={showDialog} onClose={() => setShowDialog(false)} className="fixed inset-0 z-2000">
                <div className="flex items-center justify-center min-h-screen bg-black/40 px-4">
                <Dialog.Panel className="bg-white w-full max-w-md rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center">
                    <Dialog.Title className="text-lg font-semibold">경로 메모</Dialog.Title>
                    <button onClick={() => setShowDialog(false)}><X className="w-5 h-5 text-gray-500" /></button>
                    </div>
                    <textarea
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="이 경로에 대해 메모를 남겨주세요"
                        className="w-full border rounded p-2 text-sm"
                        rows={4}
                    />
                    <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} />
                        다른 사람과 공유하시겠습니까?
                    </label>
                    <button
                        onClick={() => {
                            console.log('저장됨', { routeItems, memo, share })
                            alert('경로가 저장되었습니다.')
                            setShowDialog(false)
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        추가하기
                    </button>
                </Dialog.Panel>
                </div>
            </Dialog>
            <BottomNav activeIndex={2} />
        </div>
    )
}
