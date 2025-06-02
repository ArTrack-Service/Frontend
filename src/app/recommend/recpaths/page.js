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
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const time = searchParams.get('time')
    const items = searchParams.get('itmes')

    const fetchData = async () => {
      try {
        const res = await fetch(`${BASE_URL}/course?lat=${lat}?lon=${lon}?time=${time}?items=${items}`)
        if (!res.ok) throw new Error('API 요청 실패')
        const result = await res.json()
        setPaths(result)
      } catch (error) {
        console.error(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>로딩 중...</div>
  if (!paths) return <div>데이터 없음</div>

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col px-4 py-5">
      <div className="relative p-4 pb-2 rounded-md shadow-md">
        {/* 뒤로가기 아이콘 */}
        <button
          onClick={() => router.push("/recommend")}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* 제목 영역 (중앙 정렬 X, 왼쪽 정렬 유지) */}
        <div className="pl-10">
          <h1 className="text-lg font-bold text-gray-800">산책 추천</h1>
          <p className="text-sm text-gray-500">조건에 만족하는 산책 코스를 찾았어요</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 space-y-4">
        {paths.map((path, idx) => (
          <div key={path.id}
            className="flex gap-3 items-center bg-white rounded-xl shadow-md p-4 mb-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/recommend/recpaths/path?path=${encodeURIComponent(JSON.stringify(path))}`)}>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <h4 className="font-semibold text-base">{path.name}</h4>
              </div>
              <p className="text-sm text-gray-500">{path.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}