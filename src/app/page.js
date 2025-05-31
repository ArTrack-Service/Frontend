'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import BottomNav from '../components/BottomNav'
import SearchBar from '../components/SearchBar'

const MapViewer = dynamic(() => import('../components/MapViewer'), { ssr: false })
const BottomSheet = dynamic(() => import('../components/BottomSheet'), { ssr: false })

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <div className="relative w-full h-screen overflow-hidden flex flex-col">
            <div className="flex-1 relative">
                <div className="absolute top-4 z-10 w-full">
                    <SearchBar onSearch={setSearchQuery} />
                </div>
                <MapViewer />
            </div>
            <BottomSheet searchQuery={searchQuery} />
            <BottomNav activeIndex={0}/>
        </div>
    )
}
