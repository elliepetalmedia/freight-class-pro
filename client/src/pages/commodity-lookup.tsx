import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, Search, Calculator, ArrowRight, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useSEO } from "@/hooks/use-seo";
import commoditiesData from "@/data/commodities.json";

export default function CommodityLookup() {
    useSEO(
        "Commodity Freight Class Lookup - FreightClassPro",
        "Search typical freight classes and densities for over 50 common commodities including electronics, furniture, building materials, and more."
    );

    const [, setLocation] = useLocation();
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");

    // Extract unique categories
    const categories = useMemo(() => {
        const cats = new Set(commoditiesData.map(c => c.category!));
        return ["All Categories", ...Array.from(cats)].sort();
    }, []);

    // Filter items
    const filteredCommodities = useMemo(() => {
        return commoditiesData.filter(item => {
            const matchSearch = item.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.typicalClass.includes(searchTerm);
            const matchCategory = categoryFilter === "All Categories" || item.category === categoryFilter;
            return matchSearch && matchCategory;
        });
    }, [searchTerm, categoryFilter]);

    const navigateToCalculator = (densityStr: string) => {
        // Basic heuristic to populate calculator with roughly the right density 
        // Just pass empty dims and a fake weight so density calculates correctly,
        // OR just pass the user to the calculator blank and let them fill it in.
        // Spec: "Each row has a 'Calculate' link that pre-populates the calculator with typical dims"
        // We can just send them with a 100 lb box and adjusting dims to match the middle of the density range.

        // Parse density range "8-12" or "35+"
        const match = densityStr.match(/(\d+)/);
        const densityVal = match ? parseInt(match[1]) : 10;

        // Weight = density * volume. Let's assume Volume = 10 cu ft. So Weight = densityVal * 10
        // L=30, W=24, H=24 (10 cu ft)
        const l = "30";
        const w = "24";
        const h = "24";
        const wt = (densityVal * 10).toString();

        setLocation(`/?l=${l}&w=${w}&h=${h}&wt=${wt}&m=false&p=false`);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border py-4 md:py-6 bg-card/50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <a className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
                                <ChevronLeft className="h-5 w-5" />
                            </a>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Truck className="h-6 w-6 text-primary" />
                            <h1 className="text-xl md:text-2xl font-bold text-foreground">
                                Commodity Lookup
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                        <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                            Disclaimer: These are rough estimates based on typical density ranges. Actual freight class depends on your specific item's NMFC number, exact density, packaging, and handling requirements.
                        </p>
                    </div>

                    <Card>
                        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Commodity Database</CardTitle>
                                <CardDescription>Search standard freight classes for packaged goods.</CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search commodities..."
                                        className="pl-9 w-full sm:w-[250px]"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Commodity</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-center">Typical Class</TableHead>
                                            <TableHead className="text-center">Typical Density</TableHead>
                                            <TableHead className="min-w-[200px]">Notes</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCommodities.length > 0 ? (
                                            filteredCommodities.map((item, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell className="font-medium">{item.commodity}</TableCell>
                                                    <TableCell className="text-muted-foreground">{item.category}</TableCell>
                                                    <TableCell className="text-center font-mono font-bold text-primary">{item.typicalClass}</TableCell>
                                                    <TableCell className="text-center">{item.typicalDensity} PCF</TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">{item.notes || "-"}</TableCell>
                                                    <TableCell className="text-right">
                                                        <button
                                                            onClick={() => navigateToCalculator(item.typicalDensity)}
                                                            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                                                        >
                                                            Calculate <ArrowRight className="ml-1 h-3 w-3" />
                                                        </button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                    No commodities found matching your criteria.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
