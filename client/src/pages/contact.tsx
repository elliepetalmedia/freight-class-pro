import { Link } from "wouter";
import { ArrowLeft, Mail, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Contact() {
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

        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-8">
          Contact Us
        </h1>

        <div className="space-y-6">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Publisher</h2>
              </div>
              <p className="text-muted-foreground">Ellie Petal Media</p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Support Policy</h3>
            <p className="text-muted-foreground leading-relaxed">
              This tool is provided for estimation purposes only. Always confirm
              final classification with your specific carrier as rules for
              commodities (like hazardous materials) may vary.
            </p>
          </div>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Business Inquiries</h2>
              </div>
              <p className="text-muted-foreground mb-2">
                For advertising and legal matters, please contact:
              </p>
              <a
                href="mailto:legal@freightclasspro.com"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
                data-testid="link-email"
              >
                legal@freightclasspro.com
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
