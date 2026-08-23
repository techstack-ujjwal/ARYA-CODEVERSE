import React from "react";
import { cn } from "@/lib/utils";

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "indigo" | "emerald" | "amber" | "danger";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  size = "md",
  variant = "default",
  leftIcon,
  rightIcon,
  disabled = false,
  className,
  id,
  ...props
}: ToggleProps) {
  const generatedId = React.useId();
  const toggleId = id || generatedId;

  const sizeClasses = {
    sm: {
      track: "w-8 h-4",
      knob: "w-3 h-3",
      translate: "translate-x-4",
      translateZero: "translate-x-0.5",
    },
    md: {
      track: "w-11 h-6",
      knob: "w-4 h-4",
      translate: "translate-x-5.5",
      translateZero: "translate-x-1",
    },
    lg: {
      track: "w-14 h-7.5",
      knob: "w-5.5 h-5.5",
      translate: "translate-x-7",
      translateZero: "translate-x-1",
    },
  };

  const activeColors = {
    default: "bg-white border-white text-black",
    indigo: "bg-white border-white text-black",
    emerald: "bg-emerald-600 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]",
    amber: "bg-white border-white text-black",
    danger: "bg-red-600 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]",
  };

  const currentSize = sizeClasses[size];

  return (
    <label
      htmlFor={toggleId}
      className={cn(
        "inline-flex items-center gap-3 cursor-pointer select-none group",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {leftIcon && <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">{leftIcon}</span>}

      <div className="relative inline-flex items-center">
        <input
          id={toggleId}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
          {...props}
        />

        {/* Track */}
        <div
          className={cn(
            "rounded-full transition-all duration-200 ease-in-out border flex items-center",
            currentSize.track,
            checked
              ? activeColors[variant] || activeColors.default
              : "bg-zinc-900 border-zinc-800 group-hover:border-zinc-700"
          )}
        >
          {/* Knob */}
          <div
            className={cn(
              "rounded-full transition-all duration-200 ease-in-out transform shadow-sm flex items-center justify-center pointer-events-none",
              currentSize.knob,
              checked ? currentSize.translate : currentSize.translateZero,
              checked ? (variant === "emerald" || variant === "danger" ? "bg-white" : "bg-black") : "bg-white"
            )}
          />
        </div>
      </div>

      {rightIcon && <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">{rightIcon}</span>}

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs font-medium text-zinc-200 group-hover:text-white transition-colors">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-zinc-500 leading-tight">{description}</span>
          )}
        </div>
      )}
    </label>
  );
}

export interface SegmentedToggleProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: Array<{
    value: T;
    label: React.ReactNode;
    icon?: React.ReactNode;
    badge?: React.ReactNode;
  }>;
  size?: "sm" | "md";
  className?: string;
}

export function SegmentedToggle<T extends string>({
  value,
  onChange,
  options,
  size = "md",
  className,
}: SegmentedToggleProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex items-center p-1 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-inner backdrop-blur-sm",
        className
      )}
      role="radiogroup"
    >
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-lg font-medium transition-all duration-150 cursor-pointer",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-xs",
              isActive
                ? "bg-zinc-800 text-white font-semibold shadow-sm border border-zinc-700"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
            )}
          >
            {opt.icon && <span className={cn(isActive ? "text-white" : "text-zinc-400")}>{opt.icon}</span>}
            <span>{opt.label}</span>
            {opt.badge && <span className="ml-1">{opt.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
