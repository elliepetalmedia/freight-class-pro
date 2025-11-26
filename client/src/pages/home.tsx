import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";
import { RotateCcw, Truck, Package, Calculator, Scale } from "lucide-react";

const STORAGE_KEY = "freightClassPro";

interface CalculatorInputs {
  length: string;
  width: string;
  height: string;
  weight: string;
  useMetric: boolean;
  palletized: boolean;
}

interface CalculationResult {
  density: number | null;
  freightClass: string | null;
  volume: number | null;
}

const FREIGHT_CLASS_TABLE = [
  { minDensity: 50, maxDensity: Infinity, class: "50" },
  { minDensity: 35, maxDensity: 50, class: "55" },
  { minDensity: 30, maxDensity: 35, class: "60" },
  { minDensity: 22.5, maxDensity: 30, class: "65" },
  { minDensity: 15, maxDensity: 22.5, class: "70" },
  { minDensity: 12, maxDensity: 15, class: "85" },
  { minDensity: 10, maxDensity: 12, class: "92.5" },
  { minDensity: 8, maxDensity: 10, class: "100" },
  { minDensity: 6, maxDensity: 8, class: "125" },
  { minDensity: 4, maxDensity: 6, class: "150" },
  { minDensity: 2, maxDensity: 4, class: "250" },
  { minDensity: 1, maxDensity: 2, class: "300" },
  { minDensity: 0, maxDensity: 1, class: "400" },
];

const REFERENCE_TABLE_DATA = [
  { densityRange: "Less than 1", class: "400" },
  { densityRange: "1 to less than 2", class: "300" },
  { densityRange: "2 to less than 4", class: "250" },
  { densityRange: "4 to less than 6", class: "150" },
  { densityRange: "6 to less than 8", class: "125" },
  { densityRange: "8 to less than 10", class: "100" },
  { densityRange: "10 to less than 12", class: "92.5" },
  { densityRange: "12 to less than 15", class: "85" },
  { densityRange: "15 to less than 22.5", class: "70" },
  { densityRange: "22.5 to less than 30", class: "65" },
  { densityRange: "30 to less than 35", class: "60" },
  { densityRange: "35 or greater", class: "50" },
];

function getFreightClass(density: number): string {
  for (const range of FREIGHT_CLASS_TABLE) {
    if (density >= range.minDensity && density < range.maxDensity) {
      return range.class;
    }
  }
  return "400";
}

function loadFromStorage(): CalculatorInputs {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        length: parsed.length || "",
        width: parsed.width || "",
        height: parsed.height || "",
        weight: parsed.weight || "",
        useMetric: parsed.useMetric || false,
        palletized: parsed.palletized || false,
      };
    }
  } catch (e) {
    console.error("Error loading from storage:", e);
  }
  return {
    length: "",
    width: "",
    height: "",
    weight: "",
    useMetric: false,
    palletized: false,
  };
}

function saveToStorage(inputs: CalculatorInputs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch (e) {
    console.error("Error saving to storage:", e);
  }
}

