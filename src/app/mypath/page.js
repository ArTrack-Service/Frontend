'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '../../components/BottomNav'
import { UserRound } from 'lucide-react'

export default function MyPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const router = useRouter()
  const [paths, setPaths] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let res = await fetch(`${BASE_URL}/auth`)
        if (!res.ok) throw new Error('API 요청 실패')
        let result = await res.json()
        setUser(result)
      } catch (error) {
        console.error(error.message)
      } finally {
        setLoading(false)
      }
    }

    const fetchData = async () => {
      try {
        let res = await fetch(`${BASE_URL}/course`)
        if (!res.ok) throw new Error('API 요청 실패')
        let result = await res.json()
        setPaths(result)
      } catch (error) {
        console.error(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
    fetchData()
  }, [])

  if (loading) return <div>로딩 중...</div>
  if (!paths) return <div>데이터 없음</div>

  const logout = async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/sign-out`, {
        method: 'POST',
        credentials: 'include'
      })

      if (!res.ok) {
        throw new Error(`서버 오류: ${res.status}`)
      }

      const result = await res.json()
      console.log('로그아웃 성공:', result)
    } catch (error) {
      console.error('로그 아웃 실패:', error)
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col p-4git p-4">
      <div className="flex items-center gap-3 mb-6 p-4 rounded-md shadow-md">
        <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-500 overflow-hidden">
          <UserRound className='w-full h-full' />
        </div>
        <div className="flex-1">
          {user ? (
            <>
              <h4 className="font-semibold text-base">{user.username}</h4>
              <p className="text-sm text-gray-500">✉️ {user.email}</p>
            </>

          ) : (
            <>
              <h4 className="font-semibold text-base">사용자</h4>
              <p className="text-sm text-gray-500">✉️ 이메일</p>
            </>
          )
          }
        </div>
        <button
          onClick={logout}
          className="ml-4 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          로그아웃
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 space-y-4">
        {paths.map((path, idx) => (
          <div key={path.id}
            className="flex gap-3 items-center bg-white rounded-xl shadow-md p-4 mb-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/mypath/path?path=${encodeURIComponent(JSON.stringify(path))}`)}>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <h4 className="font-semibold text-base">{path.name}</h4>
              </div>
              <p className="text-sm text-gray-500">{path.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className='fixed bottom-0 left-0 right-0 gb-white shadow-lg'>
        <BottomNav activeIndex={3} />
      </div>

    </div>
  )
}