import React from "react";
import { cn } from "./Button";

export interface ScoreMeterProps {
  score: number;
  maxScore?: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  sublabel?: string;
  showPercent?: boolean;
  className?: string;
}

export function ScoreMeter({
  score,
  maxScore = 100,
  size = "md",
  label,
  sublabel,
  showPercent = true,
  className,
}: ScoreMeterProps) {
  const percentage = Math.min(Math.max((score / maxScore) * 100, 0), 100);

  // Color mapping based on score tiers
  const getColor = (pct: number) => {
    if (pct >= 80) return { stroke: "#10b981", text: "text-emerald-400", bg: "bg-emerald-500/10" };
    if (pct >= 60) return { stroke: "#6366f1", text: "text-indigo-400", bg: "bg-indigo-500/10" };
    if (pct >= 40) return { stroke: "#f59e0b", text: "text-amber-400", bg: "bg-amber-500/10" };
    return { stroke: "#f43f5e", text: "text-rose-400", bg: "bg-rose-500/10" };
  };

  const color = getColor(percentage);

  const dimensions = {
    sm: { radius: 24, strokeWidth: 4, size: 60, textClass: "text-xs font-mono font-bold" },
    md: { radius: 36, strokeWidth: 5, size: 90, textClass: "text-lg font-mono font-bold" },
    lg: { radius: 52, strokeWidth: 7, size: 130, textClass: "text-2xl font-mono font-bold" },
  };

  const { radius, strokeWidth, size: svgSize, textClass } = dimensions[size];
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative inline-flex items-center justify-center shrink-0">
        <svg
          width={svgSize}
          height={svgSize}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-zinc-800"
          />
          {/* Progress circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className={cn("absolute", textClass, color.text)}>
          {Math.round(score)}
          {showPercent && <span className="text-[10px] text-zinc-500 ml-0.5">/100</span>}
        </span>
      </div>

      {(label || sublabel) && (
        <div className="flex flex-col">
          {label && <span className="text-xs font-semibold text-zinc-200">{label}</span>}
          {sublabel && <span className="text-[11px] text-zinc-500">{sublabel}</span>}
        </div>
      )}
    </div>
  );
}