export default function Home() {
  const [inputs, setInputs] = useState<CalculatorInputs>(loadFromStorage);
  const [result, setResult] = useState<CalculationResult>({
    density: null,
    freightClass: null,
    volume: null,
  });

  const calculateDensity = useCallback(() => {
    const length = parseFloat(inputs.length);
    const width = parseFloat(inputs.width);
    const height = parseFloat(inputs.height);
    const weight = parseFloat(inputs.weight);

    if (isNaN(length) || isNaN(width) || isNaN(height) || isNaN(weight) ||
        length <= 0 || width <= 0 || height <= 0 || weight <= 0) {
      setResult({ density: null, freightClass: null, volume: null });
      return;
    }

    let lengthInches = length;
    let widthInches = width;
    let heightInches = height;
    let weightLbs = weight;

    if (inputs.useMetric) {
      lengthInches = length / 2.54;
      widthInches = width / 2.54;
      heightInches = height / 2.54;
      weightLbs = weight * 2.20462;
    }

    if (inputs.palletized) {
      const STANDARD_PALLET_LENGTH = 48;
      const STANDARD_PALLET_WIDTH = 40;
      lengthInches = Math.max(lengthInches, STANDARD_PALLET_LENGTH);
      widthInches = Math.max(widthInches, STANDARD_PALLET_WIDTH);
    }

    const volumeCubicInches = lengthInches * widthInches * heightInches;
    const volumeCubicFeet = volumeCubicInches / 1728;
    const density = weightLbs / volumeCubicFeet;
    const freightClass = getFreightClass(density);

    setResult({
      density: Math.round(density * 100) / 100,
      freightClass,
      volume: Math.round(volumeCubicFeet * 100) / 100,
    });
  }, [inputs]);

  useEffect(() => {
    calculateDensity();
    saveToStorage(inputs);
  }, [inputs, calculateDensity]);

  const handleInputChange = (field: keyof CalculatorInputs, value: string | boolean) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    const resetInputs: CalculatorInputs = {
      length: "",
      width: "",
      height: "",
      weight: "",
      useMetric: inputs.useMetric,
      palletized: false,
    };
    setInputs(resetInputs);
    setResult({ density: null, freightClass: null, volume: null });
  };

  const dimensionUnit = inputs.useMetric ? "cm" : "in";
  const weightUnit = inputs.useMetric ? "kg" : "lbs";

  return (
    <div className="min-h-screen bg-background" data-testid="page-home">
      <header className="border-b border-border py-4 md:py-6" data-testid="header-main">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-1 md:gap-2">
            <div className="flex items-center gap-2 md:gap-3">
              <Truck className="h-7 w-7 md:h-9 md:w-9 text-primary" data-testid="icon-logo" />
              <h1 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight" data-testid="text-brand">
                Freight<span className="text-primary">Class</span>Pro
              </h1>
            </div>
            <p className="text-muted-foreground text-sm md:text-base" data-testid="text-subtitle">
              LTL Density Calculator
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-10" data-testid="main-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-6">
            <Card className="border-border" data-testid="card-calculator">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl" data-testid="title-calculator">
                  <Calculator className="h-5 w-5 text-primary" />
                  Calculate Freight Class
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-md bg-secondary/30 border border-border">
                  <div className="flex items-center gap-3">
                    <Label htmlFor="unit-toggle" className="text-sm font-medium">
                      Units:
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-mono ${!inputs.useMetric ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                        in/lbs
                      </span>
                      <Switch
                        id="unit-toggle"
                        checked={inputs.useMetric}
                        onCheckedChange={(checked) => handleInputChange("useMetric", checked)}
                        data-testid="switch-unit-toggle"
                      />
                      <span className={`text-sm font-mono ${inputs.useMetric ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                        cm/kg
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label htmlFor="palletized-toggle" className="text-sm font-medium">
                      Palletized:
                    </Label>
                    <Switch
                      id="palletized-toggle"
                      checked={inputs.palletized}
                      onCheckedChange={(checked) => handleInputChange("palletized", checked)}
                      data-testid="switch-palletized"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Package className="h-4 w-4" />
                    Dimensions ({dimensionUnit})
                  </div>
                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="length" className="text-xs md:text-sm">Length</Label>
                      <Input
                        id="length"
                        type="number"
                        inputMode="decimal"
                        placeholder="0"
                        value={inputs.length}
                        onChange={(e) => handleInputChange("length", e.target.value)}
                        className="h-12 md:h-14 text-lg md:text-xl font-mono text-center"
                        data-testid="input-length"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="width" className="text-xs md:text-sm">Width</Label>
                      <Input
                        id="width"
                        type="number"
                        inputMode="decimal"
                        placeholder="0"
                        value={inputs.width}
                        onChange={(e) => handleInputChange("width", e.target.value)}
                        className="h-12 md:h-14 text-lg md:text-xl font-mono text-center"
                        data-testid="input-width"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height" className="text-xs md:text-sm">Height</Label>
                      <Input
                        id="height"
                        type="number"
                        inputMode="decimal"
                        placeholder="0"
                        value={inputs.height}
                        onChange={(e) => handleInputChange("height", e.target.value)}
                        className="h-12 md:h-14 text-lg md:text-xl font-mono text-center"
                        data-testid="input-height"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Scale className="h-4 w-4" />
                    Weight ({weightUnit})
                  </div>
                  <Input
                    id="weight"
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={inputs.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                    className="h-12 md:h-14 text-lg md:text-xl font-mono text-center"
                    data-testid="input-weight"
                  />
                </div>

                <Button
                  variant="secondary"
                  onClick={handleReset}
                  className="w-full h-12"
                  data-testid="button-reset"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset All Values
                </Button>
              </CardContent>
            </Card>

            <Card className={`border-2 transition-all duration-300 ${result.density !== null ? 'border-primary bg-card' : 'border-border bg-secondary/20'}`} data-testid="card-results">
              <CardContent className="p-6 md:p-8">
                {result.density !== null ? (
                  <div className="space-y-6" data-testid="results-display">
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                      <div className="text-center p-4 rounded-md bg-secondary/40" data-testid="result-density-box">
                        <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider mb-1" data-testid="label-density">
                          Density (PCF)
                        </p>
                        <p className="text-3xl md:text-4xl font-bold font-mono text-foreground" data-testid="text-density">
                          {result.density}
                        </p>
                      </div>
                      <div className="text-center p-4 rounded-md bg-primary/20 border border-primary/30" data-testid="result-class-box">
                        <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider mb-1" data-testid="label-freight-class">
                          Freight Class
                        </p>
                        <p className="text-3xl md:text-4xl font-bold font-mono text-primary" data-testid="text-freight-class">
                          {result.freightClass}
                        </p>
                      </div>
                    </div>
                    <div className="text-center p-3 rounded-md bg-secondary/30" data-testid="result-volume-box">
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Volume: <span className="font-mono font-medium text-foreground" data-testid="text-volume">{result.volume}</span> cubic feet
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 md:py-8" data-testid="results-empty-state">
                    <Calculator className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground" data-testid="text-empty-message">
                      Enter dimensions and weight to calculate freight class
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground text-center px-4" data-testid="text-disclaimer">
              Data Source: Based on standard guidelines from the National Motor Freight Traffic Association (NMFTA) and Commodity Classification Standards Board (CCSB).
            </p>
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <Card className="border-border" data-testid="card-reference">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl" data-testid="title-reference">NMFC Density-to-Class Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="w-full min-w-[280px]" data-testid="table-reference">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-3 text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          Density Range (PCF)
                        </th>
                        <th className="text-right py-3 px-3 text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          Class
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {REFERENCE_TABLE_DATA.map((row, index) => (
                        <tr
                          key={row.class}
                          className={`border-b border-border/50 transition-colors ${
                            result.freightClass === row.class
                              ? 'bg-primary/20 border-primary/30'
                              : index % 2 === 0 ? 'bg-secondary/10' : ''
                          }`}
                          data-testid={`row-class-${row.class}`}
                        >
                          <td className="py-3 px-3 text-sm md:text-base font-mono">
                            {row.densityRange}
                          </td>
                          <td className={`py-3 px-3 text-right text-sm md:text-base font-mono font-semibold ${
                            result.freightClass === row.class ? 'text-primary' : ''
                          }`}>
                            {row.class}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <article className="max-w-3xl mx-auto mt-12 md:mt-16 px-4" data-testid="article-seo">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4" data-testid="heading-nmfc">
            Understanding Freight Classes (NMFC)
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            In the LTL (Less-Than-Truckload) shipping industry, the cost of shipping is determined by the "Freight Class." This classification system was developed by the National Motor Freight Traffic Association (NMFTA) to establish fair pricing based on the transportability of goods.
          </p>

          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-3" data-testid="heading-density-price">
            How Density Impacts Price
          </h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            The lower the density of your shipment, the higher the Freight Class (and the higher the cost). For example, ping pong balls take up a lot of space but weigh very little (Class 500), whereas steel bolts are extremely heavy and compact (Class 50).
          </p>

          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-3" data-testid="heading-reclass">
            Avoiding Re-Classification Fees
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Carriers frequently re-weigh and re-measure pallets at terminals. If your Bill of Lading (BOL) lists an incorrect class (e.g., you guessed Class 70 but it's actually Class 100), the carrier will issue a "Re-Class Fee" adjustment. Using an accurate density calculator protects your profit margins.
          </p>
        </article>
      </main>

      <footer className="border-t border-border mt-12 md:mt-16 py-6 md:py-8" data-testid="footer-main">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6" aria-label="Footer navigation" data-testid="nav-footer">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-about">
                About
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-contact">
                Contact
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-privacy">
                Privacy Policy
              </Link>
            </nav>
            <p className="text-xs md:text-sm text-muted-foreground" data-testid="text-copyright">
              &copy; 2025 Ellie Petal Media
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
