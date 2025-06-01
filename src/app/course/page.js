'use client'
import { useEffect, useState} from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const MapViewer = dynamic(() => import('../../components/MapViewer'), { ssr: false })

export default function CoursePage() {
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const searchParams = useSearchParams()

  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const time = searchParams.get('time')
  const items = searchParams.get('items')

  const router = useRouter()

  const mockCourse = {
    courseId: 'dummy-001',
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
      },
    ]
  }

  useEffect(() => {
    // 실제 fetch 대신 mock 데이터 삽입
    setCourse(mockCourse)
  }, [])

  if (!course) return <p className="p-4">코스를 불러오는 중...</p>

  /*useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(
          `/api/v1/course?lat=${lat}&lon=${lon}&time=${time}&items=${items}`
        )
        if (!res.ok) throw new Error('API 요청 실패')
        const data = await res.json()
        setCourse(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (lat && lon && time && items) {
      fetchCourse()
    }
  }, [lat, lon, time, items])

  if (loading) return <p>불러오는 중...</p>
  if (error) return <p>에러 발생: {error}</p>
  if (!course) return <p>경로가 없습니다.</p>*/

  return (
    <div className="flex flex-col h-screen px-4 py-5 bg-white">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-gray-800">산책 코스</h1>
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">지도</p>
        <div className="w-full h-64 rounded-md overflow-hidden shadow-md">
          <MapViewer items={course.artworks} setSelectedItem={() => {}} />
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">예술작품</p>
        <div className="flex flex-col gap-4 max-h-64 overflow-y-auto">
          {course.artworks.map((artwork, idx) => (
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
            </div>
          ))}
        </div>
      </div>

      <form method="post" className="mb-6">
        <input type="hidden" name="course" value={JSON.stringify(course)} />

        <label htmlFor="Review" className="block text-sm font-medium text-gray-700 mb-1">메모</label>
        <textarea
          id="Review"
          name="review"
          placeholder="산책은 어땠었나요?"
          className="w-full h-24 p-2 border border-gray-300 rounded-md text-sm"
        />
        <input
          type="submit"
          value="저장"
          className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-emerald-600 text-sm font-medium"
        />
      </form>

      <button
        onClick={() => router.back()}
        className="text-sm text-blue-600 underline self-start"
      >
        ←이전 화면으로 돌아가기
      </button>

      <div className="h-16" />
    </div>
  )
}
