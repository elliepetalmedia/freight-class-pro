import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
          data-testid="link-back-home"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Calculator
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-7 w-7 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Privacy Policy
          </h1>
        </div>

        <p className="text-muted-foreground text-sm mb-8">
          <strong>Last Updated:</strong> 2025
        </p>

        <div className="space-y-8">
          <p className="text-foreground leading-relaxed">
            This Privacy Policy applies to FreightClassPro.com, published by
            Ellie Petal Media.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              1. Client-Side Calculation
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              All density calculations happen locally in your web browser. We do
              not store your shipment dimensions, weights, or business data on
              our servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              2. Cookies
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may use cookies to ensure the website functions correctly (e.g.,
              remembering your preference for Inches vs. CM). By using this site,
              you consent to the use of cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              3. Local Storage
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              FreightClassPro uses your browser's local storage to save your unit
              preference and the last values you entered. This data never leaves
              your device and is not transmitted to any server.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              4. Contact
            </h2>
            <p className="text-muted-foreground">
              <a
                href="mailto:legal@freightclasspro.com"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                legal@freightclasspro.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
