import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "outline"
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
    default: "bg-zinc-900/80 text-zinc-300 border-zinc-700/60 shadow-sm",
    outline: "bg-transparent text-zinc-400 border-zinc-800",
    success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)]",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)]",
    warning: "bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.1)]",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.1)]",
    danger: "bg-rose-500/10 text-rose-300 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.1)]",
    info: "bg-sky-500/10 text-sky-300 border-sky-500/30 shadow-[0_0_8px_rgba(14,165,233,0.1)]",
    cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.1)]",
    purple: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30 shadow-[0_0_8px_rgba(99,102,241,0.1)]",
  };

  const dotColors = {
    default: "bg-zinc-400",
    outline: "bg-zinc-500",
    success: "bg-emerald-400",
    emerald: "bg-emerald-400",
    warning: "bg-amber-400",
    amber: "bg-amber-400",
    danger: "bg-rose-400",
    info: "bg-sky-400",
    cyan: "bg-cyan-400",
    purple: "bg-indigo-400",
  };

  const sizes = {
    sm: "text-[10px] px-2 py-0.5 font-mono tracking-wide",
    md: "text-xs px-2.5 py-0.5 font-medium tracking-normal",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-colors select-none backdrop-blur-sm",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", dotColors[variant])} />
      )}
      {children}
    </span>
  );
}
