"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  X,
} from "lucide-react";
import { getAllVolumes } from "@/registry/index";

export function TextbookSidebar() {
  const pathname = usePathname();
  const dialogId = useId();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Default expand Volume III (active volume)
  const [expandedVolumes, setExpandedVolumes] = useState<Record<string, boolean>>({
    "multivariable-calculus": true,
  });

  const volumes = getAllVolumes();

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

  const toggleVolumeExpand = (volSlug: string) => {
    setExpandedVolumes((prev) => ({
      ...prev,
      [volSlug]: !prev[volSlug],
    }));
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
      closeDrawer();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openDrawer}
        aria-expanded={isOpen}
        aria-controls={dialogId}
        className="px-3 py-1.5 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono font-medium text-[var(--text-primary)] flex items-center gap-2 cursor-pointer transition-colors"
      >
        <BookOpen className="w-3.5 h-3.5 text-[#029091]" aria-hidden="true" />
        <span>6-Volume TOC</span>
      </button>

      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-label="6-Volume Engineering Mathematics Textbook Table of Contents"
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
              <span className="text-[10px] font-tabular-mono uppercase tracking-wider text-[#029091] block">
                4-Tier Textbook Index • Vol → Mod → Ch → Lab
              </span>
              <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
                Engineering Mathematics Volumes I–VI
              </h2>
            </div>

            <button
              type="button"
              onClick={closeDrawer}
              autoFocus
              aria-label="Close textbook table of contents"
              className="p-2 border border-[var(--border-strong)] bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-elevated)] text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Scrollable 6-Volume Tree */}
          <nav
            aria-label="Textbook Volumes and Chapters"
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {volumes.map((vol) => {
              const isExpanded = Boolean(expandedVolumes[vol.slug]);
              const panelId = `toc-vol-${vol.slug}`;
              const publishedCount = vol.modules.reduce(
                (acc, m) =>
                  acc +
                  m.chapters.filter((c) => c.status === "published").length,
                0
              );

              return (
                <div
                  key={vol.id}
                  className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                >
                  {/* Volume Row */}
                  <div className="p-3 flex items-center justify-between gap-2">
                    <Link
                      href={`/${vol.slug}`}
                      aria-current={
                        pathname === `/${vol.slug}` ? "page" : undefined
                      }
                      className="flex-1 min-w-0 group"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[11px] font-tabular-mono font-semibold px-1.5 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
                          style={{ color: vol.accentHex }}
                        >
                          VOL. {vol.volumeNumber}
                        </span>
                        {publishedCount > 0 ? (
                          <span className="text-[10px] font-tabular-mono text-[#96B898] flex items-center gap-1">
                            <CheckCircle2
                              className="w-3 h-3"
                              aria-hidden="true"
                            />
                            <span>{publishedCount} Live</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-tabular-mono text-[var(--text-muted)]">
                            {vol.modules.length} Modules
                          </span>
                        )}
                      </div>
                      <span className="font-math-serif text-sm font-semibold text-[var(--text-primary)] group-hover:underline block mt-1 truncate">
                        {vol.title}
                      </span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => toggleVolumeExpand(vol.slug)}
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      aria-label={`Toggle chapters in Volume ${vol.volumeNumber}: ${vol.title}`}
                      className="p-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  {/* Modules & Chapters Subtree */}
                  <div
                    id={panelId}
                    hidden={!isExpanded}
                    className="border-t border-[var(--border-subtle)] bg-[var(--bg-panel)] p-3 space-y-3"
                  >
                    {vol.modules.map((mod) => (
                      <div key={mod.id} className="space-y-1.5">
                        <Link
                          href={`/${vol.slug}/${mod.slug}`}
                          aria-current={
                            pathname === `/${vol.slug}/${mod.slug}`
                              ? "page"
                              : undefined
                          }
                          className="text-xs font-tabular-mono font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-between"
                        >
                          <span>
                            Module {mod.numberLabel}: {mod.title}
                          </span>
                        </Link>

                        <ul className="space-y-1 pl-2 border-l border-[var(--border-subtle)]">
                          {(() => {
                            const renderChapterLink = (ch: (typeof mod.chapters)[number]) => {
                              const chRoute = `/${vol.slug}/${mod.slug}/${ch.slug}`;
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
                                          color: ch.accentHex ?? vol.accentHex,
                                        }}
                                      >
                                        {ch.id}
                                      </span>
                                      {ch.title}
                                    </span>

                                    {isPub ? (
                                      <span className="text-[10px] font-tabular-mono px-1.5 py-0.5 border border-[#96B898] text-[#96B898] shrink-0">
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
                            };

                            const direct = mod.chapters.filter((c) => !c.subParent);
                            const groups: { slug: string; title: string; items: typeof mod.chapters }[] = [];
                            for (const c of mod.chapters) {
                              if (!c.subParent) continue;
                              let g = groups.find((x) => x.slug === c.subParent!.slug);
                              if (!g) {
                                g = { slug: c.subParent.slug, title: c.subParent.title, items: [] };
                                groups.push(g);
                              }
                              g.items.push(c);
                            }

                            return (
                              <>
                                {direct.map(renderChapterLink)}
                                {groups.map((grp) => (
                                  <li key={grp.slug} className="pt-2 space-y-1">
                                    <div className="px-2 py-1 text-[10px] font-tabular-mono uppercase tracking-wider text-[#D35323] border-b border-[var(--border-subtle)]">
                                      ↳ {grp.title}
                                    </div>
                                    <ul className="space-y-1 pl-2 border-l border-[var(--border-subtle)]">
                                      {grp.items.map(renderChapterLink)}
                                    </ul>
                                  </li>
                                ))}
                              </>
                            );
                          })()}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Drawer Footer */}
          <div className="p-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex items-center justify-between text-xs font-tabular-mono">
            <span className="text-[var(--text-muted)]">
              {volumes.length} Volumes •{" "}
              {volumes.reduce((sum, v) => sum + v.modules.length, 0)} Modules •{" "}
              {volumes.reduce(
                (sum, v) =>
                  sum + v.modules.reduce((ms, m) => ms + m.chapters.length, 0),
                0
              )}{" "}
              Chapters
            </span>
            <Link
              href="/roadmap"
              className="text-[#FBEAA4] hover:underline"
            >
              Full Matrix →
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
