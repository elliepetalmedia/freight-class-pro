import { Link } from "wouter";
import { ChevronLeft, BookOpen, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSEO } from "@/hooks/use-seo";
import { GUIDES } from "@/data/guides";

export default function Guides() {
  useSEO(
    "Freight Shipping Guides — Density, Re-Class Fees, Pallets | FreightClassPro",
    "Practical LTL guides: how to calculate freight density (PCF), avoid re-classification fees, and choose pallet dimensions. Metric + imperial examples.",
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Freight Shipping Guides",
      description:
        "Practical LTL guides covering density calculation, re-classification fees, and pallet dimensions.",
      url: "https://freightclasspro.com/guides",
      publisher: {
        "@type": "Organization",
        name: "Ellie Petal Media",
        url: "https://freightclasspro.com",
      },
    }
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Calculator
        </Link>

        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Freight Shipping Guides</h1>
        </div>
        <p className="text-muted-foreground mb-8 leading-relaxed max-w-2xl">
          Short, quotable references for density math, re-class prevention, and pallet planning.
          Each guide gives the 30-second answer first, then worked examples in inches/lbs and cm/kg.
        </p>

        <div className="grid gap-4">
          {GUIDES.map((g) => (
            <Card key={g.slug} className="border-border hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  <Link href={`/guides/${g.slug}`} className="hover:text-primary transition-colors">
                    {g.title}
                  </Link>
                </CardTitle>
                <CardDescription>{g.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {g.readMinutes} min read · Updated {g.updated}
                </span>
                <Link
                  href={`/guides/${g.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Read guide <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          Start with the{" "}
          <Link href="/" className="text-primary hover:underline">
            LTL density calculator
          </Link>
          , then look up{" "}
          <Link href="/commodity-lookup" className="text-primary hover:underline">
            typical commodity classes
          </Link>{" "}
          or generate a{" "}
          <Link href="/bol-generator" className="text-primary hover:underline">
            BOL PDF
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
