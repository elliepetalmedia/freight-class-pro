import { Link, useRoute } from "wouter";
import { ChevronLeft, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSEO } from "@/hooks/use-seo";
import { getGuide } from "@/data/guides";

export default function GuideDetail() {
  const [, params] = useRoute("/guides/:slug");
  const guide = params ? getGuide(params.slug) : undefined;

  useSEO(
    guide ? `${guide.title} | FreightClassPro` : "Guide Not Found | FreightClassPro",
    guide ? guide.description : "The requested freight guide could not be found.",
    guide
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.title,
          description: guide.description,
          datePublished: "2026-03-04",
          dateModified: guide.updated,
          author: {
            "@type": "Organization",
            name: "Ellie Petal Media",
            url: "https://freightclasspro.com",
          },
          publisher: {
            "@type": "Organization",
            name: "Ellie Petal Media",
            url: "https://freightclasspro.com",
          },
          mainEntityOfPage: `https://freightclasspro.com/guides/${guide.slug}`,
        }
      : undefined,
    guide ? { canonical: `https://freightclasspro.com/guides/${guide.slug}` } : { noindex: true }
  );

  if (!guide) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <h1 className="text-2xl font-bold mb-4">Guide not found</h1>
          <p className="text-muted-foreground mb-6">The guide you requested doesn’t exist.</p>
          <Link href="/guides" className="text-primary hover:underline">
            Back to all guides
          </Link>
        </div>
      </div>
    );
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-6 text-sm">
          <Link href="/" className="inline-flex items-center gap-1 text-primary hover:underline">
            <ChevronLeft className="h-4 w-4" /> Calculator
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/guides" className="text-primary hover:underline">
            Guides
          </Link>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-3">{guide.title}</h1>
        <p className="text-sm text-muted-foreground mb-6 inline-flex items-center gap-2">
          <Clock className="h-3 w-3" /> {guide.readMinutes} min read · Updated {guide.updated} · Ellie Petal Media
        </p>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mb-8">
          <p className="text-sm leading-relaxed">
            <strong>Bottom line:</strong> {guide.sections[0]?.body[0]}
          </p>
        </div>

        <div className="space-y-8">
          {guide.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl font-semibold mb-3">{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed mb-3">
                  {p}
                </p>
              ))}
              {s.list && (
                <ul className="list-disc list-inside space-y-2 ml-2 text-muted-foreground">
                  {s.list.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <Card className="mt-10 border-border">
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-lg font-semibold">Quick answers</h2>
            {guide.faqs.map((f) => (
              <div key={f.q}>
                <p className="font-medium">{f.q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-wrap gap-3">
          {guide.related.map((r) => (
            <Link
              key={r.href + r.label}
              href={r.href}
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline border border-border rounded-md px-3 py-2"
            >
              {r.label} <ArrowRight className="h-3 w-3" />
            </Link>
          ))}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </div>
  );
}
