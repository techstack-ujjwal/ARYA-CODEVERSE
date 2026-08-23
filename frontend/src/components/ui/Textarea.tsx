import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, id, disabled, rows = 4, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold text-[#18181B]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          className={cn(
            "w-full bg-[#FAF8F5] border border-[#E8E3D8] rounded-xl p-3 text-xs text-[#18181B] placeholder-[#A1A1AA] transition-all duration-200 focus:outline-none focus:border-[#18181B] focus:bg-white focus:ring-1 focus:ring-[#18181B] disabled:opacity-50 disabled:cursor-not-allowed resize-y",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-[11px] text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-[#71717A]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
