'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import BottomNav from '../components/BottomNav'
import SearchBar from '../components/SearchBar'
import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'

const MapViewer = dynamic(() => import('../components/MapViewer'), { ssr: false })
const BottomSheet = dynamic(() => import('../components/BottomSheet'), { ssr: false })

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedItem, setSelectedItem] = useState(null)
    const [showRoutePopup, setShowRoutePopup] = useState(false)

    const realLocations = [
        '서울특별시 종로구 세종대로 175',
        '서울특별시 중구 명동길 74',
        '서울특별시 용산구 이태원로 294',
        '서울특별시 송파구 올림픽로 300',
        '서울특별시 강남구 테헤란로 521',
        '서울특별시 마포구 양화로 45',
        '서울특별시 동작구 흑석로 84',
        '서울특별시 서초구 반포대로 201',
        '서울특별시 성북구 안암로 145',
        '서울특별시 은평구 통일로 1050',
    ]

    const items = [...Array(10)].map((_, idx) => ({
        id: idx,
        name: `작품명 ${idx + 1}`,
        description: `이 작품은 ${idx + 1}번째 작품으로, 아름다운 예술성을 지니고 있습니다.`,
        location: realLocations[idx],
        category: ['회화', '조각', '사진', '설치'][idx % 4],
        isFavorite: idx % 3 === 0,
        image: `https://picsum.photos/seed/art${idx}/200/150`,
        rating: (Math.random() * 5).toFixed(1),
    }))

    const [routeItems, setRouteItems] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('routeItems')
                return saved ? JSON.parse(saved) : []
            } catch {
                return []
            }
        }
        return []
    })

    useEffect(() => {
        localStorage.setItem('routeItems', JSON.stringify(routeItems))
    }, [routeItems])


    

    return (
        <div className="relative w-full h-screen overflow-hidden flex flex-col">
            {/* 검색창 */}
            <div className="flex-1 relative">
                <div className="absolute top-4 z-10 w-full">
                    <SearchBar onSearch={setSearchQuery} />
                </div>
                <button
                    className="fixed top-25 right-5 z-50 bg-white shadow-lg rounded-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-100 transition"
                    onClick={() => setShowRoutePopup(true)}
                >
                    경로 보기
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                        {routeItems.length}
                    </span>
                </button>
                <MapViewer
                    items={items}
                    setSelectedItem={setSelectedItem}
                    routeItems={routeItems}
                    setRouteItems={setRouteItems}
                />
            </div>

            {/* 모달 팝업 */}
            <Dialog open={showRoutePopup} onClose={() => setShowRoutePopup(false)} className="fixed z-30 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen bg-black/30 p-4">
                    <Dialog.Panel className="bg-white w-full max-w-md rounded-lg shadow-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <Dialog.Title className="text-lg font-semibold">추가된 경로</Dialog.Title>
                            <button onClick={() => setShowRoutePopup(false)}>
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        {routeItems.length === 0 ? (
                            <p className="text-gray-500 text-sm">추가된 항목이 없습니다.</p>
                        ) : (
                            <ul className="space-y-2 max-h-[300px] overflow-y-auto">
                                {routeItems.map((item) => (
                                    <li key={item.id} className="flex justify-between items-center border-b pb-2">
                                        <div>
                                            <p className="text-sm font-medium">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.location}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (routeItems.find((i) => i.id === item.id)) {
                                                    const confirmRemove = window.confirm("이 항목을 삭제하시겠습니까?")
                                                    if (confirmRemove) {
                                                        setRouteItems((prev) => prev.filter((i) => i.id !== item.id))
                                                    }
                                                } else {
                                                    alert("이미 삭제된 항목입니다.")
                                                }
                                            }}
                                            className="text-red-500 text-xs hover:underline"
                                        >
                                            삭제
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Dialog.Panel>
                </div>
            </Dialog>
                        
            <BottomSheet
                searchQuery={searchQuery}
                items={items}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                routeItems={routeItems}
                setRouteItems={setRouteItems}
            />
            <BottomNav activeIndex={0} />
        </div>
    )
}
