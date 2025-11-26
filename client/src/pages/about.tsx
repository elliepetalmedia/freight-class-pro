import { Link } from "wouter";
import { ArrowLeft, Truck } from "lucide-react";

export default function About() {
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

        <div className="flex items-center gap-3 mb-8">
          <Truck className="h-8 w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            About FreightClassPro
          </h1>
        </div>

        <div className="space-y-6 text-foreground">
          <p className="leading-relaxed">
            FreightClassPro.com is a digital utility project published by{" "}
            <strong>Ellie Petal Media</strong>.
          </p>

          <p className="leading-relaxed">
            We built this tool for warehouse managers, logistics coordinators,
            and small business owners who need quick, accurate estimates without
            navigating complex carrier login portals. Our calculator uses the
            standard density formulas provided by the NMFTA to give you the most
            likely classification for your LTL shipments.
          </p>

          <div className="border-t border-border pt-6 mt-8">
            <h2 className="text-lg font-semibold mb-4">Why Use FreightClassPro?</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">1.</span>
                <span>Instant calculations without creating an account</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">2.</span>
                <span>Works on desktop and mobile for warehouse use</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">3.</span>
                <span>Supports both Imperial and Metric units</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">4.</span>
                <span>Remembers your preferences for faster repeat calculations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
