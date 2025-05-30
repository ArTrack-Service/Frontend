export default function BottomNav() {
const navItems = ['추천', '경로추가', '홈', '즐겨찾기', '나']

return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex justify-around items-center z-30">
    {navItems.map((item, idx) => (
        <div key={idx} className="flex flex-col items-center text-sm text-gray-700">
        <div className="w-6 h-6 bg-gray-300 mb-1 rounded-full" />
        <span>{item}</span>
        </div>
    ))}
    </nav>
)
}
