'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function PathList() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const router = useRouter()
  const searchParams = useSearchParams()

  const [paths, setPaths] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeMax = searchParams.get('timeMax')
    const timeMin = searchParams.get('timeMin')
    const items = searchParams.get('maxLocations') 

    const fetchData = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/course?max=${items}&timeMax=${timeMax * 60}&timeMin=${timeMin * 60}`
        )
        if (!res.ok) throw new Error('API 요청 실패')
        const results = await res.json()
        const publicPaths = results.filter(path => path.canShare === true)
        setPaths(publicPaths)
      } catch (error) {
        console.error(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [BASE_URL, searchParams])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }
  if (!paths || paths.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="relative p-4 rounded-md shadow-md bg-white">
          <button
            onClick={() => router.push('/recommend')}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="pl-10">
            <h1 className="text-lg font-bold text-gray-800">산책 추천</h1>
            <p className="text-sm text-gray-500">조건에 만족하는 산책 코스를 찾았어요</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen flex flex-col bg-gray-50">
      <div className="relative p-4 rounded-md shadow-md bg-white">
        <button
          onClick={() => router.push('/recommend')}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="pl-10">
          <h1 className="text-lg font-bold text-gray-800">산책 추천</h1>
          <p className="text-sm text-gray-500">조건에 만족하는 산책 코스를 찾았어요</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pt-4 pb-24 px-4">
        {paths.map((path) => (
          <div
            key={path.id}
            className="flex flex-col bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() =>
              router.push(
                `/recommend/recpaths/path?path=${encodeURIComponent(
                  JSON.stringify(path)
                )}`
              )
            }
          >
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-semibold text-gray-800 text-base">{path.name}</h4>
              <span className="text-xs text-gray-500">
                {path.time ? `${Math.floor(path.time / 60)}시간 ${path.time % 60}분` : ''}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{path.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
