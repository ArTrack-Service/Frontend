'use client'
import { useRouter } from 'next/navigation'
import BottomNav from '../../components/BottomNav'

export default function My() {
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
      <div className="flex items-center gap-3 mb-6 p-4 rounded-md shadow-md">
        <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-500 overflow-hidden">
          <img src="https://picsum.photos/seed/usergit/200/150"
              alt="profile"
              className="w-full h-full object-cover rounded-md"
              loading="lazy" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-base">사용자</h4>
          <p className="text-sm text-gray-500">안녕하세요</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 space-y-4">
        {mockCourse.map((course, idx) => (
          <div key={course.courseID}
               className="flex gap-3 items-center bg-white rounded-xl shadow-md p-4 mb-4 cursor-pointer hover:shadow-lg transition-shadow" 
               onClick={()=>router.push("/mypath/path")}>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <h4 className="font-semibold text-base">산책 코스 {idx + 1}</h4>
              </div>
              <p className="text-sm text-gray-500">{course.courseID}</p>
            </div>
          </div>
        ))}
      </div>

      <BottomNav activeIndex={3} />
    </div>
  )
}