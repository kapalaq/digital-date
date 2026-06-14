import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// Hardcoded users. credential -> identity letter.
const USERS = {
  user_a: { pass: "pass_a", id: "A", name: "User A" },
  user_b: { pass: "pass_b", id: "B", name: "User B" },
};

export function login(username, password) {
  const u = USERS[username];
  if (!u || u.pass !== password) return null;
  return jwt.sign({ id: u.id, name: u.name }, SECRET, { expiresIn: "12h" });
}

export function verify(token) {
  try { return jwt.verify(token, SECRET); } catch { return null; }
}
