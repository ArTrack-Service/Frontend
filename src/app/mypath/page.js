'use client'
import { useRouter } from 'next/navigation'
import BottomNav from '../../components/BottomNav'

export default function Home() {
  const router = useRouter()

  const mockCourse = [
    {courseID: 'dummy-001'},
    {courseID: 'dummy-002'},
    {courseID: 'dummy-003'},
    {courseID: 'dummy-004'},
    {courseID: 'dummy-005'},
    {courseID: 'dummy-006'},
    {courseID: 'dummy-007'},
   ]
  
  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col">
      <div className="flex items-center gap-3 mb-6 p-4">
        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center overflow-hidden rounded-md">
          <img src="/default-profile.png" alt="profile" className="object-cover w-full h-full" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">사용자</h4>
          <p className="text-sm text-gray-500">안녕하세요</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 space-y-4">
        {mockCourse.map((course, idx) => (
          <div key={course.courseID} className="p-4 rounded-md bg-gray-50" onClick={()=>router.push("/course")}>
            <h4 className="font-semibold text-gray-800">산책 코스 {idx + 1}</h4>
            <p className="text-sm text-gray-500">{course.courseID}</p>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}