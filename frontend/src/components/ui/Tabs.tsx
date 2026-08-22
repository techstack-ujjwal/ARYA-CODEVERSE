"use client";

import React from "react";
import { cn } from "./Button";

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
      <div className={cn("flex space-x-6 border-b border-zinc-800", className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-all -mb-[1px] cursor-pointer",
                isActive
                  ? "border-zinc-100 text-zinc-100 font-semibold"
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "text-[11px] px-1.5 py-0.2 rounded-full font-mono",
                    isActive
                      ? "bg-zinc-800 text-zinc-200"
                      : "bg-zinc-800/60 text-zinc-400"
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
        "inline-flex items-center gap-1 p-1 bg-zinc-900/80 border border-zinc-800/80 rounded-xl",
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
              "flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer",
              isActive
                ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50 font-semibold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                  isActive
                    ? "bg-zinc-700 text-zinc-200"
                    : "bg-zinc-800 text-zinc-400"
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
