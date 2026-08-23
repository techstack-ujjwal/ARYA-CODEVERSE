import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "outline"
    | "white"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "purple"
    | "amber"
    | "emerald"
    | "cyan";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-zinc-900 text-zinc-200 border-zinc-800 shadow-sm",
    outline: "bg-transparent text-zinc-400 border-zinc-800",
    white: "bg-white text-black border-white font-semibold",
    success: "bg-emerald-950/60 text-emerald-400 border-emerald-800/80 shadow-[0_0_8px_rgba(16,185,129,0.15)]",
    emerald: "bg-emerald-950/60 text-emerald-400 border-emerald-800/80 shadow-[0_0_8px_rgba(16,185,129,0.15)]",
    warning: "bg-red-950/50 text-red-300 border-red-800/60",
    amber: "bg-zinc-900 text-zinc-300 border-zinc-700",
    danger: "bg-red-950/60 text-red-400 border-red-800/80 shadow-[0_0_8px_rgba(239,68,68,0.15)]",
    info: "bg-zinc-900 text-zinc-200 border-zinc-700",
    cyan: "bg-zinc-900 text-zinc-200 border-zinc-700",
    purple: "bg-zinc-900 text-zinc-200 border-zinc-700",
  };

  const dotColors = {
    default: "bg-zinc-400",
    outline: "bg-zinc-500",
    white: "bg-black",
    success: "bg-emerald-400",
    emerald: "bg-emerald-400",
    warning: "bg-red-400",
    amber: "bg-zinc-400",
    danger: "bg-red-400",
    info: "bg-zinc-300",
    cyan: "bg-zinc-300",
    purple: "bg-zinc-300",
  };

  const sizes = {
    sm: "text-[10px] px-2 py-0.5 font-mono tracking-wide",
    md: "text-xs px-2.5 py-0.5 font-medium tracking-normal",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-colors select-none backdrop-blur-sm",
        variants[variant] || variants.default,
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", dotColors[variant] || "bg-zinc-400")} />
      )}
      {children}
    </span>
  );
}
