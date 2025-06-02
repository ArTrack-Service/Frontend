"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthForm({ type }) {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", username: "", password: "" });
    const [message, setMessage] = useState("");
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const isSignUp = type === "signup";

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const res = await fetch(`${BASE_URL}/auth/${isSignUp ? "sign-up" : "sign-in"}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            router.push("/home");
        } catch (err) {
            setMessage(err.message || "Something went wrong");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white shadow-lg rounded-2xl px-8 py-10 space-y-6"
            >
                <h1 className="text-3xl font-extrabold text-center text-gray-800">
                    {isSignUp ? "ArTrack 회원가입" : "ArTrack 로그인"}
                </h1>

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                {isSignUp && (
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                )}

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                {message && (
                    <div className="text-sm text-red-500 text-center">{message}</div>
                )}

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 transition duration-200"
                >
                    {isSignUp ? "Sign Up" : "Log In"}
                </button>
            </form>
        </div>
    );
}
