import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

export default function Privacy() {
  useSEO(
    "Privacy Policy | FreightClassPro",
    "Read the Privacy Policy for FreightClassPro. Learn how our 100% client-side calculator protects your data."
  );

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
          <strong>Last Updated:</strong> March 2026
        </p>

        <div className="space-y-8">
          <p className="text-foreground leading-relaxed">
            This Privacy Policy applies to FreightClassPro.com, published by Ellie Petal Media.
            We respect your privacy and are committed to protecting it through our compliance with this policy.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Personal Information:</strong> We do not ask for, collect, or store any personal data
              such as names, emails, or phone numbers unless you voluntarily provide it by contacting us directly.
              <br /><br />
              <strong>Technical Information:</strong> When you use our calculator, the dimensions and weights
              are processed entirely within your local browser. We do not transmit this logistics data to our servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. How We Collect Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information in two ways:
              <br />- Directly from you when you contact us via email.
              <br />- Automatically as you navigate through the site via cookies and tracking technologies (e.g., Google Analytics), strictly subject to your given consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. How We Use Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              The limited technical data collected via analytics is used solely to:
              <br />- Understand how our tools are used.
              <br />- Improve website performance and functionality.
              <br />- Display relevant advertisements via third-party ad networks.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Sharing Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              Because we do not collect personal business data, we do not sell or rent it. We may share anonymous aggregated usage data with
              third-party service providers (like analytics or advertising partners) who assist us in operating our website.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Third-Party Links & Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our website uses Google AdSense to serve ads and Google Analytics to monitor traffic. These third-party services may use cookies
              or web beacons to collect data about your activities. Their privacy practices are governed by their respective privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We have implemented measures designed to secure your connection via standard HTTPS encryption.
              Additionally, our core calculator tools run 100% client-side, eliminating the risk of data interception during calculation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              User preferences (like cm vs inches) are stored in your local browser storage (localStorage) indefinitely until you clear your browser cache.
              We do not retain any logs of the actual freight dimensions entered into the calculator.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our website is intended for B2B logistics professionals and is not directed at children under 16. We do not knowingly collect personal information from children under 16.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Your Privacy Rights (GDPR)</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are located in the European Economic Area (EEA), you have the right to:
              <br />- Withdraw your cookie consent at any time.
              <br />- Request access to any personal data we may hold (though we hold none by default).
              <br />- Request deletion of your data.
              <br />To exercise these rights regarding third-party cookies, please clear your browser cookies or use our consent banner settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. California Privacy Rights (CCPA)</h2>
            <p className="text-muted-foreground leading-relaxed">
              Under the CCPA, California residents have the right to know what personal data is being collected and the right to opt-out of the "sale" of their personal information.
              FreightClassPro does not "sell" personal information as defined by the CCPA. You may opt out of customized advertising cookies via the consent banner.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              FreightClassPro is hosted in the United States. If you are accessing the website from the EU or other regions, please be aware that
              non-personal analytics data may be transferred to and processed in the United States.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">12. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">13. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
              <br /><br />
              <a href="mailto:legal@freightclasspro.com" className="text-primary hover:text-primary/80 transition-colors font-medium">
                legal@freightclasspro.com
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
