"use client";

import { useEffect, useRef, useState } from "react";
import { Star, StarOff, X } from "lucide-react";

export default function BottomSheet({ searchQuery, items }) {
    const sheetRef = useRef(null);
    const [startY, setStartY] = useState(0);
    const [currentHeight, setCurrentHeight] = useState(250);
    const [maxHeight, setMaxHeight] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [activeCategory, setActiveCategory] = useState("전체");
    const [isFavoriteOnly, setIsFavoriteOnly] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null); 

    const MIN_HEIGHT = 150;
    const categories = ["전체", "회화", "조각", "사진", "설치"];

    useEffect(() => {
        setMaxHeight(window.innerHeight * 0.6);
    }, []);

    const handleTouchStart = (e) => {
        setStartY(e.touches[0].clientY);
        setDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!dragging) return;
        const deltaY = e.touches[0].clientY - startY;
        const newHeight = currentHeight - deltaY;
        const clampedHeight = Math.max(MIN_HEIGHT, Math.min(maxHeight, newHeight));
        setCurrentHeight(clampedHeight);
    };

    const handleTouchEnd = () => {
        setDragging(false);
    };

    useEffect(() => {
        const sheet = sheetRef.current;
        if (sheet) {
            sheet.addEventListener("touchmove", handleTouchMove);
            sheet.addEventListener("touchend", handleTouchEnd);
        }
        return () => {
            if (sheet) {
                sheet.removeEventListener("touchmove", handleTouchMove);
                sheet.removeEventListener("touchend", handleTouchEnd);
            }
        };
    }, [dragging, startY, currentHeight, maxHeight]);

    const filteredItems = items.filter((item) => {
        const matchesCategory = activeCategory === "전체" || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFavorite = !isFavoriteOnly || item.isFavorite;
        return matchesCategory && matchesSearch && matchesFavorite;
    });

    return (
        <div
            ref={sheetRef}
            onTouchStart={handleTouchStart}
            className="absolute bottom-16 left-0 right-0 z-20 bg-white rounded-t-2xl shadow-lg transition-all duration-200 flex flex-col"
            style={{ height: `${currentHeight}px` }}
        >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-2 cursor-pointer" />

        {/* 필터 영역: 카테고리 + 즐겨찾기 */}
        {!selectedItem && (
            <div className="flex justify-between items-center px-4 mt-5 mb-5">
            <div className="flex gap-2 overflow-x-auto">
                {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 text-sm rounded-full border whitespace-nowrap ${
                    activeCategory === cat
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-600 border-gray-300"
                    }`}
                >
                    {cat}
                </button>
                ))}
            </div>
            <button
                onClick={() => setIsFavoriteOnly(!isFavoriteOnly)}
                className={`w-8 h-8 flex items-center justify-center rounded-full border text-sm ${
                isFavoriteOnly
                    ? "bg-yellow-400 border-yellow-400 text-white"
                    : "text-gray-500 border-gray-300 bg-white"
                }`}
                aria-label="즐겨찾기만 보기"
            >
                {isFavoriteOnly ? <Star size={16} fill="white" /> : <StarOff size={16} />}
            </button>
            </div>
        )}

        {/* 작품 목록 또는 세부 정보 */}
        <div className="overflow-y-auto px-4 flex-1 pb-20">
            {!selectedItem ? (
            filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="flex gap-3 items-center bg-white rounded-xl shadow-md p-4 mb-4 cursor-pointer hover:shadow-lg transition-shadow"
                >
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-500 overflow-hidden">
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                        loading="lazy"
                    />
                    </div>
                    <div className="flex-1">
                    <div className="flex items-center gap-1">
                        <h4 className="font-semibold text-base">{item.name}</h4>
                        {item.isFavorite && (
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        )}
                    </div>
                    <p className="text-sm text-gray-500">{item.location}</p>
                    <p className="text-xs text-blue-400 mt-0.5">#{item.category}</p>
                    </div>
                </div>
                ))
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
                <div className="flex flex-col gap-4">
                <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                    loading="lazy"
                />
                <div className="flex flex-row justify-between items-center">
                    <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
                    <div className="flex items-center gap-1">
                        <span className="font-semibold">평점:</span>
                        <Star size={20} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-yellow-600 font-semibold">{selectedItem.rating}</span>
                    </div>
                </div>
                <p className="text-sm text-gray-500">장소: {selectedItem.location}</p>
                <p className="text-gray-700">{selectedItem.description}</p>
                </div>
            </div>
            )}
        </div>
        </div>
    );
}
