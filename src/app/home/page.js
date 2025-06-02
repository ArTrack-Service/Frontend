'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import BottomNav from '../../components/BottomNav'
import SearchBar from '../../components/SearchBar'
import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'

const MapViewer = dynamic(() => import('../../components/MapViewer'), { ssr: false })
const BottomSheet = dynamic(() => import('../../components/BottomSheet'), { ssr: false })

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL 

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedItem, setSelectedItem] = useState(null)
    const [showRoutePopup, setShowRoutePopup] = useState(false)
    const [items, setItems] = useState([])
    const [routeItems, setRouteItems] = useState([])

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

    useEffect(() => {
        const fetchArtworks = async () => {
            try {
                const res = await fetch(`${BASE_URL}/artwork`)
                if (!res.ok) throw new Error('데이터 로딩 실패')
                const data = await res.json()
                setItems(data)
            } catch (error) {
                console.error('예술작품 불러오기 오류:', error)
            }
        }

        fetchArtworks()
    }, [])

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
