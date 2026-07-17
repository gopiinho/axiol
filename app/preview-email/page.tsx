import { render } from "react-email";
import { headers } from "next/headers";
import { DownloadReceipt } from "@/emails/download-receipt";
import { AutoResizeIframe } from "./auto-resize-iframe";

export default async function PreviewEmailPage() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host}`;

  const html = await render(
    <DownloadReceipt
      productName="Beat 'em Up Loop Kit"
      storeName="Axiol"
      downloadUrl={`${origin}/download/sample-token`}
      siteUrl={origin}
      customerName="Arjun Patel"
      amount="₹499.00"
      orderId="CF-2026-001234"
      orderDate="July 4, 2026"
    />
  );

  return (
    <div
      style={{
        background: "#e8e8e8",
        minHeight: "100vh",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          padding: "12px 16px",
          background: "#fff",
          borderRadius: 8,
          boxSizing: "border-box",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 14 }}>Email Preview</span>
        <span style={{ fontSize: 12, color: "#666" }}>
          Edit{" "}
          <code
            style={{
              background: "#f0f0f0",
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 12,
            }}
          >
            emails/download-receipt.tsx
          </code>{" "}
          and refresh
        </span>
      </div>
      <AutoResizeIframe html={html} />
    </div>
  );
}
