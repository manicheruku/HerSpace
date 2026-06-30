import { Card } from "@/shared/components/Card";

interface PlaceholderPageProps {
  title: string;
  emoji: string;
  description: string;
}

/** Temporary page used by modules that are scaffolded but not yet built. */
export function PlaceholderPage({ title, emoji, description }: PlaceholderPageProps) {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-[var(--font-display)] text-2xl font-semibold">
          {title} <span aria-hidden>{emoji}</span>
        </h1>
      </header>
      <Card>
        <p className="text-ink-500">{description}</p>
        <p className="mt-3 text-xs text-ink-300">Coming soon in a future phase.</p>
      </Card>
    </div>
  );
}
