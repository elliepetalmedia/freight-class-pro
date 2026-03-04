import { useEffect } from "react";

export function useSEO(title: string, description: string, jsonLd?: any) {
  useEffect(() => {
    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.getAttribute('content') || '';
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const originalOgTitle = ogTitle?.getAttribute('content') || '';
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const originalOgDescription = ogDescription?.getAttribute('content') || '';

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
      if (scriptTag && document.head.contains(scriptTag)) {
        document.head.removeChild(scriptTag);
      }
    };
  }, [title, description, jsonLd ? JSON.stringify(jsonLd) : null]);
}
