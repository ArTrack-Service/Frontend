"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await fetch(`${BASE_URL}/auth`, {
                  credentials: "include",
                });

                if (res.ok) {
                    const data = await res.json();
                    setIsAuthenticated(true);
                    router.push("/home"); 
                } else {
                    setIsAuthenticated(false);
                }
            } catch (err) {
                console.error("Auth check error:", err);
                setIsAuthenticated(false);
          }
      }

      checkAuth();
    }, []);

    if (isAuthenticated === null) {
      return <div className="text-center mt-20 text-xl">로딩 중...</div>;
    }


    

    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-6xl font-bold mb-20">ArTrack</h1>
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            로그인
          </button>
          <button
            onClick={() => router.push("/signup")}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg"
          >
            회원가입
          </button>
        </div>
      </main>
    );
}
