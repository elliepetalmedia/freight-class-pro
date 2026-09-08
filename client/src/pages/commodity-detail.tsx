import { Link, useRoute, useLocation } from "wouter";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import commodities from "@/data/commodities.json";
import { commoditySlug } from "@/lib/slug";

function midpoint(density: string): number {
  const nums = (density.match(/(\d+(\.\d+)?)/g) || []).map(Number);
  if (nums.length >= 2) return (nums[0] + nums[1]) / 2;
  return nums[0] || 10;
}

export default function CommodityDetail() {
  const [, params] = useRoute("/commodity/:slug");
  const [, setLocation] = useLocation();
  const slug = params?.slug || "";
  const item = (commodities as any[]).find((c) => commoditySlug(c.commodity) === slug);

  useSEO(
    item
      ? `${item.commodity} Freight Class (Typical ${item.typicalClass}) | FreightClassPro`
      : "Commodity Not Found | FreightClassPro",
    item
      ? `Typical freight class ${item.typicalClass} at ${item.typicalDensity} PCF for ${item.commodity}. Estimate only — confirm with actual dims, NMFC, and carrier.`
      : "The requested commodity could not be found.",
    item
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: item.commodity,
          category: item.category,
          description: `Typical freight class ${item.typicalClass} at typical density ${item.typicalDensity} PCF. ${item.notes || ""} Estimate only; actual class depends on measured density, NMFC, packaging, and handling.`,
          brand: { "@type": "Brand", name: "FreightClassPro reference" },
        }
      : undefined,
    item ? { canonical: `https://freightclasspro.com/commodity/${slug}` } : { noindex: true }
  );

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <h1 className="text-2xl font-bold mb-4">Commodity not found</h1>
          <Link href="/commodity-lookup" className="text-primary hover:underline">
            Back to commodity lookup
          </Link>
        </div>
      </div>
    );
  }

  const mid = midpoint(item.typicalDensity);
  const wt = Math.round(mid * 10 * 100) / 100;

  const related = (commodities as any[])
    .filter((c) => c.category === item.category && c.commodity !== item.commodity)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-6 text-sm">
          <Link href="/" className="inline-flex items-center gap-1 text-primary hover:underline">
            <ChevronLeft className="h-4 w-4" /> Calculator
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/commodity-lookup" className="text-primary hover:underline">
            Commodity Lookup
          </Link>
        </div>

        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{item.category}</p>
        <h1 className="text-2xl md:text-3xl font-bold mb-3">{item.commodity} — Typical Freight Class</h1>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Typical class <strong className="text-foreground">{item.typicalClass}</strong> at{" "}
          <strong className="text-foreground">{item.typicalDensity} PCF</strong>. Estimate only.
          Actual class depends on your measured density, NMFC number, packaging, and handling.
          {item.notes ? ` Note: ${item.notes}.` : ""}
        </p>

        <Card className="border-border mb-6">
          <CardHeader>
            <CardTitle className="text-lg">What to do next</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setLocation(`/?l=30&w=24&h=24&wt=${wt}&m=false&p=false`)}
              className="flex-1"
            >
              Calculate with midpoint density <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/guides/how-to-calculate-freight-density">How density math works</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4 mb-8">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            “Calculate” pre-fills representative 30×24×24 in dims at the {mid} PCF midpoint. Replace
            with your real loaded pallet dims and total weight including the pallet.
          </p>
        </div>

        {related.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Related in {item.category}</h2>
            <div className="grid gap-2">
              {related.map((r: any) => (
                <Link
                  key={r.commodity}
                  href={`/commodity/${commoditySlug(r.commodity)}`}
                  className="flex items-center justify-between rounded-md border border-border px-4 py-3 hover:border-primary/40 transition-colors"
                >
                  <span className="text-sm font-medium">{r.commodity}</span>
                  <span className="text-xs font-mono text-primary">Class {r.typicalClass}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
