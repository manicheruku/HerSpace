import { useAuth } from "@/shared/auth/AuthContext";
import { Card } from "@/shared/components/Card";

/**
 * Today / Home — the daily hub. Placeholder until the Today module (greeting,
 * weather, tasks, water, mood, daily message) is built.
 */
export function TodayPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm text-ink-500">{formatToday()}</p>
        <h1 className="font-display text-2xl font-semibold">
          Good morning, {firstName} <span aria-hidden>🌸</span>
        </h1>
      </header>

      <Card className="bg-gradient-to-br from-blossom-100 to-lilac-100">
        <p className="text-ink-700">
          This is your space. Modules for tasks, habits, mood, journal and more are on the way.
        </p>
      </Card>
    </div>
  );
}

function formatToday(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
