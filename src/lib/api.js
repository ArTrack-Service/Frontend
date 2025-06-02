export async function signUp({ email, username, password }) {
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const res = await fetch(`${BASE_URL}/auth/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
        credentials: "include",
    });
    return res.json();
}

export async function signIn({ email, password }) {
    const res = await fetch(`${BASE_URL}/auth/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
    });
    return res.json();
}
