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
      return <Search className="w-3.5 h-3.5 text-white" />;
    if (t.includes("ast") || t.includes("radon") || t.includes("code"))
      return <Code2 className="w-3.5 h-3.5 text-emerald-400" />;
    if (t.includes("bandit") || t.includes("security") || t.includes("semgrep"))
      return <Shield className="w-3.5 h-3.5 text-red-400" />;
    if (t.includes("lighthouse") || t.includes("playwright") || t.includes("uptime"))
      return <Globe className="w-3.5 h-3.5 text-white" />;
    return <Cpu className="w-3.5 h-3.5 text-zinc-400" />;
  };

  if (filteredEvidence.length === 0) {
    return (
      <div className="py-10 text-center text-zinc-500">
        <FileText className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
        <p className="text-xs font-semibold text-zinc-400">No Evidence Telemetry Artifacts</p>
        <p className="text-[11px] text-zinc-500 mt-1">
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
            className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-3"
          >
            {/* Header: Tool, Source & Type */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono font-medium text-zinc-200">
                  {getToolIcon(ev.tool_used)}
                  <span>{ev.tool_used}</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400 truncate max-w-xs">
                  {ev.source}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="default" size="sm">
                  {ev.evidence_type}
                </Badge>
                <button
                  onClick={() => handleCopyJSON(ev.id, ev.content)}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2 py-0.5 rounded transition-colors cursor-pointer"
                  title="Copy formatted JSON payload"
                >
                  {copiedId === ev.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
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
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                  <span className="font-mono text-[11px] text-white font-semibold uppercase tracking-wider shrink-0 mt-0.5">
                    Query:
                  </span>
                  <span className="text-zinc-200 font-mono text-xs">"{content.query}"</span>
                </div>
              )}

              {/* Status & Latency / Score Metrics */}
              {(content.status || content.score !== undefined || content.latency_ms !== undefined) && (
                <div className="flex flex-wrap gap-2">
                  {content.status && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
                      <span className="text-zinc-500">Status:</span>
                      <span
                        className={cn(
                          "font-bold",
                          content.status === "verified" || content.status === "ok"
                            ? "text-emerald-400"
                            : "text-zinc-300"
                        )}
                      >
                        {content.status.toUpperCase()}
                      </span>
                    </div>
                  )}
                  {content.score !== undefined && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
                      <span className="text-zinc-500">Score:</span>
                      <span className="text-emerald-400 font-bold">{content.score}/100</span>
                    </div>
                  )}
                  {content.latency_ms !== undefined && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
                      <span className="text-zinc-500">Response:</span>
                      <span className="text-white font-bold">{content.latency_ms}ms</span>
                    </div>
                  )}
                </div>
              )}

              {/* Findings list */}
              {Array.isArray(content.findings) && content.findings.length > 0 && (
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5">
                  <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                    Key Findings ({content.findings.length}):
                  </div>
                  <ul className="space-y-1 text-xs text-zinc-300">
                    {content.findings.map((f: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{typeof f === "string" ? f : JSON.stringify(f)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Summary text */}
              {content.summary && (
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
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
                    className="flex items-start justify-between gap-3 px-2.5 py-1.5 rounded bg-zinc-900/50 text-[11px] font-mono"
                  >
                    <span className="text-zinc-400 capitalize">{k.replace(/_/g, " ")}:</span>
                    <span className="text-zinc-200 text-right truncate max-w-sm">
                      {typeof v === "object" ? JSON.stringify(v) : String(v)}
                    </span>
                  </div>
                ))}
            </div>

            {/* Collapsible Raw Inspector */}
            <div className="pt-2 border-t border-zinc-800">
              <button
                onClick={() => toggleRaw(ev.id)}
                className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {isRawOpen ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                <span>{isRawOpen ? "Hide Raw Payload" : "Inspect Raw JSON Schema"}</span>
              </button>

              {isRawOpen && (
                <pre className="mt-2 p-3 rounded-lg bg-black border border-zinc-800 text-[11px] text-zinc-300 overflow-x-auto max-h-52 overflow-y-auto font-mono">
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
