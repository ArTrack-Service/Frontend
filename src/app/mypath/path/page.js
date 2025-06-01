'use client'
import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ChevronLeft, X } from 'lucide-react';

const MapViewer = dynamic(() => import('@/components/MapViewer'), { ssr: false })

export default function MyPath() {
    const path = {
      courseId: 'dummy-001',
      memo:"안녕하세요",
      artworks: [
        {   
          name: '작품명 1',
          description: '어쩌구 저쩌구',
          image: 'https://picsum.photos/seed/art1/200/150',
          lat: 37.5665,
          lon: 126.9780
        },
        {
          name: '작품명 2',
          description: '어쩌구 저쩌구',
          image: 'https://picsum.photos/seed/art2/200/150',
          lat: 37.5670,
          lon: 126.9770
        },
        {
          name: '작품명 3',
          description: '어쩌구 저쩌구',
          image: 'https://picsum.photos/seed/art3/200/150',
          lat: 37.5665,
          lon: 126.9780
        },
        {
          name: '작품명 4',
          description: '어쩌구 저쩌구',
          image: 'https://picsum.photos/seed/art4/200/150',
          lat: 37.5665,
          lon: 126.9780
        },
        {
          name: '작품명 5',
          description: '어쩌구 저쩌구',
          image: 'https://picsum.photos/seed/art5/200/150',
          lat: 37.5665,
          lon: 126.9780
        },
        {
          name: '작품명 6',
          description: '어쩌구 저쩌구',
          image: 'https://picsum.photos/seed/art6/200/150',
          lat: 37.5665,
          lon: 126.9780
        }
      ]
    }
    const router = useRouter()
    const [isEdit, setIsEdit] = useState(false)
    const [memo, setMemo] = useState('')
    const [share, setShare] = useState(false)

    return (
        <div className="flex flex-col h-screen px-4 py-5 bg-white">
            <div className="relative p-4 pb-2 rounded-md">
                {/* 뒤로가기 아이콘 */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 text-gray-500 hover:text-gray-700"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="pl-10">
                    <h1 className="text-lg font-semibold text-gray-800">{path.courseId}</h1>
                </div>
            </div>

            <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">지도</p>
                <div className="w-full h-64 rounded-md overflow-hidden shadow-md">
                    <MapViewer items={[]} routeItems={[]}/>
                </div>
            </div>

            <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">예술작품</p>
                <div className="flex flex-col gap-4 max-h-64 overflow-y-auto">
                    {path.artworks.map((artwork, idx) => (
                        <div key={idx}
                            className="flex gap-3 items-center bg-white rounded-xl shadow-md p-4 mb-4 cursor-pointer hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-500 overflow-hidden">
                                <img src={artwork.image}
                                    alt={artwork.name}
                                    className="w-full h-full object-cover rounded-md"
                                    loading="lazy" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-800">{artwork.name}</h4>
                                <p className="text-sm text-gray-500">{artwork.description}</p>
                            </div>
                            {isEdit && (
                                <button
                                    onClick={() => {
                                    // 제거 로직 추가 필요시 여기에 작성
                                    }}
                                    className="text-red-600 text-sm font-medium hover:text-red-800 transition"
                                >
                                    제거
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            

            {/* 수정하기, 저장하기 버튼 */}
            {isEdit ? (
                <div>
                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">메모</p>
                    <textarea
                        className='w-full h-40 overflow-y-auto border rounded p-2 text-sm'
                        value={path.memo}
                    />
                </div>
                <div className="pt-4">
                    <button
                    onClick={() => setIsEdit(false)} // 수정 모드 종료 → 저장
                    className="w-full bg-blue-600 text-white py-2 rounded shadow hover:bg-blue-700 transition"
                    >
                    저장하기
                    </button>
                </div>
                </div>
                ) : (
                <div>
                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">메모</p>
                    <p className='w-full h-40 overflow-y-auto border rounded p-2 text-sm'>
                        {path.memo}
                    </p>
                </div>
                <div className="pt-4">
                    <button
                    onClick={() => setIsEdit(true)} // 수정 모드 진입
                    className="w-full bg-blue-600 text-white py-2 rounded shadow hover:bg-blue-700 transition"
                    >
                    수정하기
                    </button>
                </div>
                </div>
                )
            }
            <div className="h-16" />
        </div>
    )
}
