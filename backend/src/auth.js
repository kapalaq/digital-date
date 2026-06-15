import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

const USERS = {
  [process.env.USER_A_USERNAME]: { pass: process.env.USER_A_PASSWORD, id: process.env.USER_A_ID, name: process.env.USER_A_NAME },
  [process.env.USER_B_USERNAME]: { pass: process.env.USER_B_PASSWORD, id: process.env.USER_B_ID, name: process.env.USER_B_NAME },
};

export function login(username, password) {
  const u = USERS[username];
  if (!u || u.pass !== password) return null;
  return jwt.sign({ id: u.id, name: u.name }, SECRET, { expiresIn: "12h" });
}

export function verify(token) {
  try { return jwt.verify(token, SECRET); } catch { return null; }
}
