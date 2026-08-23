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
      "relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-400/50 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer active:scale-[0.98] overflow-hidden";

    const variants = {
      primary:
        "bg-white text-black hover:bg-zinc-200 active:bg-zinc-300 font-semibold border border-white/20 shadow-md",
      secondary:
        "bg-zinc-900 text-zinc-100 hover:bg-zinc-800 active:bg-zinc-900 border border-zinc-700/80 shadow-sm",
      outline:
        "bg-transparent text-zinc-200 hover:bg-zinc-900 hover:text-white border border-zinc-800 hover:border-zinc-700",
      ghost:
        "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent",
      danger:
        "bg-red-950/60 text-red-400 hover:bg-red-900/60 border border-red-800/80 active:bg-red-950",
      success:
        "bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-800/80 active:bg-emerald-950",
      glow:
        "bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-lg shadow-emerald-500/20 border border-emerald-400/50",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5 h-8",
      md: "text-xs px-4 py-2 gap-2 h-9",
      lg: "text-sm px-5 py-2.5 gap-2.5 h-10.5 font-semibold",
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
