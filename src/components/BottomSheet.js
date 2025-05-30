"use client";

import { useEffect, useRef, useState } from "react";

export default function BottomSheet({ searchQuery }) {
    const sheetRef = useRef(null);
    const [startY, setStartY] = useState(0);
    const [currentHeight, setCurrentHeight] = useState(150);
    const [maxHeight, setMaxHeight] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [activeCategory, setActiveCategory] = useState("전체");

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

    const items = [...Array(10)].map((_, idx) => ({
        id: idx,
        name: `작품명 ${idx + 1}`,
        location: `서울특별시 어디구 어딘가`,
        category: ["회화", "조각", "사진", "설치"][idx % 4], // 카테고리 분류
    }));

    const filteredItems = items.filter((item) => {
        const matchesCategory = activeCategory === "전체" || item.category === activeCategory;
        const matchesSearch = item.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div
            ref={sheetRef}
            onTouchStart={handleTouchStart}
            className="absolute bottom-16 left-0 right-0 z-20 bg-white rounded-t-2xl shadow-lg transition-all duration-200"
            style={{ height: `${currentHeight}px` }}
        >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-2 cursor-pointer" />

        {/* 카테고리 버튼 영역 */}
        <div className="flex justify-center gap-2 px-4 mt-3 mb-2 overflow-x-auto">
            {categories.map((cat) => (
            <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 text-sm rounded-full border ${
                activeCategory === cat
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-300"
                }`}
            >
                {cat}
            </button>
            ))}
        </div>

        {/* 작품 목록 */}
        <div className="overflow-y-auto px-4 h-full pb-20">
            {filteredItems.map((item) => (
            <div key={item.id} className="flex border-b pb-2 mb-2">
                <div className="w-16 h-16 bg-gray-200 mr-3 flex items-center justify-center text-sm text-gray-600">
                사진
                </div>
                <div>
                <h4 className="font-bold">{item.name}</h4>
                <p className="text-sm text-gray-500">{item.location}</p>
                <p className="text-xs text-blue-400 mt-0.5">#{item.category}</p>
                </div>
            </div>
            ))}
            {filteredItems.length === 0 && (
            <p className="text-center text-gray-400 mt-4">
                검색 결과가 없습니다.
            </p>
            )}
        </div>
        </div>
    );
}
