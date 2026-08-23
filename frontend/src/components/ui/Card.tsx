import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "outline" | "elevated" | "glass" | "interactive" | "gradient" | "glow";
  hoverable?: boolean;
}

export function Card({
  className,
  variant = "default",
  hoverable = false,
  children,
  ...props
}: CardProps) {
  const variants = {
    default:
      "bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 shadow-md shadow-black/20",
    subtle:
      "bg-zinc-950/50 backdrop-blur-sm border border-zinc-800/50 shadow-sm",
    outline:
      "bg-transparent border border-zinc-800/80 shadow-none",
    elevated:
      "bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-zinc-700/60 shadow-xl shadow-black/40",
    glass:
      "bg-zinc-900/40 backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/30",
    interactive:
      "bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 hover:border-zinc-600/80 hover:bg-zinc-900/90 transition-all duration-200 cursor-pointer shadow-md",
    gradient:
      "bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-zinc-950/90 border border-zinc-800/80 shadow-lg",
    glow:
      "bg-zinc-900/80 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.12)]",
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl p-5 text-zinc-100 overflow-hidden transition-all duration-200",
        // Top highlight specular line for modern UI depth
        "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:pointer-events-none",
        variants[variant],
        hoverable &&
          "hover:border-zinc-700 hover:bg-zinc-900/90 hover:translate-y-[-1.5px] hover:shadow-lg hover:shadow-black/40",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: React.ReactNode;
}

export function CardHeader({
  className,
  children,
  action,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn("flex items-start justify-between gap-4 pb-4 border-b border-zinc-800/60 mb-4", className)}
      {...props}
    >
      <div className="flex flex-col space-y-1.5 flex-1 min-w-0">{children}</div>
      {action && <div className="shrink-0 flex items-center">{action}</div>}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold tracking-tight text-zinc-100 flex items-center gap-2", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-zinc-400 leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-5 pt-3.5 border-t border-zinc-800/60 flex items-center justify-between gap-3 text-xs text-zinc-400",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "muted" | "highlight" | "danger" | "success" | "warning";
}

export function CardSlot({
  className,
  variant = "default",
  children,
  ...props
}: CardSlotProps) {
  const slotVariants = {
    default: "bg-zinc-950/50 border-zinc-800/70 text-zinc-200",
    muted: "bg-zinc-900/40 border-zinc-800/40 text-zinc-400",
    highlight: "bg-indigo-950/20 border-indigo-500/25 text-indigo-200",
    danger: "bg-rose-950/20 border-rose-500/25 text-rose-200",
    success: "bg-emerald-950/20 border-emerald-500/25 text-emerald-200",
    warning: "bg-amber-950/20 border-amber-500/25 text-amber-200",
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-3.5 transition-all text-xs font-normal",
        slotVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBadge({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wide uppercase",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
