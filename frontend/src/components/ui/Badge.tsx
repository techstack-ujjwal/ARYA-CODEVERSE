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
    default: "bg-[#FAF8F5] text-[#18181B] border-[#E8E3D8]",
    outline: "bg-transparent text-[#52525B] border-[#E8E3D8]",
    white: "bg-white text-[#18181B] border-[#E8E3D8] font-semibold shadow-2xs",
    success: "bg-[#D8EAD9] text-[#2D5A36] border-[#B5D7B7]",
    emerald: "bg-[#D8EAD9] text-[#2D5A36] border-[#B5D7B7]",
    warning: "bg-[#FBF1D5] text-[#6E5416] border-[#E8DCB5]",
    amber: "bg-[#FBF1D5] text-[#6E5416] border-[#E8DCB5]",
    danger: "bg-[#F5DCD7] text-[#7A3A30] border-[#E8B8B0]",
    info: "bg-[#DDE4F8] text-[#3A4B86] border-[#BAC7E8]",
    cyan: "bg-[#DDE4F8] text-[#3A4B86] border-[#BAC7E8]",
    purple: "bg-[#EBE4F6] text-[#4F3B74] border-[#D3C7E6]",
  };

  const dotColors = {
    default: "bg-[#71717A]",
    outline: "bg-[#A1A1AA]",
    white: "bg-[#18181B]",
    success: "bg-[#2D5A36]",
    emerald: "bg-[#2D5A36]",
    warning: "bg-[#6E5416]",
    amber: "bg-[#6E5416]",
    danger: "bg-[#7A3A30]",
    info: "bg-[#3A4B86]",
    cyan: "bg-[#3A4B86]",
    purple: "bg-[#4F3B74]",
  };

  const sizes = {
    sm: "text-[10px] px-2 py-0.5 font-mono font-bold tracking-wide",
    md: "text-xs px-2.5 py-0.5 font-semibold tracking-normal",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-colors select-none font-mono",
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
