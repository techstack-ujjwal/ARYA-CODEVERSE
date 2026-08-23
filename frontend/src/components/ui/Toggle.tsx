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
    default: "bg-[#18181B] border-[#18181B]",
    indigo: "bg-[#3A4B86] border-[#3A4B86]",
    emerald: "bg-[#2D5A36] border-[#2D5A36]",
    amber: "bg-[#6E5416] border-[#6E5416]",
    danger: "bg-[#7A3A30] border-[#7A3A30]",
  };

  const currentSize = sizeClasses[size];

  return (
    <label
      htmlFor={toggleId}
      className={cn(
        "inline-flex items-center gap-2.5 cursor-pointer select-none group",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {leftIcon && <span className="text-[#71717A] group-hover:text-[#18181B] transition-colors">{leftIcon}</span>}

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
              : "bg-[#E8E3D8] border-[#D6CFBE] group-hover:border-[#B5AC9D]"
          )}
        >
          {/* Knob */}
          <div
            className={cn(
              "rounded-full transition-all duration-200 ease-in-out transform shadow-xs flex items-center justify-center pointer-events-none bg-white",
              currentSize.knob,
              checked ? currentSize.translate : currentSize.translateZero
            )}
          />
        </div>
      </div>

      {rightIcon && <span className="text-[#71717A] group-hover:text-[#18181B] transition-colors">{rightIcon}</span>}

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs font-semibold text-[#18181B] transition-colors">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-[#71717A] leading-tight">{description}</span>
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
        "inline-flex items-center p-1 rounded-xl bg-white border border-[#E8E3D8] shadow-xs",
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
              "relative flex items-center gap-1.5 rounded-lg font-semibold transition-all duration-150 cursor-pointer",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-xs",
              isActive
                ? "bg-[#18181B] text-white shadow-xs"
                : "text-[#52525B] hover:text-[#18181B] hover:bg-[#FAF8F5]"
            )}
          >
            {opt.icon && <span className={cn(isActive ? "text-white" : "text-[#71717A]")}>{opt.icon}</span>}
            <span>{opt.label}</span>
            {opt.badge && <span className="ml-1">{opt.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
