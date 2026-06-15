// src/api.js
export async function login(username, password) {
  const r = await fetch("/api/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!r.ok) throw new Error("Invalid credentials");
  return (await r.json()).token;
}
