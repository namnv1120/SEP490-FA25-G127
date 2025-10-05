const API_BASE = "http://localhost:8080/api/auth"; // đổi URL theo backend

export async function loginUser(credentials) {
  // gọi backend login
  return fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  }).then((res) => res.json());
}

export async function registerUser(data) {
  return fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => res.json());
}

export async function forgotPassword(email) {
  return fetch(`${API_BASE}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  }).then((res) => res.json());
}