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
      "bg-white border border-[#E8E3D8] shadow-xs text-[#18181B]",
    subtle:
      "bg-[#FAF8F5] border border-[#E8E3D8] shadow-none text-[#18181B]",
    outline:
      "bg-transparent border border-[#E8E3D8] shadow-none text-[#18181B]",
    elevated:
      "bg-white border border-[#E8E3D8] shadow-sm text-[#18181B]",
    glass:
      "bg-white/85 backdrop-blur-md border border-[#E8E3D8] shadow-xs text-[#18181B]",
    interactive:
      "bg-white border border-[#E8E3D8] hover:border-[#D6CFBE] hover:bg-[#FAF8F5] transition-all duration-200 cursor-pointer shadow-xs text-[#18181B]",
    gradient:
      "bg-gradient-to-br from-white to-[#FAF8F5] border border-[#E8E3D8] shadow-xs text-[#18181B]",
    glow:
      "bg-white border border-[#D8EAD9] shadow-[0_4px_20px_rgba(45,90,54,0.06)] text-[#18181B]",
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl p-5 text-[#18181B] overflow-hidden transition-all duration-200",
        variants[variant],
        hoverable &&
          "hover:border-[#D6CFBE] hover:-translate-y-0.5 hover:shadow-md",
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
      className={cn("flex items-start justify-between gap-4 pb-4 border-b border-[#E8E3D8] mb-4", className)}
      {...props}
    >
      <div className="flex flex-col space-y-1 flex-1 min-w-0">{children}</div>
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
      className={cn("text-base font-bold tracking-tight text-[#18181B] flex items-center gap-2", className)}
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
    <p className={cn("text-xs text-[#52525B] leading-relaxed", className)} {...props}>
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
        "mt-5 pt-3.5 border-t border-[#E8E3D8] flex items-center justify-between gap-3 text-xs text-[#52525B]",
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
    default: "bg-[#FAF8F5] border-[#E8E3D8] text-[#18181B]",
    muted: "bg-[#F4EFE6] border-[#E2DDD0] text-[#52525B]",
    highlight: "bg-[#DDE4F8] border-[#BAC7E8] text-[#3A4B86]",
    danger: "bg-[#F5DCD7] border-[#E8B8B0] text-[#7A3A30]",
    success: "bg-[#D8EAD9] border-[#B5D7B7] text-[#2D5A36]",
    warning: "bg-[#FBF1D5] border-[#E8DCB5] text-[#6E5416]",
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
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide uppercase",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
