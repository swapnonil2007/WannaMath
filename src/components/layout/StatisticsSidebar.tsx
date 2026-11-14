"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  X,
} from "lucide-react";
import { getAdaptiveAccentInk } from "@/lib/accentInk";
import type { TocVolumeItem } from "@/registry/types";

export function StatisticsSidebar({ volume }: { volume: TocVolumeItem }) {
  const pathname = usePathname();
  const dialogId = useId();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Default expand published Modules S.1–S.5
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    "descriptive-statistics": true,
    "probability-foundations-discrete": true,
    "sampling-central-limit-theorem": true,
    "statistical-inference": true,
    "group-comparisons-anova": true,
  });

  const openDrawer = () => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (!dlg.open) {
      dlg.showModal();
    }
    setIsOpen(true);
  };

  const closeDrawer = () => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (dlg.open) {
      dlg.close();
    }
    setIsOpen(false);
  };

  // Close drawer automatically on route change
  useEffect(() => {
    closeDrawer();
  }, [pathname]);

  const toggleModuleExpand = (modSlug: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modSlug]: !prev[modSlug],
    }));
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
      closeDrawer();
    }
  };

  const totalChapters = volume.modules.reduce(
    (sum, mod) => sum + mod.chapters.length,
    0
  );
  const publishedChapters = volume.modules.reduce(
    (sum, mod) =>
      sum + mod.chapters.filter((ch) => ch.status === "published").length,
    0
  );

  return (
    <>
      <button
        type="button"
        onClick={openDrawer}
        aria-expanded={isOpen}
        aria-controls={dialogId}
        className="min-h-[36px] px-2.5 sm:px-3 py-1.5 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono font-medium text-[var(--text-primary)] flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-colors whitespace-nowrap"
      >
        <BarChart3
          className="w-3.5 h-3.5 text-[var(--math-ink-x)]"
          aria-hidden="true"
        />
        <span>Statistics TOC</span>
      </button>

      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-label="Statistics Volume Table of Contents"
        onClick={handleBackdropClick}
        onClose={() => setIsOpen(false)}
        className="m-0 p-0 max-w-none max-h-none w-full h-full bg-transparent backdrop:bg-black/60 open:flex"
      >
        <div
          ref={sheetRef}
          className="w-[min(26rem,88dvw)] h-[100svh] bg-[var(--bg-panel)] text-[var(--text-primary)] border-r border-[var(--border-strong)] flex flex-col overflow-hidden"
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)] block">
                4-Tier Statistics Index • Vol S → Mod → Ch → Lab
              </span>
              <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
                Interactive Statistics (S.1–S.6)
              </h2>
            </div>

            <button
              type="button"
              onClick={closeDrawer}
              autoFocus
              aria-label="Close statistics table of contents"
              className="p-2 border border-[var(--border-strong)] bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-elevated)] text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Scrollable Statistics Volume Tree */}
          <nav
            aria-label="Statistics Modules and Chapters"
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {/* Volume S Overview Link Card */}
            <Link
              href={`/${volume.slug}`}
              aria-current={pathname === `/${volume.slug}` ? "page" : undefined}
              className="block p-3 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-[11px] font-tabular-mono font-semibold px-1.5 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
                  style={{ color: getAdaptiveAccentInk(volume.accentHex) }}
                >
                  VOL. {volume.volumeNumber}
                </span>
                <span className="text-[10px] font-tabular-mono text-[var(--math-ink-y)] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                  <span>
                    {publishedChapters}/{totalChapters} Live
                  </span>
                </span>
              </div>
              <span className="font-math-serif text-sm font-semibold text-[var(--text-primary)] block mt-1.5">
                {volume.title}
              </span>
            </Link>

            {volume.modules.map((mod) => {
              const isExpanded = Boolean(expandedModules[mod.slug]);
              const panelId = `toc-stat-mod-${mod.slug}`;
              const modLiveCount = mod.chapters.filter(
                (ch) => ch.status === "published"
              ).length;

              return (
                <div
                  key={mod.id}
                  className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                >
                  {/* Module Row */}
                  <div className="p-3 flex items-center justify-between gap-2">
                    <Link
                      href={`/${volume.slug}/${mod.slug}`}
                      aria-current={
                        pathname === `/${volume.slug}/${mod.slug}`
                          ? "page"
                          : undefined
                      }
                      className="flex-1 min-w-0 group"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[11px] font-tabular-mono font-semibold px-1.5 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
                          style={{ color: getAdaptiveAccentInk(volume.accentHex) }}
                        >
                          MOD. {mod.numberLabel}
                        </span>
                        {modLiveCount > 0 ? (
                          <span className="text-[10px] font-tabular-mono text-[var(--math-ink-y)] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                            <span>{modLiveCount} Live</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-tabular-mono text-[var(--text-muted)]">
                            {mod.chapters.length} Chapters
                          </span>
                        )}
                      </div>
                      <span className="font-math-serif text-sm font-semibold text-[var(--text-primary)] group-hover:underline block mt-1 truncate">
                        {mod.title}
                      </span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => toggleModuleExpand(mod.slug)}
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      aria-label={`Toggle chapters in Module ${mod.numberLabel}: ${mod.title}`}
                      className="p-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  {/* Chapters Subtree */}
                  <div
                    id={panelId}
                    hidden={!isExpanded}
                    className="border-t border-[var(--border-subtle)] bg-[var(--bg-panel)] p-3"
                  >
                    <ul className="space-y-1 pl-2 border-l border-[var(--border-subtle)]">
                      {mod.chapters.map((ch) => {
                        const chRoute = `/${volume.slug}/${mod.slug}/${ch.slug}`;
                        const active = pathname === chRoute;
                        const isPub = ch.status === "published";

                        return (
                          <li key={ch.id}>
                            <Link
                              href={chRoute}
                              aria-current={active ? "page" : undefined}
                              className={`px-2 py-1.5 text-xs flex items-center justify-between gap-2 border transition-colors ${
                                active
                                  ? "border-[var(--border-strong)] bg-[var(--bg-canvas)] text-[var(--text-primary)] font-semibold"
                                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-canvas)]"
                              }`}
                            >
                              <span className="truncate">
                                <span
                                  className="font-tabular-mono mr-1.5"
                                  style={{
                                    color: getAdaptiveAccentInk(
                                      ch.accentHex ?? volume.accentHex
                                    ),
                                  }}
                                >
                                  {ch.id}
                                </span>
                                {ch.title}
                              </span>

                              {isPub ? (
                                <span className="text-[10px] font-tabular-mono px-1.5 py-0.5 border border-[var(--math-ink-y)] text-[var(--math-ink-y)] shrink-0">
                                  LIVE
                                </span>
                              ) : (
                                <Clock
                                  className="w-3 h-3 text-[var(--text-muted)] shrink-0"
                                  aria-hidden="true"
                                />
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Drawer Footer */}
          <div className="p-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex items-center justify-between text-xs font-tabular-mono">
            <span className="text-[var(--text-muted)]">
              {volume.modules.length} Modules • {totalChapters} Chapters
            </span>
            <Link
              href={`/${volume.slug}`}
              className="text-[var(--math-ink-x)] hover:underline"
            >
              Statistics Index →
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
