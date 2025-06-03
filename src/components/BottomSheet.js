'use client'

import { useEffect, useRef, useState } from 'react'
import { Star, StarOff, X } from 'lucide-react'

export default function BottomSheet({
    searchQuery,
    selectedItem,
    setSelectedItem,
    routeItems,
    setRouteItems,
}) {
    const sheetRef = useRef(null)
    const [startY, setStartY] = useState(0)
    const [currentHeight, setCurrentHeight] = useState(250)
    const [maxHeight, setMaxHeight] = useState(0)
    const [dragging, setDragging] = useState(false)

    const [favoriteIds, setFavoriteIds] = useState([])
    const [artworks, setArtworks] = useState([])

    const [activeCategory, setActiveCategory] = useState('전체')
    const [isFavoriteOnly, setIsFavoriteOnly] = useState(false)

    const MIN_HEIGHT = 150
    const categories = ['전체', 'publicArt', 'gallery', 'sculpture', 'statue']
    const categoriesMap = {
        '전체': '전체',
        'publicArt': '공공미술',
        'gallery': '갤러리',
        'sculpture': '조각',
        'statue': '동상',
    }

    const setLocalStorage = (items) => {
        try {
            localStorage.setItem('routeItems', JSON.stringify(items))
        } catch (e) {
            console.error('로컬스토리지 쓰기 오류:', e)
        }
    }

    useEffect(() => {
        setMaxHeight(window.innerHeight * 0.6)
    }, [])

    useEffect(() => {
        if (selectedItem) {
            setCurrentHeight(maxHeight * 0.6)
        } else {
            setCurrentHeight(250)
        }
    }, [selectedItem, maxHeight])

    const handleTouchStart = (e) => {
        setStartY(e.touches[0].clientY)
        setDragging(true)
    }

    const handleTouchMove = (e) => {
        if (!dragging) return
        const deltaY = e.touches[0].clientY - startY
        const newHeight = currentHeight - deltaY
        const clampedHeight = Math.max(MIN_HEIGHT, Math.min(maxHeight, newHeight))
        setCurrentHeight(clampedHeight)
    }

    const handleTouchEnd = () => setDragging(false)

    useEffect(() => {
        const sheet = sheetRef.current
        if (sheet) {
            sheet.addEventListener('touchmove', handleTouchMove)
            sheet.addEventListener('touchend', handleTouchEnd)
        }
        return () => {
            if (sheet) {
                sheet.removeEventListener('touchmove', handleTouchMove)
                sheet.removeEventListener('touchend', handleTouchEnd)
            }
        }
    }, [dragging, startY, currentHeight, maxHeight])

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/artwork/favorite`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                })
                if (!res.ok) throw new Error('즐겨찾기 목록 로딩 실패')
                const data = await res.json()
                const ids = data.map((art) => art.id)
                setFavoriteIds(ids)
            } catch (error) {
                console.error('즐겨찾기 목록 불러오기 오류:', error)
            }
        }
        fetchFavorites()
    }, [])

    useEffect(() => {
        const fetchArtworks = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/artwork`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                })
                if (!res.ok) throw new Error('작품 목록 로딩 실패')
                const data = await res.json()
                setArtworks(data)
            } catch (error) {
                console.error('작품 목록 불러오기 오류:', error)
                setArtworks([])
            }
        }
        fetchArtworks()
    }, [])

    const filteredItems = artworks.filter((item) => {
        const matchCategory = activeCategory === '전체' || item.type === activeCategory
        const matchFavorite = !isFavoriteOnly || favoriteIds.includes(item.id)
        const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchCategory && matchFavorite && matchSearch
    })

    const handleAddFavorite = async (artworkId) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/artwork/favorite`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ artworkId }),
            })
            if (!res.ok) throw new Error('즐겨찾기 추가 실패')
            setFavoriteIds((prev) => [...prev, artworkId])
        } catch (error) {
            console.error('즐겨찾기 추가 오류:', error)
            alert('즐겨찾기 추가 중 문제가 발생했습니다.')
        }
    }

    const handleRemoveFavorite = async (artworkId) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/artwork/favorite`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ artworkId }),
            })
            if (!res.ok) throw new Error('즐겨찾기 해제 실패')
            setFavoriteIds((prev) => prev.filter((id) => id !== artworkId))
        } catch (error) {
            console.error('즐겨찾기 해제 오류:', error)
            alert('즐겨찾기 해제 중 문제가 발생했습니다.')
        }
    }

    return (
        <div
            ref={sheetRef}
            onTouchStart={handleTouchStart}
            className="absolute bottom-16 left-0 right-0 z-20 bg-white rounded-t-2xl shadow-lg transition-all duration-200 flex flex-col"
            style={{ height: `${currentHeight}px` }}
        >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-2 cursor-pointer" />

            {!selectedItem && (
                <div className="flex justify-between items-center px-4 mt-5 mb-5">
                    <div className="flex gap-2 overflow-x-auto">
                        {categories.map((cat) => (
                            <button
                                key={categoriesMap[cat]}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-3 py-1 text-sm rounded-full border whitespace-nowrap ${
                                    activeCategory === cat
                                        ? 'bg-blue-500 text-white border-blue-500'
                                        : 'bg-white text-gray-600 border-gray-300'
                                }`}
                            >
                                {categoriesMap[cat]}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setIsFavoriteOnly(!isFavoriteOnly)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full border text-sm ${
                            isFavoriteOnly
                                ? 'bg-yellow-400 border-yellow-400 text-white'
                                : 'text-gray-500 border-gray-300 bg-white'
                        }`}
                        aria-label="즐겨찾기만 보기"
                    >
                        {isFavoriteOnly ? <Star size={16} fill="white" /> : <StarOff size={16} />}
                    </button>
                </div>
            )}

            <div className="overflow-y-auto px-4 flex-1 pb-20 mb-5">
                {!selectedItem ? (
                    filteredItems.length > 0 ? (
                        filteredItems.map((item) => {
                            const isFav = favoriteIds.includes(item.id)
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between bg-white rounded-xl shadow-md p-4 mb-4 cursor-pointer hover:shadow-lg transition-shadow"
                                >
                                    <div
                                        onClick={() => setSelectedItem(item)}
                                        className="flex items-center gap-3 flex-1"
                                    >
                                        <div className="w-16 h-16 min-w-16 min-h-16 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-500 overflow-hidden">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover rounded-md"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <span>이미지 없음</span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <h4 className="font-semibold text-base">{item.name}</h4>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        isFav ? handleRemoveFavorite(item.id) : handleAddFavorite(item.id)
                                                    }}
                                                    className="p-1"
                                                    aria-label={
                                                        isFav
                                                            ? `${item.name} 즐겨찾기 해제`
                                                            : `${item.name} 즐겨찾기 추가`
                                                    }
                                                >
                                                    {isFav ? (
                                                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                                    ) : (
                                                        <StarOff size={16} className="text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-500">{item.address}</p>
                                            <p className="text-xs text-blue-400 mt-0.5"># {categoriesMap[item.type]}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (!routeItems.find((i) => i.id === item.id)) {
                                                if (window.confirm('이 항목을 추가하시겠습니까?')) {
                                                    setLocalStorage([...routeItems, item])
                                                    setRouteItems((prev) => [...prev, item])
                                                }
                                            } else {
                                                alert('이미 추가된 항목입니다.')
                                            }
                                        }}
                                        className="ml-4 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                    >
                                        추가
                                    </button>
                                </div>
                            )
                        })
                    ) : (
                        <p className="text-center text-gray-400 mt-4">검색 결과가 없습니다.</p>
                    )
                ) : (
                    <div className="flex flex-col h-full">
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="self-end p-2 pt-5 pb-5 rounded-full hover:bg-gray-100 transition"
                            aria-label="세부 정보 닫기"
                        >
                            <X size={24} />
                        </button>
                        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4 transition-all duration-300">
                            {selectedItem.image ? (
                                <img
                                src={selectedItem.image}
                                alt={selectedItem.name}
                                className="w-full h-56 object-cover rounded-xl shadow-md"
                                loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-56 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                                이미지 없음
                                </div>
                            )}

                            <div className="space-y-1">
                                <h3 className="text-2xl font-semibold text-gray-800">{selectedItem.name}</h3>
                                <p className="text-sm text-indigo-500 font-medium"># {categoriesMap[selectedItem.type]}</p>
                            </div>

                            <div className="text-sm space-y-1 text-gray-600">
                                <p><span className="font-medium text-gray-700">제작년도:</span> {selectedItem.year || "제작년도가 제공되지 않습니다"}</p>
                                <p><span className="font-medium text-gray-700">위치:</span> {selectedItem.address}</p>
                            </div>

                            <div className="pt-2 text-sm text-gray-700 leading-relaxed">
                                <p className="font-medium mb-1 text-gray-800">작품 설명</p>
                                <p>{selectedItem.description || "설명이 제공되지 않습니다"}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
