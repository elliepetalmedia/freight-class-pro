import { Link } from "wouter";
import { ArrowLeft, Truck, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO } from "@/hooks/use-seo";

export default function FAQ() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I use the calculator?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Select your units, enter dimensions (length, width, height) and weight. Check palletized if applicable. The calculator automatically displays your density (PCF), volume, and freight class."
        }
      },
      {
        "@type": "Question",
        "name": "What are Quick Templates?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Quick Templates are pre-configured dimension and weight values for common commodity types like Electronics, Furniture, Machinery, and Textiles designed for faster entry."
        }
      },
      {
        "@type": "Question",
        "name": "How do I calculate multiple loads?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Calculate a load, then click 'Save to Multi-Load'. Give it a name, repeat for additional loads, and view all saved loads in the section below the calculator."
        }
      },
      {
        "@type": "Question",
        "name": "How do I export a PDF?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "For single loads, click 'Download PDF' after calculating. For multiple loads, save them to Multi-Load first, then click 'Export All' for a consolidated report."
        }
      },
      {
        "@type": "Question",
        "name": "What information is included in the PDF?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The PDF includes a header, file name, date/time, 'Prepared By' name, shipment details (dimensions/weight), and the calculated density, volume, and freight class."
        }
      },
      {
        "@type": "Question",
        "name": "What is the NMFC density-based classification?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The National Motor Freight Classification (NMFC) system assigns freight classes based on density (pounds per cubic foot). There are 13 tiers ranging from Class 400 (less than 1 PCF) to Class 50 (50+ PCF)."
        }
      },
      {
        "@type": "Question",
        "name": "Is my data saved or uploaded anywhere?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. FreightClassPro is 100% client-side. All calculations happen in your browser and your data never leaves your device."
        }
      },
      {
        "@type": "Question",
        "name": "Are there any keyboard shortcuts for the calculator?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Press Ctrl + Enter to quickly save your current calculation to the Multi-Load list. Press Ctrl + Shift + P to rapidly generate a PDF of your current load."
        }
      },
      {
        "@type": "Question",
        "name": "What additional tools do you offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer a suite of free tools for freight operations: a Commodity Lookup to find standard estimated classes, a 2D Pallet Optimizer to calculate maximum load density, and an interactive BOL Generator linked directly from your calculator results."
        }
      }
    ]
  };

  useSEO(
    "Frequently Asked Questions | FreightClassPro",
    "Get answers to common questions about calculating LTL freight classes, NMFC density guidelines, and using the FreightClassPro calculator.",
    faqSchema
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

        <div className="flex items-center gap-3 mb-8">
          <Truck className="h-8 w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Frequently Asked Questions
          </h1>
        </div>

        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="h-5 w-5 text-primary" />
                How do I use the calculator?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Using FreightClassPro is simple:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li><strong>Select your units</strong> - Choose between Imperial (inches/lbs) or Metric (cm/kg) using the toggle at the top.</li>
                <li><strong>Enter dimensions</strong> - Input the Length, Width, and Height of your shipment. You can type directly or use the +/- buttons.</li>
                <li><strong>Enter weight</strong> - Input the total weight of your shipment.</li>
                <li><strong>Check palletized</strong> - If your shipment is on a standard pallet (48" x 40"), toggle this on for adjusted calculations.</li>
                <li><strong>View results</strong> - The calculator automatically displays your density (PCF), volume, and freight class.</li>
              </ol>
              <p className="text-sm">Your inputs are automatically saved in your browser, so you can pick up where you left off next time.</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="h-5 w-5 text-primary" />
                What are Quick Templates?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Quick Templates are pre-configured dimension and weight values for common commodity types:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Electronics (Typical)</strong> - 24" x 18" x 12", 45 lbs</li>
                <li><strong>Furniture (Couch)</strong> - 96" x 36" x 40", 150 lbs</li>
                <li><strong>Machinery</strong> - 36" x 24" x 30", 200 lbs</li>
                <li><strong>Textiles (Bolts)</strong> - 60" x 48" x 48", 800 lbs</li>
              </ul>
              <p>Click the "Templates" button and select a template to instantly populate the calculator with those values.</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="h-5 w-5 text-primary" />
                How do I calculate multiple loads?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>The Multi-Load feature lets you save and track multiple shipment calculations:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li><strong>Calculate a load</strong> - Enter dimensions and weight as normal.</li>
                <li><strong>Save to Multi-Load</strong> - Click the "Save to Multi-Load" button that appears after calculation.</li>
                <li><strong>Name your load</strong> - Give it a descriptive name (optional) like "Pallet 1" or "Order #12345".</li>
                <li><strong>Repeat</strong> - Enter new values and save additional loads.</li>
                <li><strong>View saved loads</strong> - All saved loads appear in the "Saved Loads" section below the calculator.</li>
              </ol>
              <p>You can remove individual loads or clear all loads at any time.</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="h-5 w-5 text-primary" />
                How do I export a PDF?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>There are two ways to export PDF reports:</p>

              <div className="space-y-3">
                <div>
                  <p className="font-medium text-foreground">Single Load PDF:</p>
                  <p>After calculating a load, click "Download PDF". Enter a file name and click Download. The PDF will be saved to your device.</p>
                </div>

                <div>
                  <p className="font-medium text-foreground">Multi-Load PDF:</p>
                  <p>After saving multiple loads, click "Export All" in the Saved Loads section. This creates a consolidated report with all your saved calculations.</p>
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-md bg-secondary/30 border border-border">
                <p className="text-sm font-medium text-foreground">Pro Tips:</p>
                <ul className="text-sm space-y-1 ml-2">
                  <li>• The file name you enter will be displayed prominently in the PDF (in uppercase). Use this to reference purchase orders, internal tracking numbers, or shipment IDs.</li>
                  <li>• Fill in the "Prepared By" field next to Templates to include your name or company on the PDF.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="h-5 w-5 text-primary" />
                What information is included in the PDF?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Each PDF report includes:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Header</strong> - FreightClassPro branding and report title</li>
                <li><strong>File Name</strong> - The name you entered (displayed in uppercase) for easy reference to your internal tracking</li>
                <li><strong>Date & Time</strong> - When the report was generated</li>
                <li><strong>Prepared By</strong> - Your name or company (if entered)</li>
                <li><strong>Shipment Details</strong> - Length, Width, Height, Weight, and Palletized status</li>
                <li><strong>Results</strong> - Calculated Density (PCF), Volume (cubic feet), and Freight Class</li>
                <li><strong>Disclaimer</strong> - Note that results are based on NMFC standards for informational purposes</li>
              </ul>
              <p>Multi-load reports include all of the above for each saved load, organized in a clear, printable format.</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="h-5 w-5 text-primary" />
                What is the NMFC density-based classification?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>The National Motor Freight Classification (NMFC) system assigns freight classes based on density (pounds per cubic foot). FreightClassPro uses the 13-tier density-based system:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                <li>Less than 1 PCF = Class 400</li>
                <li>1 to less than 2 PCF = Class 300</li>
                <li>2 to less than 4 PCF = Class 250</li>
                <li>4 to less than 6 PCF = Class 175</li>
                <li>6 to less than 8 PCF = Class 125</li>
                <li>8 to less than 10 PCF = Class 100</li>
                <li>10 to less than 12 PCF = Class 92.5</li>
                <li>12 to less than 15 PCF = Class 85</li>
                <li>15 to less than 22.5 PCF = Class 70</li>
                <li>22.5 to less than 30 PCF = Class 65</li>
                <li>30 to less than 35 PCF = Class 60</li>
                <li>35 to less than 50 PCF = Class 55</li>
                <li>50+ PCF = Class 50</li>
              </ul>
              <p className="text-sm mt-3">Lower classes (like 50) indicate denser, easier-to-ship freight and typically have lower shipping rates. Higher classes indicate lighter, bulkier items that cost more to ship.</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="h-5 w-5 text-primary" />
                Is my data saved or uploaded anywhere?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p><strong>No.</strong> FreightClassPro is 100% client-side. All calculations happen in your browser.</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Your input data never leaves your device</li>
                <li>No account or login required</li>
                <li>Preferences are stored locally in your browser (localStorage)</li>
                <li>PDFs are generated entirely on your device</li>
              </ul>
              <p className="text-sm">This means your shipment data stays private and you can use the tool offline once the page has loaded.</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="h-5 w-5 text-primary" />
                Are there any keyboard shortcuts for the calculator?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Yes, we offer several power-user shortcuts to speed up your workflow:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">Ctrl</kbd> + <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">Enter</kbd> to quickly save your current calculation to the Multi-Load list.</li>
                <li><kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">Ctrl</kbd> + <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">Shift</kbd> + <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">P</kbd> to rapidly open the PDF generation dialog for your current load.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="h-5 w-5 text-primary" />
                What additional tools do you offer?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Alongside the LTL Density Calculator, we offer a suite of complementary logistics tools accessible via the site Navigation Menu:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><Link href="/commodity-lookup" className="text-primary hover:underline font-medium">Commodity Lookup</Link> - Find standard estimated freight classes and typical densities for over 50 specific commodity categories.</li>
                <li><Link href="/pallet-optimizer" className="text-primary hover:underline font-medium">Pallet Optimizer</Link> - A 2D-layer visual bin packing tool calculating the maximum boxes that fit safely on different pallet dimensions.</li>
                <li><Link href="/bol-generator" className="text-primary hover:underline font-medium">BOL Generator</Link> - An interactive straight Bill of Lading generator that directly incorporates your calculator results and saved multi-loads into an industry-standard PDF document.</li>
              </ul>
            </CardContent>
          </Card>

        </div>

        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            Have more questions?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
