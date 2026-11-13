"use client";

import React, { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Map, Info, Menu, X } from "lucide-react";
import { TextbookSidebar } from "@/components/layout/TextbookSidebar";

export function Navbar() {
  const pathname = usePathname();
  const mobileMenuId = useId();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [renderedScheme, setRenderedScheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

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

  const navLinks = [
    {
      href: "/roadmap",
      label: "Syllabus Matrix",
      icon: <Map className="w-3.5 h-3.5 text-[#AAA36D]" aria-hidden="true" />,
      accentHex: "#AAA36D",
    },
    {
      href: "/about",
      label: "About",
      icon: <Info className="w-3.5 h-3.5 text-[#8D9FCE]" aria-hidden="true" />,
      accentHex: "#8D9FCE",
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Cluster: 1. Brand Logo/Name/Tagline, 2. 6-Volume TOC, 3–4. Syllabus Matrix & About */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 shrink-0 group"
          >
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-[var(--border-strong)] bg-[var(--bg-canvas)] font-math-serif text-base sm:text-lg font-semibold tracking-tight"
              style={{ color: "#8D9FCE" }}
              aria-hidden="true"
            >
              ∬
            </div>
            <div>
              <span className="font-math-serif text-lg sm:text-xl font-semibold tracking-tight text-[var(--text-primary)] block leading-none">
                wanna math
              </span>
              <span className="text-[10px] sm:text-[11px] font-tabular-mono uppercase tracking-widest text-[var(--text-muted)] block mt-0.5">
                6-Volume Textbook
              </span>
            </div>
          </Link>

          <span
            className="hidden sm:block h-6 w-px bg-[var(--border-subtle)] shrink-0"
            aria-hidden="true"
          />

          <div className="shrink-0">
            <TextbookSidebar />
          </div>

          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-1.5 pl-3 border-l border-[var(--border-subtle)]"
          >
            <ul className="flex items-center gap-1.5">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`min-h-[36px] px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-2 border whitespace-nowrap ${
                        isActive
                          ? "bg-[var(--bg-canvas)] text-[var(--text-primary)] border-[var(--border-strong)] font-semibold"
                          : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-elevated)] hover:border-[var(--border-subtle)]"
                      }`}
                      style={
                        isActive
                          ? { boxShadow: `inset 0 -2px 0 ${item.accentHex}` }
                          : undefined
                      }
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Right Cluster: 5. Version Name & 6. Dark/Light Mode Interchange */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div
            className="hidden sm:flex items-center gap-2 min-h-[36px] px-2.5 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[var(--text-secondary)] whitespace-nowrap"
            aria-label="Current version v2.0, all 6 volumes live"
          >
            <span
              className="w-2 h-2 inline-block shrink-0"
              style={{ backgroundColor: "#96B898" }}
              aria-hidden="true"
            />
            <span>
              v2.0<span className="hidden lg:inline"> • 6 Vols Live</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleColorScheme}
            className="min-h-[36px] px-2.5 sm:px-3 py-1.5 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-xs font-medium text-[var(--text-primary)] flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
          >
            {renderedScheme === "dark" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#FBEAA4] shrink-0" aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">Paper Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#8D9FCE] shrink-0" aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">Drafting Dark</span>
              </>
            )}
          </button>

          {/* Mobile Menu Toggle (< md) */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden min-h-[36px] min-w-[36px] p-2 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-[var(--text-primary)] flex items-center justify-center cursor-pointer"
            aria-expanded={mobileOpen}
            aria-controls={mobileMenuId}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Menu className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Narrow Screen Drawer (< md) */}
      {mobileOpen && (
        <nav
          id={mobileMenuId}
          aria-label="Primary"
          className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-panel)] px-4 py-3 space-y-2"
        >
          <ul className="space-y-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`min-h-[40px] flex items-center gap-2.5 px-3 py-2 text-sm font-medium border transition-colors ${
                      isActive
                        ? "bg-[var(--bg-canvas)] text-[var(--text-primary)] border-[var(--border-strong)] font-semibold"
                        : "border-transparent text-[var(--text-primary)] hover:bg-[var(--bg-panel-elevated)]"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="sm:hidden pt-2 border-t border-[var(--border-subtle)] flex items-center gap-2 px-3 py-1 text-xs font-tabular-mono text-[var(--text-secondary)]">
            <span
              className="w-2 h-2 inline-block"
              style={{ backgroundColor: "#96B898" }}
              aria-hidden="true"
            />
            <span>v2.0 • 6 Vols Live</span>
          </div>
        </nav>
      )}
    </header>
  );
}
