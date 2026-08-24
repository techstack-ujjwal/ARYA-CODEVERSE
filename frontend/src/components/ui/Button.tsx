"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export { cn };

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "glow";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#18181B]/20 dark:focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[#FAF8F5] dark:focus:ring-offset-[#09090b] disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer active:scale-[0.98] overflow-hidden";

    const variants = {
      primary:
        "bg-[#18181B] text-white hover:bg-[#27272A] active:bg-black font-bold shadow-xs border border-[#18181B] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:border-zinc-200",
      secondary:
        "bg-white text-[#18181B] hover:bg-[#FAF8F5] active:bg-[#F4EFE6] border border-[#E8E3D8] hover:border-[#D6CFBE] shadow-2xs dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800",
      outline:
        "bg-transparent text-[#18181B] hover:bg-[#FAF8F5] border border-[#E8E3D8] hover:border-[#D6CFBE] dark:text-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800/60",
      ghost:
        "bg-transparent text-[#52525B] hover:text-[#18181B] hover:bg-[#F4EFE6] border border-transparent dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60",
      danger:
        "bg-[#F5DCD7] text-[#7A3A30] hover:bg-[#ECC8C2] border border-[#E8B8B0] font-bold dark:bg-red-950/60 dark:text-red-300 dark:border-red-900/50 dark:hover:bg-red-950",
      success:
        "bg-[#D8EAD9] text-[#2D5A36] hover:bg-[#C8E0CA] border border-[#B5D7B7] font-bold dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/50 dark:hover:bg-emerald-950",
      glow:
        "bg-[#18181B] hover:bg-[#27272A] text-white font-bold shadow-sm border border-[#18181B] dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:border-indigo-500 dark:text-white dark:shadow-indigo-500/20",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5 h-8",
      md: "text-xs px-4 py-2 gap-2 h-9",
      lg: "text-sm px-5 py-2.5 gap-2.5 h-10.5 font-bold",
      icon: "p-2 w-9 h-9",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
