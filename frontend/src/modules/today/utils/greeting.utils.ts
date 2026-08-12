export function getGreeting(date: Date = new Date()): string {
  const hours = date.getHours();
  if (hours >= 5 && hours <= 11) return "Good Morning";
  if (hours >= 12 && hours <= 16) return "Good Afternoon";
  if (hours >= 17 && hours <= 20) return "Good Evening";
  return "Good Night";
}

export function formatToday(date: Date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
