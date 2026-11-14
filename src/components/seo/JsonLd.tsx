import React from "react";

interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Safely renders Schema.org JSON-LD structured data into SSR HTML.
 * Escapes `<` to `\u003c` so mathematical inequality notation cannot break out of `<script>`.
 */
export function JsonLd({ data }: JsonLdProps) {
  const serialized = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  );
}
