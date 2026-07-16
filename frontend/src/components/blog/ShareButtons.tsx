"use client";

import { useState } from "react";

/** `url` is the full absolute URL — computed server-side from siteConfig.url so this works with JS-driven navigation and copy-link alike. */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { label: "Share on X", href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: "Share by email", href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}` },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be denied by browser permissions — the link is still visible/selectable, so this fails quietly.
    }
  }

  return (
    <div className="share-buttons">
      <span className="share-buttons__label">Share this article</span>
      <div className="share-buttons__row">
        {links.map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
            {link.label.replace("Share on ", "").replace("Share by ", "")}
          </a>
        ))}
        <button type="button" onClick={copyLink} aria-label="Copy link to this article">
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}
