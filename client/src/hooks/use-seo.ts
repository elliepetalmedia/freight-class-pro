import { useEffect } from "react";

export interface SEOOptions {
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

function upsertMeta(attr: "name" | "property", key: string, content: string): HTMLMetaElement {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return el;
}

function upsertCanonical(href: string): HTMLLinkElement {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
  return el;
}

export function useSEO(title: string, description: string, jsonLd?: any, options?: SEOOptions) {
  useEffect(() => {
    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.getAttribute('content') || '';
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const originalOgTitle = ogTitle?.getAttribute('content') || '';
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const originalOgDescription = ogDescription?.getAttribute('content') || '';
    const canonicalEl = document.querySelector('link[rel="canonical"]');
    const originalCanonical = canonicalEl?.getAttribute('href') || '';
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const originalOgUrl = ogUrl?.getAttribute('content') || '';
    const robotsEl = document.querySelector('meta[name="robots"]');
    const originalRobots = robotsEl?.getAttribute('content') || '';

    // Canonical defaults to the current pathname (query stripped) on the production origin.
    // In dev/preview this still yields a correct path; prerender captures the production URL
    // because prerender.js injects the per-route canonical after load (see prerender.js).
    const derivedPath = window.location.pathname === "/" ? "/" : window.location.pathname.replace(/\/$/, "");
    const canonical = options?.canonical || `https://freightclasspro.com${derivedPath === "/" ? "/" : derivedPath}`;
    const ogImage = options?.ogImage || "https://freightclasspro.com/og-image.png";

    document.title = title;

    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }
    if (ogDescription) {
      ogDescription.setAttribute('content', description);
    }
    upsertCanonical(canonical);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", ogImage);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", ogImage);
    if (options?.noindex) {
      upsertMeta("name", "robots", "noindex, nofollow");
    }

    let scriptTag: HTMLScriptElement | null = null;
    if (jsonLd) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.text = JSON.stringify(jsonLd);
      document.head.appendChild(scriptTag);
    }

    return () => {
      document.title = originalTitle;
      if (metaDescription) {
        metaDescription.setAttribute('content', originalDescription);
      }
      if (ogTitle) {
        ogTitle.setAttribute('content', originalOgTitle);
      }
      if (ogDescription) {
        ogDescription.setAttribute('content', originalOgDescription);
      }
      if (canonicalEl) {
        canonicalEl.setAttribute('href', originalCanonical);
      }
      if (ogUrl) {
        ogUrl.setAttribute('content', originalOgUrl);
      } else {
        document.querySelector('meta[property="og:url"]')?.remove();
      }
      if (robotsEl) {
        robotsEl.setAttribute('content', originalRobots);
      } else {
        document.querySelector('meta[name="robots"]')?.remove();
      }
      if (scriptTag && document.head.contains(scriptTag)) {
        document.head.removeChild(scriptTag);
      }
    };
  }, [title, description, jsonLd ? JSON.stringify(jsonLd) : null, options?.canonical, options?.ogImage, options?.noindex]);
}
