import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ChevronLeft, Package, LayoutGrid, AlertCircle, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSEO } from "@/hooks/use-seo";

export default function PalletOptimizer() {
    useSEO(
        "Pallet Optimizer & Box Calculator - FreightClassPro",
        "Calculate how many boxes fit on a standard or custom pallet. Optimize your freight and use our 2D layer bin-packing algorithm to save on shipping costs."
    );

    const [palletType, setPalletType] = useState("Standard (48x40)");
    const [palletL, setPalletL] = useState("48");
    const [palletW, setPalletW] = useState("40");
    const [maxHeight, setMaxHeight] = useState("96"); // Standard max height for LTL is usually 96"
    const [maxWeight, setMaxWeight] = useState("4000");

    const [boxL, setBoxL] = useState("");
    const [boxW, setBoxW] = useState("");
    const [boxH, setBoxH] = useState("");
    const [boxWeight, setBoxWeight] = useState("");
    const [allowRotate, setAllowRotate] = useState(true);

    // Auto-fill standard pallet dims
    const handlePalletTypeChange = (val: string) => {
        setPalletType(val);
        if (val === "Standard (48x40)") {
            setPalletL("48");
            setPalletW("40");
        } else if (val === "GMA (48x40)") {
            setPalletL("48");
            setPalletW("40");
        } else if (val === "Square (48x48)") {
            setPalletL("48");
            setPalletW("48");
        } else if (val === "EUR (31.5x47.2)") {
            setPalletL("47.2");
            setPalletW("31.5");
        }
    };

    const result = useMemo(() => {
        const pL = parseFloat(palletL);
        const pW = parseFloat(palletW);
        const pMaxH = parseFloat(maxHeight);
        const pMaxWt = parseFloat(maxWeight);

        const bL = parseFloat(boxL);
        const bW = parseFloat(boxW);
        const bH = parseFloat(boxH);
        const bWt = parseFloat(boxWeight) || 0;

        if (!pL || !pW || !pMaxH || !bL || !bW || !bH) return null;

        // We do a simple 2D layer packing constraint
        // Orientation 1: Box L along Pallet L, Box W along Pallet W
        const fit1_L = Math.floor(pL / bL);
        const fit1_W = Math.floor(pW / bW);
        const boxesPerLayer1 = fit1_L * fit1_W;

        // Orientation 2: Box L along Pallet W, Box W along Pallet L
        const fit2_L = Math.floor(pL / bW);
        const fit2_W = Math.floor(pW / bL);
        const boxesPerLayer2 = allowRotate ? (fit2_L * fit2_W) : 0;

        // Which orientation is better?
        let bestBoxesPerLayer = boxesPerLayer1;
        let orientation = 1;

        if (boxesPerLayer2 > boxesPerLayer1) {
            bestBoxesPerLayer = boxesPerLayer2;
            orientation = 2;
        }

        if (bestBoxesPerLayer === 0) return { error: "Box dimensions are larger than pallet dimensions!" };

        // Height limit (assume wood pallet is ~6 inches tall)
        const availableHeightStr = pMaxH - 6;
        const maxLayers = Math.floor(availableHeightStr / bH);

        if (maxLayers <= 0) return { error: "Box height exceeds maximum allowed height." };

        let totalBoxes = bestBoxesPerLayer * maxLayers;
        let totalPayloadWt = totalBoxes * bWt;
        let totalGrossWt = totalPayloadWt + 45; // Assume 45lb wooden pallet

        // Weight Limit check
        let limitedByWeight = false;
        if (pMaxWt && totalGrossWt > pMaxWt) {
            limitedByWeight = true;
            // Recalculate based on weight limit
            const maxPayload = pMaxWt - 45;
            const absoluteMaxBoxes = Math.floor(maxPayload / bWt);
            if (absoluteMaxBoxes < totalBoxes) {
                totalBoxes = absoluteMaxBoxes;
                totalPayloadWt = totalBoxes * bWt;
                totalGrossWt = totalPayloadWt + 45;
            }
        }

        const actualLayers = Math.ceil(totalBoxes / bestBoxesPerLayer);
        const dimsGrossL = pL;
        const dimsGrossW = pW;
        const dimsGrossH = (actualLayers * bH) + 6;

        // Pallet visualizer array 
        // We can generate a simple representation of the top layer
        const layerCols = orientation === 1 ? fit1_L : fit2_L;
        const layerRows = orientation === 1 ? fit1_W : fit2_W;
        const boxVisualW = orientation === 1 ? (bL / pL) * 100 : (bW / pL) * 100;
        const boxVisualH = orientation === 1 ? (bW / pW) * 100 : (bL / pW) * 100;

        return {
            totalBoxes,
            bestBoxesPerLayer,
            maxLayers,
            actualLayers,
            totalPayloadWt,
            totalGrossWt,
            dimsGrossL, dimsGrossW, dimsGrossH,
            orientation,
            limitedByWeight,
            layerCols, layerRows,
            boxVisualW, boxVisualH,
            topLayerBoxes: Math.min(bestBoxesPerLayer, totalBoxes - ((actualLayers - 1) * bestBoxesPerLayer)) // How many boxes on the top (partial) layer
        };

    }, [palletL, palletW, maxHeight, maxWeight, boxL, boxW, boxH, boxWeight, allowRotate]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border py-4 md:py-6 bg-card/50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <a className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 w-10">
                                <ChevronLeft className="h-5 w-5" />
                            </a>
                        </Link>
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="h-6 w-6 text-primary" />
                            <h1 className="text-xl md:text-2xl font-bold text-foreground">
                                Pallet Optimizer
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6 bg-secondary/30 border border-border rounded-lg p-5 flex items-start gap-4">
                        <AlertCircle className="h-6 w-6 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="text-sm text-muted-foreground leading-relaxed">
                            <span className="font-semibold text-foreground">How it works:</span> Enter your box dimensions to calculate how many fit on a pallet. This tool uses a layer-based 2D bin packing algorithm, assuming all boxes are identical and placed upright (height is preserved).
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Input Form */}
                        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Package className="h-5 w-5" /> Box Dimensions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-2">
                                            <Label>Length (in)</Label>
                                            <Input type="number" min="1" step="0.1" value={boxL} onChange={e => setBoxL(e.target.value)} placeholder="0" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Width (in)</Label>
                                            <Input type="number" min="1" step="0.1" value={boxW} onChange={e => setBoxW(e.target.value)} placeholder="0" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Height (in)</Label>
                                            <Input type="number" min="1" step="0.1" value={boxH} onChange={e => setBoxH(e.target.value)} placeholder="0" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Weight/Box (lbs)</Label>
                                            <Input type="number" min="0" step="0.1" value={boxWeight} onChange={e => setBoxWeight(e.target.value)} placeholder="Opt" />
                                        </div>
                                        <div className="flex items-end pb-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="rotate" checked={allowRotate} onCheckedChange={(c) => setAllowRotate(!!c)} />
                                                <Label htmlFor="rotate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                    Allow Rotation
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <LayoutGrid className="h-5 w-5" /> Pallet Constraints
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Pallet Size</Label>
                                        <Select value={palletType} onValueChange={handlePalletTypeChange}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Standard (48x40)">Standard / GMA (48×40)</SelectItem>
                                                <SelectItem value="Square (48x48)">Square (48×48)</SelectItem>
                                                <SelectItem value="EUR (31.5x47.2)">Euro (31.5×47.2)</SelectItem>
                                                <SelectItem value="Custom">Custom Size...</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {palletType === "Custom" && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label>Pallet Length (in)</Label>
                                                <Input type="number" value={palletL} onChange={e => setPalletL(e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Pallet Width (in)</Label>
                                                <Input type="number" value={palletW} onChange={e => setPalletW(e.target.value)} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Max Height (in)</Label>
                                            <Input type="number" value={maxHeight} onChange={e => setMaxHeight(e.target.value)} placeholder="96" />
                                            <p className="text-xs text-muted-foreground mt-1">LTL standard is 96"</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Max Weight (lbs)</Label>
                                            <Input type="number" value={maxWeight} onChange={e => setMaxWeight(e.target.value)} placeholder="4000" />
                                            <p className="text-xs text-muted-foreground mt-1">Pallet included</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="bg-primary/5 rounded-lg border-2 border-primary/20 p-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full" />
                                <h3 className="font-semibold text-primary flex items-center gap-2 mb-2">
                                    <ArrowRight className="h-4 w-4" /> Next Step
                                </h3>
                                <p className="text-sm text-balance text-muted-foreground mb-3">
                                    Once you know your loaded pallet's dimensions and weight, calculate its true LTL freight class.
                                </p>
                                <Link href="/">
                                    <a className="inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
                                        Go to Freight Calculator
                                    </a>
                                </Link>
                            </div>
                        </div>

                        {/* Results Output */}
                        <div className="lg:col-span-7 xl:col-span-8">
                            {!result ? (
                                <div className="h-full min-h-[400px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center p-8 text-center bg-secondary/10">
                                    <LayoutGrid className="h-16 w-16 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-lg font-medium text-muted-foreground mb-2">Ready to Optimize</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm">
                                        Enter your box dimensions on the left to instantly see how many boxes will fit on your pallet configuration.
                                    </p>
                                </div>
                            ) : result.error ? (
                                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-lg font-medium">
                                    {result.error}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* KPI Cards */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="optimizer-kpis">
                                        <Card className="bg-primary/5 border-primary/20">
                                            <CardContent className="p-4 md:p-6 text-center">
                                                <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider mb-1">Total Boxes</p>
                                                <p className="text-3xl md:text-4xl font-bold font-mono text-primary">{result.totalBoxes}</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-4 md:p-6 text-center">
                                                <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider mb-1">Boxes per Layer</p>
                                                <p className="text-2xl md:text-3xl font-bold font-mono py-1">{result.bestBoxesPerLayer}</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-4 md:p-6 text-center">
                                                <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider mb-1">Total Layers</p>
                                                <p className="text-2xl md:text-3xl font-bold font-mono py-1">{result.actualLayers} <span className="text-sm font-normal text-muted-foreground">/ {result.maxLayers}</span></p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-4 md:p-6 text-center">
                                                <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider mb-1">Gross Weight</p>
                                                <p className="text-2xl md:text-3xl font-bold font-mono py-1">
                                                    {(result.totalGrossWt ?? 0) > 0 ? (
                                                        <>{(result.totalGrossWt ?? 0).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">lbs</span></>
                                                    ) : "-"}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {result.limitedByWeight && (
                                        <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 px-4 py-3 rounded-md text-sm font-medium flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            Pallet limited by maximum weight constraint rather than physical dimensions.
                                        </div>
                                    )}

                                    {/* Visualizer & Final Dims */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="border-border">
                                            <CardHeader className="pb-3 bg-secondary/20">
                                                <CardTitle className="text-sm">Loaded Pallet Dimensions</CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-4 space-y-4">
                                                <div className="flex justify-between items-center border-b pb-2">
                                                    <span className="text-muted-foreground">Total Length</span>
                                                    <span className="font-mono font-medium">{result.dimsGrossL}"</span>
                                                </div>
                                                <div className="flex justify-between items-center border-b pb-2">
                                                    <span className="text-muted-foreground">Total Width</span>
                                                    <span className="font-mono font-medium">{result.dimsGrossW}"</span>
                                                </div>
                                                <div className="flex justify-between items-center pb-2">
                                                    <span className="text-muted-foreground">Total Height (incl. pallet)</span>
                                                    <span className="font-mono font-medium">{result.dimsGrossH}"</span>
                                                </div>

                                                <div className="bg-secondary/30 rounded p-3 mt-4">
                                                    <p className="text-xs text-center text-muted-foreground">
                                                        Use these dimensions in the main calculator to find your exact Freight Class.
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-border">
                                            <CardHeader className="pb-3 bg-secondary/20 flex flex-row items-center justify-between">
                                                <CardTitle className="text-sm">Layer Blueprint</CardTitle>
                                                <span className="text-xs font-mono bg-background px-2 py-0.5 rounded border">
                                                    {result.orientation === 1 ? 'Standard' : 'Rotated 90°'}
                                                </span>
                                            </CardHeader>
                                            <CardContent className="pt-4 flex flex-col items-center justify-center">
                                                <div className="relative w-full max-w-[240px] aspect-square bg-amber-100 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 rounded-sm mb-2 p-1">
                                                    <div className="w-full h-full relative" style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: `repeat(${result.layerCols}, 1fr)`,
                                                        gridTemplateRows: `repeat(${result.layerRows}, 1fr)`,
                                                        gap: '2px'
                                                    }}>
                                                        {Array.from({ length: result.topLayerBoxes ?? 0 }).map((_, i) => (
                                                            <div key={i} className="bg-primary/40 border border-primary/60 rounded-sm" />
                                                        ))}
                                                        {/* Empty space filler for partial top layers */}
                                                        {Array.from({ length: (result.bestBoxesPerLayer ?? 0) - (result.topLayerBoxes ?? 0) }).map((_, i) => (
                                                            <div key={`empty-${i}`} className="bg-background/20 border border-dashed border-foreground/10 rounded-sm" />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground text-center">Top View (Not exactly to scale)</p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
