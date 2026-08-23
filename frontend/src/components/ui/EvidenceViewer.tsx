"use client";

import React, { useState } from "react";
import {
  FileText,
  Search,
  Code2,
  Shield,
  Zap,
  Globe,
  Terminal,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Cpu,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { EvidenceItem } from "@/types/api";

interface EvidenceViewerProps {
  evidence: EvidenceItem[];
  filter?: string;
}

export function EvidenceViewer({ evidence, filter = "all" }: EvidenceViewerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedRawIds, setExpandedRawIds] = useState<Record<string, boolean>>({});

  const filteredEvidence =
    filter === "all"
      ? evidence
      : evidence.filter(
          (e) =>
            e.evidence_type === filter ||
            e.tool_used.toLowerCase().includes(filter.toLowerCase())
        );

  const handleCopyJSON = (id: string, content: any) => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleRaw = (id: string) => {
    setExpandedRawIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getToolIcon = (toolName: string) => {
    const t = toolName.toLowerCase();
    if (t.includes("search") || t.includes("tavily") || t.includes("serp"))
      return <Search className="w-3.5 h-3.5 text-[#3A4B86]" />;
    if (t.includes("ast") || t.includes("radon") || t.includes("code"))
      return <Code2 className="w-3.5 h-3.5 text-[#2D5A36]" />;
    if (t.includes("bandit") || t.includes("security") || t.includes("semgrep"))
      return <Shield className="w-3.5 h-3.5 text-[#7A3A30]" />;
    if (t.includes("lighthouse") || t.includes("playwright") || t.includes("uptime"))
      return <Globe className="w-3.5 h-3.5 text-[#18181B]" />;
    return <Cpu className="w-3.5 h-3.5 text-[#71717A]" />;
  };

  if (filteredEvidence.length === 0) {
    return (
      <div className="py-10 text-center text-[#71717A]">
        <FileText className="w-8 h-8 text-[#A1A1AA] mx-auto mb-2" />
        <p className="text-xs font-bold text-[#18181B]">No Evidence Telemetry Artifacts</p>
        <p className="text-[11px] text-[#71717A] mt-1">
          Run evaluations in the Stage Workspace to generate grounded proof dossiers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {filteredEvidence.map((ev) => {
        const isRawOpen = expandedRawIds[ev.id];
        const content = ev.content || {};

        return (
          <div
            key={ev.id}
            className="p-4 rounded-xl bg-white border border-[#E8E3D8] hover:border-[#D6CFBE] transition-colors space-y-3 shadow-2xs"
          >
            {/* Header: Tool, Source & Type */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#E8E3D8] text-xs font-mono font-bold text-[#18181B]">
                  {getToolIcon(ev.tool_used)}
                  <span>{ev.tool_used}</span>
                </div>
                <span className="text-[11px] font-mono text-[#71717A] truncate max-w-xs">
                  {ev.source}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="default" size="sm">
                  {ev.evidence_type}
                </Badge>
                <button
                  onClick={() => handleCopyJSON(ev.id, ev.content)}
                  className="flex items-center gap-1 text-[11px] text-[#52525B] hover:text-[#18181B] bg-[#FAF8F5] hover:bg-[#F4EFE6] border border-[#E8E3D8] px-2 py-0.5 rounded transition-colors cursor-pointer font-mono font-semibold"
                  title="Copy formatted JSON payload"
                >
                  {copiedId === ev.id ? (
                    <>
                      <Check className="w-3 h-3 text-[#2D5A36]" />
                      <span className="text-[#2D5A36]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Formatted Content Cards */}
            <div className="space-y-2">
              {/* Web Search Query Item */}
              {content.query && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E3D8] text-xs">
                  <span className="font-mono text-[11px] text-[#18181B] font-bold uppercase tracking-wider shrink-0 mt-0.5">
                    Query:
                  </span>
                  <span className="text-[#18181B] font-mono text-xs">&quot;{content.query}&quot;</span>
                </div>
              )}

              {/* Status & Latency / Score Metrics */}
              {(content.status || content.score !== undefined || content.latency_ms !== undefined) && (
                <div className="flex flex-wrap gap-2">
                  {content.status && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#E8E3D8] text-[11px] font-mono text-[#18181B]">
                      <span className="text-[#71717A]">Status:</span>
                      <span
                        className={cn(
                          "font-bold",
                          content.status === "verified" || content.status === "ok"
                            ? "text-[#2D5A36]"
                            : "text-[#18181B]"
                        )}
                      >
                        {content.status.toUpperCase()}
                      </span>
                    </div>
                  )}
                  {content.score !== undefined && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#E8E3D8] text-[11px] font-mono text-[#18181B]">
                      <span className="text-[#71717A]">Score:</span>
                      <span className="text-[#2D5A36] font-bold">{content.score}/100</span>
                    </div>
                  )}
                  {content.latency_ms !== undefined && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#E8E3D8] text-[11px] font-mono text-[#18181B]">
                      <span className="text-[#71717A]">Response:</span>
                      <span className="text-[#18181B] font-bold">{content.latency_ms}ms</span>
                    </div>
                  )}
                </div>
              )}

              {/* Findings list */}
              {Array.isArray(content.findings) && content.findings.length > 0 && (
                <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E3D8] space-y-1.5">
                  <div className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider font-bold">
                    Key Findings ({content.findings.length}):
                  </div>
                  <ul className="space-y-1 text-xs text-[#52525B]">
                    {content.findings.map((f: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A36] shrink-0 mt-0.5" />
                        <span>{typeof f === "string" ? f : JSON.stringify(f)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Summary text */}
              {content.summary && (
                <p className="text-xs text-[#52525B] leading-relaxed bg-[#FAF8F5] p-2.5 rounded-lg border border-[#E8E3D8]">
                  {content.summary}
                </p>
              )}

              {/* Generic Key-Value grid */}
              {Object.entries(content)
                .filter(
                  ([k]) =>
                    !["query", "status", "score", "latency_ms", "findings", "summary"].includes(k)
                )
                .slice(0, 4)
                .map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-start justify-between gap-3 px-2.5 py-1.5 rounded bg-[#FAF8F5]/60 text-[11px] font-mono"
                  >
                    <span className="text-[#71717A] capitalize">{k.replace(/_/g, " ")}:</span>
                    <span className="text-[#18181B] text-right truncate max-w-sm font-semibold">
                      {typeof v === "object" ? JSON.stringify(v) : String(v)}
                    </span>
                  </div>
                ))}
            </div>

            {/* Collapsible Raw Inspector */}
            <div className="pt-2 border-t border-[#E8E3D8]">
              <button
                onClick={() => toggleRaw(ev.id)}
                className="flex items-center gap-1.5 text-[11px] font-mono text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
              >
                {isRawOpen ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                <span>{isRawOpen ? "Hide Raw Payload" : "Inspect Raw JSON Schema"}</span>
              </button>

              {isRawOpen && (
                <pre className="mt-2 p-3 rounded-lg bg-[#FAF8F5] border border-[#E8E3D8] text-[11px] text-[#18181B] overflow-x-auto max-h-52 overflow-y-auto font-mono">
                  {JSON.stringify(ev.content, null, 2)}
                </pre>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
