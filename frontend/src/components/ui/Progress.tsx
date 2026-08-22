import React from "react";
import { cn } from "./Button";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "danger" | "purple";
  size?: "xs" | "sm" | "md";
  showLabel?: boolean;
}

export function Progress({
  value,
  max = 100,
  variant = "default",
  size = "sm",
  showLabel = false,
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variants = {
    default: "bg-zinc-100",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    purple: "bg-indigo-500",
  };

  const sizes = {
    xs: "h-1",
    sm: "h-1.5",
    md: "h-2.5",
  };

  return (
    <div className={cn("w-full space-y-1.5", className)} {...props}>
      {showLabel && (
        <div className="flex justify-between text-xs font-mono text-zinc-400">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn("w-full bg-zinc-800/80 rounded-full overflow-hidden", sizes[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", variants[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
