const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

let authToken: string | null = null;

const getHeaders = (customHeaders: Record<string, string> = {}) => {
  const headers: Record<string, string> = { ...customHeaders };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  return headers;
};

export const api = {
  setToken: (token: string | null) => {
    authToken = token;
  },

  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/file/upload/resume`, {
      method: "POST",
      headers: getHeaders(),
      body: formData,
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  getProfiles: async () => {
    const res = await fetch(`${BASE_URL}/profiles`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load profiles");
    return res.json();
  },

  getMatches: async (email?: string, keyword?: string) => {
    let url = `${BASE_URL}/matches`;
    const params = new URLSearchParams();
    if (email) params.append("email", email);
    if (keyword) params.append("keyword", keyword);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    if (res.status === 400) return [];
    if (!res.ok) throw new Error("Failed to load matches");
    return res.json();
  },
};
export default api;
