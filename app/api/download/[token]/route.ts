import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { getServerConvexClient } from "@/server/convex/client";

function errorPage(title: string, description: string, status: number) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: system-ui, -apple-system, sans-serif;
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; background: #f8fafc; color: #0f172a;
    padding: 1.5rem;
  }
  .card {
    background: #fff; border-radius: 16px; padding: 2.5rem 2rem;
    max-width: 400px; width: 100%; text-align: center;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.02), 0 12px 32px rgba(0,0,0,0.06);
  }
  .icon {
    width: 48px; height: 48px; border-radius: 50%; display: flex;
    align-items: center; justify-content: center; margin: 0 auto 1.25rem;
    font-size: 22px;
  }
  h1 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: -0.01em; }
  p { font-size: 0.875rem; color: #64748b; line-height: 1.5; margin-bottom: 1.5rem; }
  .link {
    display: inline-block; font-size: 0.8125rem; color: #64748b;
    text-decoration: none; border-bottom: 1px solid #e2e8f0;
    padding-bottom: 1px; transition: color 0.15s, border-color 0.15s;
  }
  .link:hover { color: #0f172a; border-color: #94a3b8; }
</style>
</head>
<body>
<div class="card">
  <div class="icon" style="background: #f1f5f9;">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  </div>
  <h1>${title}</h1>
  <p>${description}</p>
</div>
</body>
</html>`;

  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return errorPage("Invalid link", "This download link is invalid or has been removed.", 404);
    }

    const convex = getServerConvexClient();

    const validation = await convex.query(api.deliveries.validateToken, { token });

    if (!validation.valid) {
      if (validation.reason === "exhausted") {
        return errorPage(
          "Download limit reached",
          "This link has reached its maximum number of downloads and is no longer available.",
          410
        );
      }
      if (validation.reason === "expired") {
        return errorPage(
          "Link expired",
          "This download link has expired. Links are valid for 7 days after purchase.",
          410
        );
      }
      return errorPage("Not found", "This download link is invalid or has been removed.", 404);
    }

    if (validation.contentMode === "external_link") {
      try {
        await convex.mutation(api.deliveries.useDownload, { token });
      } catch {
        // Download count already exceeded — still redirect
      }
      return NextResponse.redirect(validation.externalUrl);
    }

    if (validation.contentMode === "upload" && validation.signedUrl) {
      try {
        await convex.mutation(api.deliveries.useDownload, { token });
      } catch {
        // Download count already exceeded — still serve the file if URL is valid
      }
      return NextResponse.redirect(validation.signedUrl);
    }

    return errorPage("Unavailable", "The content for this product is no longer available.", 404);
  } catch (error) {
    console.error("Download error:", error);
    return errorPage("Something went wrong", "An unexpected error occurred. Please try again later.", 500);
  }
}
