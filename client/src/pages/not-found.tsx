import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSEO } from "@/hooks/use-seo";

export default function NotFound() {
  useSEO(
    "Page Not Found | FreightClassPro",
    "The page you requested could not be found. Try the LTL density calculator, guides, or commodity lookup.",
    undefined,
    { noindex: true }
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 border-border">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">404 — Page not found</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            The link may be old or mistyped. These always work:
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/" className="text-primary hover:underline">
                LTL Density Calculator
              </Link>
            </li>
            <li>
              <Link href="/guides" className="text-primary hover:underline">
                Freight Shipping Guides
              </Link>
            </li>
            <li>
              <Link href="/commodity-lookup" className="text-primary hover:underline">
                Commodity Lookup
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-primary hover:underline">
                FAQ
              </Link>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
