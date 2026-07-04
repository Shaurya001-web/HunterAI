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

  getMatches: async (
    email?: string, 
    keyword?: string, 
    location?: string, 
    remoteOnly?: boolean, 
    stipendMin?: number, 
    durationMax?: number
  ) => {
    let url = `${BASE_URL}/matches`;
    const params = new URLSearchParams();
    if (email) params.append("email", email);
    if (keyword) params.append("keyword", keyword);
    if (location) params.append("location", location);
    if (remoteOnly) params.append("remote_only", "true");
    if (stipendMin) params.append("stipend_min", stipendMin.toString());
    if (durationMax) params.append("duration_max", durationMax.toString());
    
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

  saveProfile: async (payload: unknown) => {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: "POST",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to save profile");
    return res.json();
  },

  migrateProfile: async (guestUserId: string) => {
    const res = await fetch(`${BASE_URL}/profile/migrate`, {
      method: "POST",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ guest_user_id: guestUserId }),
    });
    if (!res.ok) throw new Error("Failed to migrate profile");
    return res.json();
  },

  getSavedInternships: async () => {
    const res = await fetch(`${BASE_URL}/profile/saved`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load saved internships");
    return res.json();
  },

  saveInternship: async (jobId: number) => {
    const res = await fetch(`${BASE_URL}/profile/saved`, {
      method: "POST",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ job_id: jobId }),
    });
    if (!res.ok) throw new Error("Failed to save internship");
    return res.json();
  },

  unsaveInternship: async (jobId: number) => {
    const res = await fetch(`${BASE_URL}/profile/saved/${jobId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to unsave internship");
    return res.json();
  },

  getJob: async (jobId: number) => {
    const res = await fetch(`${BASE_URL}/jobs/${jobId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load job details");
    return res.json();
  },

  generateTailorPlan: async (jobId: number, feedback?: string) => {
    const res = await fetch(`${BASE_URL}/api/tailor-resume/plan`, {
      method: "POST",
      headers: { ...getHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: jobId, feedback })
    });
    if (!res.ok) {
      let errDetail = "Failed to generate tailor plan";
      try {
        const errJson = await res.json();
        errDetail = errJson.detail || errDetail;
      } catch (e) {}
      throw new Error(errDetail);
    }
    return res.json();
  },

  tailorResume: async (jobId: number, approvedPlan?: string) => {
    const res = await fetch(`${BASE_URL}/api/tailor-resume`, {
      method: "POST",
      headers: { ...getHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: jobId, approved_plan: approvedPlan })
    });
    if (!res.ok) {
      let errDetail = "Failed to tailor resume";
      try {
        const errJson = await res.json();
        errDetail = errJson.detail || errDetail;
      } catch (e) {}
      throw new Error(errDetail);
    }
    return res.json();
  },

  chat: async (message: string) => {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error("Failed to chat");
    return res.json();
  },
};
export default api;
