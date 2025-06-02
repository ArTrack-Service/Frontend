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
    const [routeItems, setRouteItems] = useState(() => {
    if (typeof window !== 'undefined') {
        try {
        const saved = localStorage.getItem('routeItems')
        return saved ? JSON.parse(saved) : []
        } catch (e) {
        console.error('로컬스토리지 읽기 오류:', e)
        return []
        }
    }
    return []
    })

    useEffect(() => {
        if (typeof window === 'undefined') return
        try {
            localStorage.setItem('routeItems', JSON.stringify(routeItems))
        } catch (e) {
            console.error('localStorage 쓰기 실패:', e)
        }
    }, [routeItems])

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
                <div className="flex items-center justify-center min-h-screen bg-black/40 backdrop-blur-sm p-4">
                    <Dialog.Panel className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6 border-b pb-3">
                            <Dialog.Title className="text-xl font-bold text-gray-800">추가된 경로</Dialog.Title>
                            <button onClick={() => setShowRoutePopup(false)} className="hover:text-gray-700 transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {routeItems.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center">추가된 항목이 없습니다.</p>
                        ) : (
                            <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                {routeItems.map((item) => (
                                    <li
                                        key={item.id}
                                        className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-start hover:shadow-sm transition-shadow"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{item.address}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (routeItems.find((i) => i.id === item.id)) {
                                                    const confirmRemove = window.confirm("이 항목을 삭제하시겠습니까?");
                                                    if (confirmRemove) {
                                                        setRouteItems((prev) => prev.filter((i) => i.id !== item.id));
                                                    }
                                                } else {
                                                    alert("이미 삭제된 항목입니다.");
                                                }
                                            }}
                                            className="text-red-500 hover:text-red-600 transition-colors text-sm font-medium"
                                            title="삭제"
                                        >
                                            <X className="w-4 h-4" />
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
