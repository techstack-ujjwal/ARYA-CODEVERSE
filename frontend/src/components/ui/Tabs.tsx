"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: "pills" | "underline";
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  variant = "pills",
}: TabsProps) {
  if (variant === "underline") {
    return (
      <div className={cn("flex space-x-6 border-b border-[#E8E3D8]", className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center gap-2 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all -mb-[1px] cursor-pointer",
                isActive
                  ? "border-[#18181B] text-[#18181B] dark:border-white dark:text-white"
                  : "border-transparent text-[#71717A] hover:text-[#18181B] hover:border-[#D6CFBE] dark:text-zinc-400 dark:hover:text-white"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold",
                    isActive
                      ? "bg-[#18181B] text-white dark:bg-white dark:text-zinc-900"
                      : "bg-[#F4EFE6] text-[#52525B] dark:bg-zinc-800 dark:text-zinc-300"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-1 bg-white border border-[#E8E3D8] rounded-xl shadow-xs",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer font-mono",
              isActive
                ? "bg-[#18181B] text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-900"
                : "text-[#52525B] hover:text-[#18181B] hover:bg-[#FAF8F5] dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold",
                  isActive
                    ? "bg-[#3A4B86] text-white dark:bg-indigo-600"
                    : "bg-[#FAF8F5] text-[#52525B] dark:bg-zinc-800 dark:text-zinc-300"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
