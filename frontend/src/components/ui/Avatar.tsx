import type { JSX } from "react";
import { useState } from "react";

export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
}

const SIZE: Record<AvatarSize, string> = {
  sm: "size-8 text-xs",
  md: "size-11 text-sm",
  lg: "size-16 text-xl",
};

/** Derive up to two initials from a display name. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

/** Circular avatar showing an image when available, otherwise brand initials. */
export function Avatar({ name, src, size = "md", className = "" }: AvatarProps): JSX.Element {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(src) && !broken;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-display font-semibold text-white ${
        SIZE[size]
      } ${showImage ? "" : "bg-[image:var(--gradient-brand)]"} ${className}`}
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt={name}
          className="size-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <span aria-hidden="true">{initialsOf(name)}</span>
      )}
    </span>
  );
}
