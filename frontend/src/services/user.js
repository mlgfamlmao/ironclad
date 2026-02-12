export async function fetchMe() {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:8000/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch user");

  return res.json();
}
