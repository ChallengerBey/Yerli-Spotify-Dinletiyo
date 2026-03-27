"use client";

import React from "react";

export default function DinletiyoAdminPanel() {
  return React.createElement(
    "div",
    {
      style: {
        minHeight: "100vh",
        background: "linear-gradient(#111827, #000)",
        padding: 24,
        color: "white",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
      },
    },
    React.createElement(
      "div",
      { style: { maxWidth: 960, margin: "0 auto" } },
      React.createElement(
        "h1",
        { style: { fontSize: 32, fontWeight: 800, marginBottom: 8 } },
        "Dinletiyo Yönetim"
      ),
      React.createElement(
        "p",
        { style: { opacity: 0.8, marginBottom: 12 } },
        "Bu sayfa build sırasında JSX parse hatası verdiği için geçici olarak sadeleştirildi."
      ),
      React.createElement(
        "p",
        { style: { opacity: 0.9 } },
        "İstersen yönetim panelini ayrı bir TSX modüle taşıyıp yeniden aktive edebilirim."
      )
    )
  );
}

