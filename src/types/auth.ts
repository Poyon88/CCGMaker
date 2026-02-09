export interface UserProfile {
  id: string;
  displayName: string | null;
  language: "en" | "fr";
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
