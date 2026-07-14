import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const tones = {
  default: "border bg-muted text-foreground",
  accent: "border-accent/30 bg-accent/15 text-foreground",
  positive: "border-positive/30 bg-positive/15 text-positive",
  warning: "border-warning/40 bg-warning/15 text-foreground",
  danger: "border-destructive/40 bg-destructive/15 text-destructive"
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: keyof typeof tones;
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
