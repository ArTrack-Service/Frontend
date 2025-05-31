'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import BottomNav from '../components/BottomNav'
import SearchBar from '../components/SearchBar'

const MapViewer = dynamic(() => import('../components/MapViewer'), { ssr: false })
const BottomSheet = dynamic(() => import('../components/BottomSheet'), { ssr: false })

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('')
    
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

    return (
        <div className="relative w-full h-screen overflow-hidden flex flex-col">
            <div className="flex-1 relative">
                <div className="absolute top-4 z-10 w-full">
                    <SearchBar onSearch={setSearchQuery} />
                </div>
                <MapViewer items={items} />
            </div>
            <BottomSheet searchQuery={searchQuery} items={items} />
            <BottomNav activeIndex={0}/>
        </div>
    )
}
