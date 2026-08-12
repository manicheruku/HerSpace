/** Human-friendly percent label for progress values. */
export function formatPercent(value: number): string {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  return `${safe}%`;
}

/** Due-date copy for list/detail cards. */
export function formatDueDate(isoDate: string | null): string {
  if (!isoDate) return "No due date";
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "No due date";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffDays = Math.round((date.getTime() - today.getTime()) / 86_400_000);
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays === -1) return "Due yesterday";
  if (diffDays > 1 && diffDays <= 7) return `Due in ${diffDays} days`;
  if (diffDays < -1) return `Overdue by ${Math.abs(diffDays)} days`;

  return `Due ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}
