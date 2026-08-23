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
      "relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#18181B]/20 focus:ring-offset-2 focus:ring-offset-[#FAF8F5] disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer active:scale-[0.98] overflow-hidden";

    const variants = {
      primary:
        "bg-[#18181B] text-white hover:bg-[#27272A] active:bg-black font-bold shadow-xs border border-[#18181B]",
      secondary:
        "bg-white text-[#18181B] hover:bg-[#FAF8F5] active:bg-[#F4EFE6] border border-[#E8E3D8] hover:border-[#D6CFBE] shadow-2xs",
      outline:
        "bg-transparent text-[#18181B] hover:bg-[#FAF8F5] border border-[#E8E3D8] hover:border-[#D6CFBE]",
      ghost:
        "bg-transparent text-[#52525B] hover:text-[#18181B] hover:bg-[#F4EFE6] border border-transparent",
      danger:
        "bg-[#F5DCD7] text-[#7A3A30] hover:bg-[#ECC8C2] border border-[#E8B8B0] font-bold",
      success:
        "bg-[#D8EAD9] text-[#2D5A36] hover:bg-[#C8E0CA] border border-[#B5D7B7] font-bold",
      glow:
        "bg-[#18181B] hover:bg-[#27272A] text-white font-bold shadow-sm border border-[#18181B]",
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
