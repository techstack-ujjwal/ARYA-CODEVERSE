"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/store/theme-context";
import { cn } from "@/lib/utils";

export interface ThemeToggleProps {
  variant?: "switch" | "button" | "full";
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({
  variant = "switch",
  className,
  showLabel = true,
}: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme, isDark } = useTheme();

  if (variant === "switch") {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
        onClick={toggleTheme}
        className={cn(
          "relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-[#E8E3D8] hover:border-[#D6CFBE] transition-all duration-200 cursor-pointer shadow-2xs select-none group",
          className
        )}
        title={`Current mode: ${isDark ? "Dark" : "Light"}. Click to switch to ${isDark ? "Light" : "Dark"} mode.`}
      >
        {/* Animated Icon Container */}
        <div className="relative w-4 h-4 flex items-center justify-center">
          <Sun
            className={cn(
              "w-3.5 h-3.5 text-amber-500 absolute transition-all duration-300 transform",
              isDark
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 -rotate-90 scale-0 pointer-events-none"
            )}
          />
          <Moon
            className={cn(
              "w-3.5 h-3.5 text-[#3A4B86] absolute transition-all duration-300 transform",
              !isDark
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 rotate-90 scale-0 pointer-events-none"
            )}
          />
        </div>

        {showLabel && (
          <span className="text-[11px] font-mono font-bold text-[#18181B] flex items-center gap-1">
            <span className="hidden xl:inline">{isDark ? "Dark Theme" : "Light Theme"}</span>
            <span className="xl:hidden">{isDark ? "Dark" : "Light"}</span>
          </span>
        )}
      </button>
    );
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
        onClick={toggleTheme}
        className={cn(
          "p-2 rounded-xl bg-white border border-[#E8E3D8] hover:border-[#D6CFBE] hover:bg-[#FAF8F5] transition-all cursor-pointer shadow-2xs group flex items-center justify-center",
          className
        )}
        title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-200" />
        ) : (
          <Moon className="w-4 h-4 text-[#3A4B86] group-hover:-rotate-12 transition-transform duration-200" />
        )}
      </button>
    );
  }

  // "full" variant - e.g. for drawer or settings menu
  return (
    <div
      onClick={toggleTheme}
      className={cn(
        "flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E8E3D8] hover:border-[#D6CFBE] transition-all cursor-pointer shadow-2xs select-none",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {isDark ? (
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-lg bg-[#DDE4F8] border border-[#BAC7E8] flex items-center justify-center">
            <Moon className="w-4 h-4 text-[#3A4B86]" />
          </div>
        )}
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold text-[#18181B]">Appearance</span>
          <span className="text-[10px] font-mono text-[#71717A]">
            {isDark ? "Dark Mode (Active)" : "Light Mode (Active)"}
          </span>
        </div>
      </div>

      <div className="relative inline-flex items-center">
        <div
          className={cn(
            "w-9 h-5 rounded-full transition-colors duration-200 border flex items-center px-0.5",
            isDark
              ? "bg-[#18181B] border-[#27272A]"
              : "bg-[#E8E3D8] border-[#D6CFBE]"
          )}
        >
          <div
            className={cn(
              "w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200 shadow-xs",
              isDark ? "translate-x-4" : "translate-x-0"
            )}
          />
        </div>
      </div>
    </div>
  );
}
