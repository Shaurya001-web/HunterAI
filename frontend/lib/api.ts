const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

let authToken: string | null = null;

const getHeaders = async (customHeaders: Record<string, string> = {}) => {
  const headers: Record<string, string> = { ...customHeaders };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  } else {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
    } catch {
      // Ignored if client is not configured
    }
  }
  return headers;
};

export const api = {
  setToken: (token: string | null) => {
    authToken = token;
  },

  getProfile: async () => {
    const res = await fetch(`${BASE_URL}/profile`, {
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load profile");
    return res.json();
  },

  getProfiles: async () => {
    const res = await fetch(`${BASE_URL}/profiles`, {
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load profiles");
    return res.json();
  },

  saveProfile: async (payload: { username?: string; urls?: Record<string, string> }) => {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: "POST",
      headers: await getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to save profile");
    return res.json();
  },
};

export default api;
