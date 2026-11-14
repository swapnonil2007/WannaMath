"use client";

import React, { useId, useMemo, useRef, useState, useEffect } from "react";
import { AlertCircle, Check, Sparkles } from "lucide-react";
import { compileMathExpression } from "@/lib/mathParser";
import { getAdaptiveAccentInk } from "@/lib/accentInk";
import { KaTeXMath } from "@/components/math/KaTeXMath";

interface MathExpressionInputProps {
  label: string;
  value: string;
  onChange: (newValidExpression: string) => void;
  allowedVars: string[];
  prefixLatex?: string;
  placeholder?: string;
  accentHex?: string;
  quickTokens?: { label: string; insert: string }[];
  compact?: boolean;
}

const DEFAULT_TOKENS: { label: string; insert: string }[] = [
  { label: "x²", insert: "x^2" },
  { label: "y²", insert: "y^2" },
  { label: "√()", insert: "sqrt()" },
  { label: "sin()", insert: "sin()" },
  { label: "cos()", insert: "cos()" },
  { label: "exp()", insert: "exp()" },
  { label: "π", insert: "pi" },
];

/**
 * Accessible Math Typing & Live KaTeX Preview Widget.
 * Follows modern-web-guidance:
 * - Visible <label> and syntax hint placed ABOVE the input.
 * - autocorrect="off", autocapitalize="none", spellcheck="false" for math expressions.
 * - Validates on blur or submit (Enter/Apply) so errors are not shown prematurely while typing,
 *   and clears error states immediately on input once valid.
 * - Links error message ID in aria-describedby ONLY while the field is in an error state.
 */
export function MathExpressionInput({
  label,
  value,
  onChange,
  allowedVars,
  prefixLatex,
  placeholder = "e.g. 1.5 - 0.4*(x^2 + y^2)",
  accentHex = "#8D9FCE",
  quickTokens,
  compact = false,
}: MathExpressionInputProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [draft, setDraft] = useState<string>(value);
  const [hasBlurredOrSubmitted, setHasBlurredOrSubmitted] =
    useState<boolean>(false);

  // Sync draft when external preset changes value
  useEffect(() => {
    setDraft(value);
    setHasBlurredOrSubmitted(false);
  }, [value]);

  const compiled = useMemo(
    () => compileMathExpression(draft, allowedVars),
    [draft, allowedVars]
  );

  const showError = hasBlurredOrSubmitted && !compiled.valid;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextText = e.target.value;
    setDraft(nextText);

    const check = compileMathExpression(nextText, allowedVars);
    if (check.valid) {
      // Clear error state immediately on input once resolved & push live update
      setHasBlurredOrSubmitted(false);
      onChange(nextText);
    }
  };

  const handleCommit = () => {
    setHasBlurredOrSubmitted(true);
    if (compiled.valid) {
      onChange(draft);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleCommit();
    }
  };

  const handleInsertToken = (tokenStr: string) => {
    const el = inputRef.current;
    if (!el) {
      const next = draft + tokenStr;
      setDraft(next);
      const check = compileMathExpression(next, allowedVars);
      if (check.valid) onChange(next);
      return;
    }

    const start = el.selectionStart ?? draft.length;
    const end = el.selectionEnd ?? draft.length;
    const next = draft.slice(0, start) + tokenStr + draft.slice(end);
    setDraft(next);

    const check = compileMathExpression(next, allowedVars);
    if (check.valid) {
      setHasBlurredOrSubmitted(false);
      onChange(next);
    }

    requestAnimationFrame(() => {
      el.focus();
      const cursorOffset = tokenStr.endsWith("()")
        ? start + tokenStr.length - 1
        : start + tokenStr.length;
      el.setSelectionRange(cursorOffset, cursorOffset);
    });
  };

  const tokensToDisplay = quickTokens ?? DEFAULT_TOKENS;

  return (
    <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-2">
      {/* Label & Allowed Variables Hint ABOVE the input */}
      <div className="flex flex-wrap items-center justify-between gap-1">
        <label
          htmlFor={inputId}
          className="text-xs font-tabular-mono font-semibold text-[var(--text-primary)] flex items-center gap-1.5"
        >
          <Sparkles
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: getAdaptiveAccentInk(accentHex) }}
            aria-hidden="true"
          />
          <span>{label}</span>
        </label>
        <span
          id={hintId}
          className="text-[11px] font-tabular-mono text-[var(--text-muted)]"
        >
          Vars: {allowedVars.length > 0 ? allowedVars.join(", ") : "constants"}{" "}
          • Ops: + - * / ^ sqrt sin cos exp
        </span>
      </div>

      {/* Quick-Insert Math Symbol Keypad */}
      {!compact && (
        <div
          role="group"
          className="flex flex-wrap items-center gap-1"
          aria-label="Quick insert math symbols"
        >
          {tokensToDisplay.map((tok) => (
            <button
              key={tok.label}
              type="button"
              onClick={() => handleInsertToken(tok.insert)}
              className="px-2 py-0.5 text-[11px] font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
            >
              {tok.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Row + Apply Button */}
      <div className="flex items-stretch gap-1.5">
        {prefixLatex && (
          <div className="px-2.5 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs flex items-center shrink-0 text-[var(--text-secondary)]">
            <KaTeXMath math={prefixLatex} />
          </div>
        )}

        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={draft}
          onChange={handleInputChange}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={showError ? "true" : "false"}
          aria-describedby={showError ? `${hintId} ${errorId}` : hintId}
          className={`w-full px-3 py-1.5 text-sm font-tabular-mono bg-[var(--bg-panel)] text-[var(--text-primary)] border focus:outline-none transition-colors ${
            showError
              ? "border-[var(--math-ink-upper)]"
              : "border-[var(--border-strong)] focus:border-[var(--accent-color)]"
          }`}
        />

        <button
          type="button"
          onClick={handleCommit}
          className="px-3 py-1.5 border border-[var(--border-strong)] bg-[var(--bg-panel-elevated)] hover:bg-[var(--bg-panel)] text-xs font-tabular-mono font-medium text-[var(--text-primary)] flex items-center gap-1 shrink-0 cursor-pointer"
          title="Plot custom expression"
        >
          <Check
            className="w-3.5 h-3.5"
            style={{
              color: compiled.valid
                ? "var(--math-ink-y)"
                : "var(--math-ink-upper)",
            }}
            aria-hidden="true"
          />
          <span>Plot</span>
        </button>
      </div>

      {/* Live KaTeX Typeset Preview */}
      <div className="px-2.5 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] flex items-center justify-between gap-2 text-xs overflow-x-auto">
        <span className="text-[10px] font-tabular-mono uppercase text-[var(--text-muted)] shrink-0">
          Live TeX Preview:
        </span>
        <div className="text-[var(--text-primary)]">
          <KaTeXMath
            math={
              prefixLatex
                ? `${prefixLatex} ${compiled.tex}`
                : compiled.tex
            }
          />
        </div>
      </div>

      {/* Accessible Error Message (shown only after blur or submit if invalid) */}
      {showError && (
        <div
          id={errorId}
          className="flex items-start gap-1.5 text-xs text-[var(--math-ink-lower)] font-tabular-mono pt-0.5"
        >
          <AlertCircle
            className="w-3.5 h-3.5 shrink-0 mt-0.5"
            role="img"
            aria-label="Error"
          />
          <span>{compiled.error}</span>
        </div>
      )}
    </div>
  );
}
