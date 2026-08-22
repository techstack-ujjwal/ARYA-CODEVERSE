"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export { cn };

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
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
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer";

    const variants = {
      primary:
        "bg-zinc-100 text-zinc-950 hover:bg-white active:bg-zinc-200 shadow-sm font-semibold border border-transparent",
      secondary:
        "bg-zinc-800 text-zinc-100 hover:bg-zinc-700/80 active:bg-zinc-800 border border-zinc-700/50",
      outline:
        "bg-transparent text-zinc-200 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700",
      ghost:
        "bg-transparent text-zinc-300 hover:bg-zinc-800/70 hover:text-zinc-100 border border-transparent",
      danger:
        "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 active:bg-rose-500/30",
    };

    const sizes = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5 h-8",
      md: "text-sm px-4 py-2 gap-2 h-9.5",
      lg: "text-base px-5 py-2.5 gap-2.5 h-11",
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
          <Loader2 className="w-4 h-4 animate-spin text-current" />
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
