"use client";
export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch("/api/auth/sign-out", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/login";
  };

  return <button onClick={handleLogout}>로그아웃</button>;
}
