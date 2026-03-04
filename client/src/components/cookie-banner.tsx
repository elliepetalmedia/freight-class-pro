import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function CookieBanner() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Check if consent has already been given or denied
        const consent = localStorage.getItem("cookie_consent");
        if (!consent) {
            setShow(true);
        } else if (consent === "accepted") {
            loadAnalyticsAndAds();
        }
    }, []);

    const loadAnalyticsAndAds = () => {
        // Inject Google Analytics
        if (!document.getElementById("gtag-script")) {
            const script1 = document.createElement("script");
            script1.id = "gtag-script";
            script1.async = true;
            script1.src = "https://www.googletagmanager.com/gtag/js?id=G-Y7M5R8RY74";
            document.head.appendChild(script1);

            const script2 = document.createElement("script");
            script2.id = "gtag-init";
            script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-Y7M5R8RY74', {
          page_path: window.location.pathname,
        });
      `;
            document.head.appendChild(script2);
        }

        // Inject Google AdSense
        if (!document.getElementById("adsense-script")) {
            const adsScript = document.createElement("script");
            adsScript.id = "adsense-script";
            adsScript.async = true;
            adsScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3332146221484772";
            adsScript.crossOrigin = "anonymous";
            document.head.appendChild(adsScript);
        }
    };

    const handleAccept = () => {
        localStorage.setItem("cookie_consent", "accepted");
        setShow(false);
        loadAnalyticsAndAds();
    };

    const handleDecline = () => {
        localStorage.setItem("cookie_consent", "declined");
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.1)] transition-transform duration-300 ease-in-out p-4 md:p-6" data-testid="cookie-banner">
            <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 pr-4">
                    <p className="text-sm md:text-base text-foreground">
                        We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        <a href="/privacy" className="underline hover:text-primary transition-colors">Read our Privacy Policy</a> to learn more about how we process your data.
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                    <button
                        onClick={handleDecline}
                        className="flex-1 md:flex-none whitespace-nowrap px-4 py-2 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        className="flex-1 md:flex-none whitespace-nowrap px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        Accept All
                    </button>
                    <button
                        onClick={() => setShow(false)}
                        className="md:hidden ml-2 p-2 text-muted-foreground hover:bg-secondary rounded-md"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
