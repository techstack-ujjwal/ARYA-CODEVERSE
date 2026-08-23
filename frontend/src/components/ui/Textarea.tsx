import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  maxWords?: number;
  wordCount?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      maxWords,
      wordCount,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const isOverLimit =
      maxWords !== undefined && wordCount !== undefined && wordCount > maxWords;

    return (
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={textareaId}
              className="block text-xs font-semibold text-zinc-300"
            >
              {label}
            </label>
          )}
          {maxWords !== undefined && wordCount !== undefined && (
            <span
              className={cn(
                "text-[11px] font-mono",
                isOverLimit
                  ? "text-rose-400 font-semibold"
                  : wordCount > maxWords * 0.9
                  ? "text-amber-400 font-medium"
                  : "text-zinc-500"
              )}
            >
              {wordCount} / {maxWords} words
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          className={cn(
            "w-full bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 shadow-inner transition-all duration-200 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed resize-y min-h-[100px] leading-relaxed",
            (error || isOverLimit) &&
              "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-[11px] text-rose-400 font-medium">{error}</p>
        ) : isOverLimit ? (
          <p className="text-[11px] text-rose-400 font-medium">
            Exceeds maximum limit of {maxWords} words.
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-zinc-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
