import React from "react";

interface LabLoadingSkeletonProps {
  title?: string;
  heightClass?: string;
}

/**
 * Flat drafting-canvas placeholder matching lab frame geometry to prevent CLS
 * while per-chapter interactive lab chunks stream in via next/dynamic.
 */
export function LabLoadingSkeleton({
  title = "Interactive Laboratory",
  heightClass = "min-h-[500px]",
}: LabLoadingSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Loading ${title}`}
      className={`w-full ${heightClass} border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 flex flex-col justify-between gap-4`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-2.5 h-2.5 bg-[#8D9FCE] inline-block"
            aria-hidden="true"
          />
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
            Initializing {title}
          </span>
        </div>
        <span className="text-[11px] font-tabular-mono text-[var(--text-muted)] px-2 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
          LOADING MODULE
        </span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 min-h-[340px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex items-center justify-center">
          <div className="text-center space-y-2 px-4">
            <p className="text-xs font-tabular-mono text-[var(--text-secondary)]">
              Preparing interactive canvas &amp; numerical solver…
            </p>
            <p className="text-[11px] font-tabular-mono text-[var(--text-muted)]">
              wanna math drafting viewport
            </p>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4">
          <div className="h-3 w-2/3 bg-[var(--bg-panel-elevated)] border border-[var(--border-subtle)]" />
          <div className="h-8 w-full bg-[var(--bg-panel)] border border-[var(--border-subtle)]" />
          <div className="h-8 w-full bg-[var(--bg-panel)] border border-[var(--border-subtle)]" />
          <div className="h-16 w-full bg-[var(--bg-panel)] border border-[var(--border-subtle)]" />
        </div>
      </div>
    </div>
  );
}
