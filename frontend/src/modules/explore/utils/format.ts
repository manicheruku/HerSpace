/** Format an ISO timestamp as a short, human relative label (e.g. "3h ago"). */
export function formatRelativeTime(iso: string | null): string {
  if (!iso) return "Not used yet";

  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Not used yet";

  const diffMs = Date.now() - then;
  const minutes = Math.round(diffMs / 60_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w ago`;

  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
