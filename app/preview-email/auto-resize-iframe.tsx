"use client";

import { useEffect, useRef, useState } from "react";

export function AutoResizeIframe({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(800);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const resize = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        const h = doc.body.scrollHeight;
        if (h > 0) setHeight(h + 16);
      } catch {
        // cross-origin — skip
      }
    };

    iframe.addEventListener("load", resize);
    const timer = setTimeout(resize, 500);
    return () => {
      iframe.removeEventListener("load", resize);
      clearTimeout(timer);
    };
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={html}
      style={{
        width: "100%",
        maxWidth: 600,
        height,
        border: 0,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        background: "#fff",
      }}
    />
  );
}