'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '../../components/BottomNav'
import { UserRound } from 'lucide-react'

export default function MyPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const router = useRouter()
  const [paths, setPaths] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUserAndPaths = async () => {
      try {
        const userRes = await fetch(`${BASE_URL}/auth`, {
          method: 'GET',
          credentials: 'include',
        })
        if (userRes.status === 401) {
          router.replace('/')
          return
        }
        if (!userRes.ok) throw new Error('사용자 정보 로딩 실패')
        const userJson = await userRes.json()
        const currentUser = userJson.user ?? userJson
        setUser(currentUser)

        const pathsRes = await fetch(`${BASE_URL}/course`, {
          method: 'GET',
          credentials: 'include',
        })
        if (pathsRes.status === 401) {
          router.replace('/')
          return
        }
        if (!pathsRes.ok) throw new Error('경로 목록 로딩 실패')
        const allPaths = await pathsRes.json()

        const myPaths = allPaths.filter((p) => p.userId === currentUser.id)
        setPaths(myPaths)
      } catch (error) {
        console.error(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndPaths()
  }, [BASE_URL, router])

  const logout = async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/sign-out`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`서버 오류: ${res.status}`)
      router.replace('/')
    } catch (error) {
      console.error('로그아웃 실패:', error)
      alert('로그아웃 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen flex flex-col bg-gray-50">
      <div className="flex items-center gap-4 p-4 bg-white shadow-md">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
          <UserRound className="w-8 h-8" />
        </div>
        <div className="flex-1">
          {user ? (
            <>
              <h4 className="font-semibold text-lg text-gray-800">{user.username}</h4>
              <p className="text-sm text-gray-500">✉️ {user.email}</p>
            </>
          ) : (
            <>
              <h4 className="font-semibold text-lg text-gray-800">사용자</h4>
              <p className="text-sm text-gray-500">✉️ 이메일</p>
            </>
          )}
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
        >
          로그아웃
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {paths.length > 0 ? (
          paths.map((path) => (
            <div
              key={path.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 cursor-pointer"
              onClick={() =>
                router.push(
                  `/mypath/path?path=${encodeURIComponent(JSON.stringify(path))}`
                )
              }
            >
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold text-gray-800 text-base">{path.name}</h4>
                <span className="text-xs text-gray-500">
                  {path.time ? `${Math.floor(path.time / 60)}시간 ${path.time % 60}분` : ''}
                </span>
              </div>
              <p className="text-sm text-gray-600">{path.description}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">등록된 경로가 없습니다.</p>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <BottomNav activeIndex={3} />
      </div>
    </div>
  )
}
