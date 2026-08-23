"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export { cn };

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "glow";
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
      "relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-400/50 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer active:scale-[0.98] overflow-hidden";

    const variants = {
      primary:
        "bg-zinc-100 text-zinc-950 hover:bg-white hover:shadow-lg hover:shadow-white/10 active:bg-zinc-200 font-semibold border border-white/20",
      secondary:
        "bg-zinc-900/80 text-zinc-100 hover:bg-zinc-800/90 active:bg-zinc-900 border border-zinc-700/60 shadow-sm backdrop-blur-sm",
      outline:
        "bg-transparent text-zinc-200 hover:bg-zinc-900/80 hover:text-white border border-zinc-800 hover:border-zinc-700 backdrop-blur-sm",
      ghost:
        "bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60 border border-transparent",
      danger:
        "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 active:bg-rose-500/30",
      glow:
        "bg-gradient-to-r from-sky-500 to-emerald-600 text-zinc-950 font-bold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/35 hover:from-sky-400 hover:to-emerald-500 border border-sky-300/30",
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
