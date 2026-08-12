import { Card, Skeleton } from "@/components/ui";
import { useDailyMessage } from "@/modules/today/hooks/useDailyMessage";

export function DailyMessageCard() {
  const { message, loading } = useDailyMessage();

  return (
    <Card
      variant="gradient"
      className="bg-[image:var(--gradient-brand)] px-8 py-9 text-white"
    >
      {loading || !message ? (
        <div className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-24" />
        </div>
      ) : (
        <figure>
          <span aria-hidden="true" className="font-display text-5xl leading-none text-white/40">
            “
          </span>
          <blockquote className="-mt-4 font-display text-xl font-medium leading-relaxed">
            {message.text}
          </blockquote>
          {message.author ? (
            <figcaption className="mt-4 text-sm font-medium tracking-wide text-white/80">
              — {message.author}
            </figcaption>
          ) : null}
        </figure>
      )}
    </Card>
  );
}
