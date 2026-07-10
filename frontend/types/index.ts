export interface Profile {
  user_id: string;
  username: string;
  email: string;
  urls: Record<string, string>; // e.g. {"linkedin": "", "github": "", "portfolio": ""}
  created_at: string; // ISO join date
}
