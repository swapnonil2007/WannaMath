"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Grid,
  Layers,
  Box,
  Sun,
  Moon,
  Map,
  Menu,
  X,
  BookOpen,
} from "lucide-react";
import { MULTIVARIABLE_CALCULUS_TOPICS } from "@/registry/curriculum";

const TOPIC_ICONS: Record<string, React.ReactNode> = {
  "double-integrals": <Layers className="w-4 h-4" aria-hidden="true" />,
  "triple-integrals": <Box className="w-4 h-4" aria-hidden="true" />,
  "coordinate-systems": <Compass className="w-4 h-4" aria-hidden="true" />,
  jacobians: <Grid className="w-4 h-4" aria-hidden="true" />,
};

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [renderedScheme, setRenderedScheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const getSystemScheme = (): "dark" | "light" =>
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

    const computeCurrentRendered = (): "dark" | "light" => {
      try {
        const stored = localStorage.getItem("color-scheme");
        if (stored === "dark" || stored === "light") {
          return stored;
        }
      } catch {
        // ignore storage errors
      }
      return getSystemScheme();
    };

    const syncState = () => {
      setRenderedScheme(computeCurrentRendered());
    };

    syncState();

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      // Do NOT remove stored value on system change; only re-evaluate rendered state
      syncState();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "color-scheme" || e.key === null) {
        const meta = document.querySelector('meta[name="color-scheme"]');
        if (meta) {
          meta.setAttribute("content", e.newValue ?? "light dark");
        }
        syncState();
      }
    };

    mql.addEventListener("change", handleMediaChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      mql.removeEventListener("change", handleMediaChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleToggleColorScheme = () => {
    const systemScheme: "dark" | "light" = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
      ? "dark"
      : "light";

    let current: "dark" | "light" = systemScheme;
    try {
      const stored = localStorage.getItem("color-scheme");
      if (stored === "dark" || stored === "light") {
        current = stored;
      }
    } catch {
      // ignore
    }

    const target: "dark" | "light" = current === "dark" ? "light" : "dark";
    const meta = document.querySelector('meta[name="color-scheme"]');

    try {
      if (target === systemScheme) {
        localStorage.removeItem("color-scheme");
        if (meta) meta.setAttribute("content", "light dark");
      } else {
        localStorage.setItem("color-scheme", target);
        if (meta) meta.setAttribute("content", target);
      }
    } catch {
      if (meta) meta.setAttribute("content", target);
    }

    setRenderedScheme(target);
    window.dispatchEvent(
      new CustomEvent("wanna-math-theme-change", { detail: { scheme: target } })
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Identity */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div
              className="w-9 h-9 flex items-center justify-center border border-[var(--border-strong)] bg-[var(--bg-canvas)] font-math-serif text-lg font-semibold tracking-tight"
              style={{ color: "#8D9FCE" }}
            >
              ∬
            </div>
            <div>
              <span className="font-math-serif text-xl font-semibold tracking-tight text-[var(--text-primary)] block leading-none">
                wanna math
              </span>
              <span className="text-[11px] font-tabular-mono uppercase tracking-widest text-[var(--text-muted)] block mt-0.5">
                Engineering Visual Lab
              </span>
            </div>
          </Link>

          {/* Primary Navigation Links */}
          <nav
            aria-label="Main Curriculum Navigation"
            className="hidden lg:flex items-center gap-1 pl-4 border-l border-[var(--border-subtle)]"
          >
            <Link
              href="/calculus"
              className={`px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5 border ${
                pathname === "/calculus"
                  ? "bg-[var(--bg-canvas)] text-[var(--text-primary)] border-[var(--border-strong)]"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-elevated)]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#8D9FCE]" aria-hidden="true" />
              <span>Calculus Hub</span>
            </Link>

            {MULTIVARIABLE_CALCULUS_TOPICS.map((topic) => {
              const isActive = pathname === topic.route;
              return (
                <Link
                  key={topic.id}
                  href={topic.route}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5 border ${
                    isActive
                      ? "bg-[var(--bg-canvas)] text-[var(--text-primary)] border-[var(--border-strong)]"
                      : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-elevated)]"
                  }`}
                >
                  <span style={{ color: topic.accentHex }}>
                    {TOPIC_ICONS[topic.id]}
                  </span>
                  <span>{topic.shortTitle}</span>
                </Link>
              );
            })}

            <Link
              href="/roadmap"
              className={`px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5 border ${
                pathname === "/roadmap"
                  ? "bg-[var(--bg-canvas)] text-[var(--text-primary)] border-[var(--border-strong)]"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-elevated)]"
              }`}
            >
              <Map className="w-3.5 h-3.5 text-[#AAA36D]" aria-hidden="true" />
              <span>Roadmap</span>
            </Link>
          </nav>
        </div>

        {/* Right Controls: Phase Indicator & Theme Mode Switch */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[var(--text-secondary)]">
            <span
              className="w-2 h-2 inline-block"
              style={{ backgroundColor: "#96B898" }}
              aria-hidden="true"
            />
            <span>v1.0 • Phase 1 Shell</span>
          </div>

          <button
            type="button"
            onClick={handleToggleColorScheme}
            className="px-3 py-1.5 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-xs font-medium text-[var(--text-primary)] flex items-center gap-2 cursor-pointer transition-colors"
            title={
              renderedScheme === "dark"
                ? "Switch to Warm Paper Light Mode"
                : "Switch to Drafting Slate Dark Mode"
            }
          >
            {renderedScheme === "dark" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#FBEAA4]" aria-hidden="true" />
                <span className="hidden md:inline">Paper Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#8D9FCE]" aria-hidden="true" />
                <span className="hidden md:inline">Drafting Dark</span>
              </>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden p-2 border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-[var(--text-primary)]"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? (
              <X className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Menu className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="lg:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-panel)] px-4 py-3 space-y-1"
        >
          <Link
            href="/calculus"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-panel-elevated)]"
          >
            <BookOpen className="w-4 h-4 text-[#8D9FCE]" aria-hidden="true" />
            <span>Multivariable Calculus Overview</span>
          </Link>

          {MULTIVARIABLE_CALCULUS_TOPICS.map((topic) => (
            <Link
              key={topic.id}
              href={topic.route}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-panel-elevated)]"
            >
              <span className="flex items-center gap-2.5">
                <span style={{ color: topic.accentHex }}>
                  {TOPIC_ICONS[topic.id]}
                </span>
                <span>
                  {topic.number}. {topic.title}
                </span>
              </span>
              <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
                {topic.dimensionBadge}
              </span>
            </Link>
          ))}

          <Link
            href="/roadmap"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-panel-elevated)]"
          >
            <Map className="w-4 h-4 text-[#AAA36D]" aria-hidden="true" />
            <span>Curriculum & Architecture Roadmap</span>
          </Link>
        </nav>
      )}
    </header>
  );
}
