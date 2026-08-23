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
      "bg-zinc-950 border border-zinc-800 shadow-md shadow-black/40",
    subtle:
      "bg-zinc-950/50 border border-zinc-800/60 shadow-sm",
    outline:
      "bg-transparent border border-zinc-800 shadow-none",
    elevated:
      "bg-zinc-950 border border-zinc-800 shadow-xl shadow-black/60",
    glass:
      "bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 shadow-lg shadow-black/50",
    interactive:
      "bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 cursor-pointer shadow-md",
    gradient:
      "bg-zinc-950 border border-zinc-800 shadow-lg",
    glow:
      "bg-zinc-950 border border-emerald-800/80 shadow-[0_0_20px_rgba(16,185,129,0.12)]",
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl p-5 text-white overflow-hidden transition-all duration-200",
        // Top highlight specular line for modern UI depth
        "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:pointer-events-none",
        variants[variant],
        hoverable &&
          "hover:border-zinc-700 hover:bg-zinc-900 hover:translate-y-[-1.5px] hover:shadow-lg hover:shadow-black/60",
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
      className={cn("flex items-start justify-between gap-4 pb-4 border-b border-zinc-800 mb-4", className)}
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
      className={cn("text-base font-semibold tracking-tight text-white flex items-center gap-2", className)}
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
        "mt-5 pt-3.5 border-t border-zinc-800 flex items-center justify-between gap-3 text-xs text-zinc-400",
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
    default: "bg-zinc-900 border-zinc-800 text-zinc-200",
    muted: "bg-zinc-900 border-zinc-800 text-zinc-400",
    highlight: "bg-zinc-800 border-zinc-700 text-white",
    danger: "bg-red-950/60 border-red-800/80 text-red-200",
    success: "bg-emerald-950/60 border-emerald-800/80 text-emerald-200",
    warning: "bg-zinc-900 border-zinc-700 text-white",
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
