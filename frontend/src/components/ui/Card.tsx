import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "outline" | "elevated";
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
      "bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 shadow-sm",
    subtle: "bg-zinc-950/40 border border-zinc-800/40",
    outline: "bg-transparent border border-zinc-800",
    elevated:
      "bg-zinc-900/90 border border-zinc-700/60 shadow-xl shadow-black/40",
  };

  return (
    <div
      className={cn(
        "rounded-xl p-5 text-zinc-100",
        variants[variant],
        hoverable &&
          "transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/80 hover:translate-y-[-1px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 pb-4 border-b border-zinc-800/60 mb-4", className)}
      {...props}
    >
      {children}
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
      className={cn("text-base font-semibold tracking-tight text-zinc-100", className)}
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
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}
