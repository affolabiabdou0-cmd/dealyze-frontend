export type ActivityType = "deal_draft" | "smart_chase" | "pitch_radar" | "deep_due";

export interface ActivityDetail { label: string; value: string; }

export interface ActivityItem {
  id:        string;
  type:      ActivityType;
  title:     string;
  subtitle:  string;
  timestamp: string; // ISO
  href:      string;
  details:   ActivityDetail[];
}

const STORAGE_KEY       = "dealyze_activity";
const NOTIF_SEEN_KEY    = "dealyze_notif_seen";
const MAX_ITEMS         = 50;

export function getActivity(): ActivityItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ActivityItem[]) : [];
  } catch { return []; }
}

export function addActivity(item: Omit<ActivityItem, "id">): ActivityItem {
  const newItem: ActivityItem = { ...item, id: `act_${Date.now()}` };
  try {
    const items = getActivity();
    items.unshift(newItem);
    if (items.length > MAX_ITEMS) items.splice(MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
  return newItem;
}

export function getNotifSeenAt(): number {
  if (typeof window === "undefined") return Date.now();
  try { return parseInt(localStorage.getItem(NOTIF_SEEN_KEY) ?? "0", 10) || 0; } catch { return 0; }
}

export function markNotifSeen(): void {
  try { localStorage.setItem(NOTIF_SEEN_KEY, Date.now().toString()); } catch {}
}

export function countUnread(): number {
  const seen = getNotifSeenAt();
  return getActivity().filter((a) => new Date(a.timestamp).getTime() > seen).length;
}

export function relativeTime(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return "À l'instant";
  if (mins < 60)  return `Il y a ${mins} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7)   return `Il y a ${days}j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export const ACTIVITY_META: Record<ActivityType, { color: string; bg: string; label: string }> = {
  deal_draft:  { color: "#7c3aed", bg: "#ede9fe", label: "Deal Draft"  },
  smart_chase: { color: "#f97316", bg: "#fff7ed", label: "Smart Chase" },
  pitch_radar: { color: "#06b6d4", bg: "#ecfeff", label: "Pitch Radar" },
  deep_due:    { color: "#10b981", bg: "#f0fdf4", label: "Deep Due"    },
};
