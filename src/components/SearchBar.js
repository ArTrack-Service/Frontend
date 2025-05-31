'use client'

import { useState } from 'react'

export default function SearchBar({ onSearch }) {
const [query, setQuery] = useState('')

const handleSearch = () => {
    onSearch(query.trim())
}

const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
    handleSearch()
    }
}

return (
    <div className="p-5 z-10">
        <div className="flex items-center bg-white backdrop-blur-sm border border-gray-300 rounded-full px-5 shadow-md">
            <input
                type="text"
                placeholder="작품명을 입력하세요"
                className="flex-1 py-2 px-3 outline-none bg-transparent text-gray-800 placeholder-gray-400"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <button className="text-blue-500 font-semibold" onClick={handleSearch}>
            검색
            </button>
        </div>
    </div>
)
}
