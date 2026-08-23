import React from "react";
import { cn } from "@/lib/utils";

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

  const getColor = (pct: number) => {
    if (pct >= 75) return { stroke: "#2D5A36", text: "text-[#2D5A36]" };
    if (pct >= 50) return { stroke: "#18181B", text: "text-[#18181B]" };
    return { stroke: "#7A3A30", text: "text-[#7A3A30]" };
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
            className="text-[#E8E3D8]"
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
          {showPercent && <span className="text-[10px] text-[#71717A] ml-0.5 font-normal">/100</span>}
        </span>
      </div>

      {(label || sublabel) && (
        <div className="flex flex-col">
          {label && <span className="text-xs font-bold text-[#18181B]">{label}</span>}
          {sublabel && <span className="text-[11px] text-[#71717A]">{sublabel}</span>}
        </div>
      )}
    </div>
  );
}
