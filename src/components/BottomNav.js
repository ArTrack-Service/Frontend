import { Home, MapPin, PlusCircle, User } from "lucide-react";
import Link from "next/link";

const BottomNav = ({ activeIndex }) => {
  const menu = [
    { icon: Home, label: "홈", href: "/" },
    { icon: MapPin, label: "추천 경로", href: "/recommend" },
    { icon: PlusCircle, label: "경로 추가", href: "/addpath" },
    { icon: User, label: "마이 경로", href: "/mypath" },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white z-50 flex justify-around py-3">
      {menu.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeIndex === index;

        return (
          <Link href={item.href} key={index} className="flex flex-col items-center">
            <Icon
              size={24}
              className={isActive ? "text-purple-700" : "text-gray-500"}
            />
            <span
              className={`text-xs mt-2 ${
                isActive ? "text-purple-700 font-semibold" : "text-gray-500"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  )
};

export default BottomNav;