import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";
import { RotateCcw, Truck, Package, Calculator, Scale, Plus, Minus, Download, ChevronDown, Save, Trash2, FileText, X } from "lucide-react";
import { jsPDF } from "jspdf";

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

interface SavedLoad {
  id: string;
  name: string;
  inputs: CalculatorInputs;
  result: CalculationResult;
  timestamp: number;
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
  { minDensity: 4, maxDensity: 6, class: "175" },
  { minDensity: 2, maxDensity: 4, class: "250" },
  { minDensity: 1, maxDensity: 2, class: "300" },
  { minDensity: 0, maxDensity: 1, class: "400" },
];

const REFERENCE_TABLE_DATA = [
  { densityRange: "Less than 1", class: "400" },
  { densityRange: "1 but less than 2", class: "300" },
  { densityRange: "2 but less than 4", class: "250" },
  { densityRange: "4 but less than 6", class: "175" },
  { densityRange: "6 but less than 8", class: "125" },
  { densityRange: "8 but less than 10", class: "100" },
  { densityRange: "10 but less than 12", class: "92.5" },
  { densityRange: "12 but less than 15", class: "85" },
  { densityRange: "15 but less than 22.5", class: "70" },
  { densityRange: "22.5 but less than 30", class: "65" },
  { densityRange: "30 but less than 35", class: "60" },
  { densityRange: "35 but less than 50", class: "55" },
  { densityRange: "50 or greater", class: "50" },
];

const TEMPLATES = [
  { name: "Electronics (Typical)", length: "24", width: "18", height: "12", weight: "45", metric: false },
  { name: "Furniture (Couch)", length: "96", width: "36", height: "40", weight: "150", metric: false },
  { name: "Machinery", length: "36", width: "24", height: "30", weight: "200", metric: false },
  { name: "Textiles (Bolts)", length: "60", width: "48", height: "48", weight: "800", metric: false },
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
  const [showTemplates, setShowTemplates] = useState(false);
  const [pdfFileName, setPdfFileName] = useState("");
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [savedLoads, setSavedLoads] = useState<SavedLoad[]>([]);
  const [loadName, setLoadName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showMultiPdfDialog, setShowMultiPdfDialog] = useState(false);
  const [multiPdfFileName, setMultiPdfFileName] = useState("");

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

  const increment = (field: "length" | "width" | "height" | "weight", step: number = 1) => {
    const current = parseFloat(inputs[field]) || 0;
    handleInputChange(field, (current + step).toString());
  };

  const decrement = (field: "length" | "width" | "height" | "weight", step: number = 1) => {
    const current = parseFloat(inputs[field]) || 0;
    const newValue = Math.max(0, current - step);
    handleInputChange(field, newValue > 0 ? newValue.toString() : "");
  };

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setInputs({
      length: template.length,
      width: template.width,
      height: template.height,
      weight: template.weight,
      useMetric: template.metric,
      palletized: inputs.palletized,
    });
    setShowTemplates(false);
  };

  const downloadPDF = () => {
    if (!result.density || !result.freightClass) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const lineHeight = 8;
    let yPos = 20;

    doc.setFontSize(20);
    doc.text("FreightClassPro", pageWidth / 2, yPos, { align: "center" });
    yPos += 15;

    doc.setFontSize(12);
    doc.text("Freight Classification Report", pageWidth / 2, yPos, { align: "center" });
    yPos += 12;

    doc.setFontSize(10);
    const date = new Date().toLocaleDateString();
    doc.text(`Generated: ${date}`, 20, yPos);
    yPos += 12;

    doc.setDrawColor(200);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Shipment Details:", 20, yPos);
    yPos += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Length: ${inputs.length} ${dimensionUnit}`, 25, yPos);
    yPos += lineHeight;
    doc.text(`Width: ${inputs.width} ${dimensionUnit}`, 25, yPos);
    yPos += lineHeight;
    doc.text(`Height: ${inputs.height} ${dimensionUnit}`, 25, yPos);
    yPos += lineHeight;
    doc.text(`Weight: ${inputs.weight} ${weightUnit}`, 25, yPos);
    yPos += lineHeight;
    doc.text(`Palletized: ${inputs.palletized ? "Yes" : "No"}`, 25, yPos);
    yPos += 12;

    doc.setFont("helvetica", "bold");
    doc.text("Results:", 20, yPos);
    yPos += 8;

    doc.setFont("helvetica", "normal");
    doc.text(`Density: ${result.density} PCF`, 25, yPos);
    yPos += lineHeight;
    doc.text(`Volume: ${result.volume} cubic feet`, 25, yPos);
    yPos += lineHeight;
    doc.text(`Freight Class: ${result.freightClass}`, 25, yPos);
    yPos += 12;

    doc.setDrawColor(200);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 8;

    const docPageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Based on NMFC standards. For informational purposes only.", 20, docPageHeight - 15, { maxWidth: pageWidth - 40 });

    const fileName = pdfFileName.trim() || "freight-calculation";
    const sanitized = fileName.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    doc.save(`${sanitized}.pdf`);

    setShowPdfDialog(false);
    setPdfFileName("");
  };

  const saveCurrentLoad = () => {
    if (!result.density || !result.freightClass) return;
    
    const newLoad: SavedLoad = {
      id: Date.now().toString(),
      name: loadName.trim() || `Load ${savedLoads.length + 1}`,
      inputs: { ...inputs },
      result: { ...result },
      timestamp: Date.now(),
    };
    
    setSavedLoads(prev => [...prev, newLoad]);
    setLoadName("");
    setShowSaveDialog(false);
  };

  const removeLoad = (id: string) => {
    setSavedLoads(prev => prev.filter(load => load.id !== id));
  };

  const clearAllLoads = () => {
    setSavedLoads([]);
  };

  const downloadMultiLoadPDF = () => {
    if (savedLoads.length === 0) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const docPageHeight = doc.internal.pageSize.getHeight();
    const lineHeight = 6;
    const margin = 20;
    let yPos = 20;

    doc.setFontSize(20);
    doc.text("FreightClassPro", pageWidth / 2, yPos, { align: "center" });
    yPos += 12;

    doc.setFontSize(14);
    doc.text("Multi-Load Freight Report", pageWidth / 2, yPos, { align: "center" });
    yPos += 10;

    doc.setFontSize(10);
    const date = new Date().toLocaleDateString();
    doc.text(`Generated: ${date} | Total Loads: ${savedLoads.length}`, margin, yPos);
    yPos += 10;

    doc.setDrawColor(200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    savedLoads.forEach((load, index) => {
      if (yPos > docPageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }

      const loadDimUnit = load.inputs.useMetric ? "cm" : "in";
      const loadWtUnit = load.inputs.useMetric ? "kg" : "lbs";

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${load.name}`, margin, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      
      const col1 = margin + 5;
      const col2 = pageWidth / 2;
      
      doc.text(`Dimensions: ${load.inputs.length} x ${load.inputs.width} x ${load.inputs.height} ${loadDimUnit}`, col1, yPos);
      doc.text(`Density: ${load.result.density} PCF`, col2, yPos);
      yPos += lineHeight;
      
      doc.text(`Weight: ${load.inputs.weight} ${loadWtUnit}`, col1, yPos);
      doc.text(`Volume: ${load.result.volume} cu ft`, col2, yPos);
      yPos += lineHeight;
      
      doc.text(`Palletized: ${load.inputs.palletized ? "Yes" : "No"}`, col1, yPos);
      doc.setFont("helvetica", "bold");
      doc.text(`Freight Class: ${load.result.freightClass}`, col2, yPos);
      doc.setFont("helvetica", "normal");
      yPos += 10;

      doc.setDrawColor(230);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
    });

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Based on NMFC standards. For informational purposes only.", margin, docPageHeight - 10, { maxWidth: pageWidth - margin * 2 });

    const fileName = multiPdfFileName.trim() || "multi-load-report";
    const sanitized = fileName.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    doc.save(`${sanitized}.pdf`);

    setShowMultiPdfDialog(false);
    setMultiPdfFileName("");
  };

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
            <p className="text-xs md:text-sm text-muted-foreground/80 mt-2" data-testid="text-description">
              Calculate freight class instantly, 100% client-side with no data uploads
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
                      <span className={`text-base md:text-lg font-mono ${!inputs.useMetric ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                        in/lbs
                      </span>
                      <Switch
                        id="unit-toggle"
                        checked={inputs.useMetric}
                        onCheckedChange={(checked) => handleInputChange("useMetric", checked)}
                        data-testid="switch-unit-toggle"
                      />
                      <span className={`text-base md:text-lg font-mono ${inputs.useMetric ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                        cm/kg
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label htmlFor="palletized-toggle" className="text-base md:text-lg font-medium">
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
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => decrement("length", 1)}
                          className="h-10 w-10"
                          data-testid="button-length-minus"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          id="length"
                          type="number"
                          inputMode="decimal"
                          placeholder="0"
                          value={inputs.length}
                          onChange={(e) => handleInputChange("length", e.target.value)}
                          className="h-10 font-mono text-center flex-1"
                          style={{ fontSize: "1.5rem" }}
                          data-testid="input-length"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => increment("length", 1)}
                          className="h-10 w-10"
                          data-testid="button-length-plus"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="width" className="text-xs md:text-sm">Width</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => decrement("width", 1)}
                          className="h-10 w-10"
                          data-testid="button-width-minus"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          id="width"
                          type="number"
                          inputMode="decimal"
                          placeholder="0"
                          value={inputs.width}
                          onChange={(e) => handleInputChange("width", e.target.value)}
                          className="h-10 font-mono text-center flex-1"
                          style={{ fontSize: "1.5rem" }}
                          data-testid="input-width"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => increment("width", 1)}
                          className="h-10 w-10"
                          data-testid="button-width-plus"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height" className="text-xs md:text-sm">Height</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => decrement("height", 1)}
                          className="h-10 w-10"
                          data-testid="button-height-minus"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          id="height"
                          type="number"
                          inputMode="decimal"
                          placeholder="0"
                          value={inputs.height}
                          onChange={(e) => handleInputChange("height", e.target.value)}
                          className="h-10 font-mono text-center flex-1"
                          style={{ fontSize: "1.5rem" }}
                          data-testid="input-height"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => increment("height", 1)}
                          className="h-10 w-10"
                          data-testid="button-height-plus"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Scale className="h-4 w-4" />
                    Weight ({weightUnit})
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => decrement("weight", 1)}
                      className="h-10 w-10"
                      data-testid="button-weight-minus"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="weight"
                      type="number"
                      inputMode="decimal"
                      placeholder="0"
                      value={inputs.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      className="h-10 font-mono text-center flex-1"
                      style={{ fontSize: "1.5rem" }}
                      data-testid="input-weight"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => increment("weight", 1)}
                      className="h-10 w-10"
                      data-testid="button-weight-plus"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="secondary"
                    onClick={handleReset}
                    className="w-full h-12"
                    data-testid="button-reset"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset All Values
                  </Button>

                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="w-full h-12"
                      data-testid="button-templates"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Quick Templates
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    </Button>

                    {showTemplates && (
                      <div className="absolute top-14 left-0 right-0 bg-card border border-border rounded-md shadow-lg z-10 p-2 space-y-2" data-testid="templates-menu">
                        {TEMPLATES.map((template) => (
                          <Button
                            key={template.name}
                            type="button"
                            variant="ghost"
                            onClick={() => applyTemplate(template)}
                            className="w-full justify-start text-sm"
                            data-testid={`template-${template.name}`}
                          >
                            {template.name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  {result.density !== null && (
                    <>
                      <Button
                        type="button"
                        variant="default"
                        onClick={() => setShowPdfDialog(true)}
                        className="w-full h-12 bg-primary hover:bg-primary/90"
                        data-testid="button-download-pdf"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowSaveDialog(true)}
                        className="w-full h-12"
                        data-testid="button-save-load"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save to Multi-Load
                      </Button>
                    </>
                  )}
                </div>

                {showPdfDialog && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="pdf-dialog-overlay">
                    <Card className="border-border w-full max-w-sm mx-4" data-testid="pdf-dialog">
                      <CardHeader>
                        <CardTitle className="text-lg">Download Report</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="pdf-name" className="text-sm">File Name (without .pdf)</Label>
                          <Input
                            id="pdf-name"
                            type="text"
                            placeholder="e.g., freight-calculation"
                            value={pdfFileName}
                            onChange={(e) => setPdfFileName(e.target.value)}
                            className="h-10"
                            data-testid="input-pdf-name"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowPdfDialog(false);
                              setPdfFileName("");
                            }}
                            data-testid="button-pdf-cancel"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            variant="default"
                            onClick={downloadPDF}
                            data-testid="button-pdf-confirm"
                          >
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {showSaveDialog && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="save-dialog-overlay">
                    <Card className="border-border w-full max-w-sm mx-4" data-testid="save-dialog">
                      <CardHeader>
                        <CardTitle className="text-lg">Save Load</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="load-name" className="text-sm">Load Name (optional)</Label>
                          <Input
                            id="load-name"
                            type="text"
                            placeholder={`Load ${savedLoads.length + 1}`}
                            value={loadName}
                            onChange={(e) => setLoadName(e.target.value)}
                            className="h-10"
                            data-testid="input-load-name"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowSaveDialog(false);
                              setLoadName("");
                            }}
                            data-testid="button-save-cancel"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            variant="default"
                            onClick={saveCurrentLoad}
                            data-testid="button-save-confirm"
                          >
                            Save Load
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {showMultiPdfDialog && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="multi-pdf-dialog-overlay">
                    <Card className="border-border w-full max-w-sm mx-4" data-testid="multi-pdf-dialog">
                      <CardHeader>
                        <CardTitle className="text-lg">Export All Loads</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="multi-pdf-name" className="text-sm">File Name (without .pdf)</Label>
                          <Input
                            id="multi-pdf-name"
                            type="text"
                            placeholder="e.g., multi-load-report"
                            value={multiPdfFileName}
                            onChange={(e) => setMultiPdfFileName(e.target.value)}
                            className="h-10"
                            data-testid="input-multi-pdf-name"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowMultiPdfDialog(false);
                              setMultiPdfFileName("");
                            }}
                            data-testid="button-multi-pdf-cancel"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            variant="default"
                            onClick={downloadMultiLoadPDF}
                            data-testid="button-multi-pdf-confirm"
                          >
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            {savedLoads.length > 0 && (
              <Card className="border-border mt-6" data-testid="card-saved-loads">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="flex items-center gap-2 text-lg" data-testid="title-saved-loads">
                      <FileText className="h-5 w-5 text-primary" />
                      Saved Loads ({savedLoads.length})
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearAllLoads}
                        data-testid="button-clear-all"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Clear All
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={() => setShowMultiPdfDialog(true)}
                        data-testid="button-export-all"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Export All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {savedLoads.map((load, index) => (
                    <div
                      key={load.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-md bg-secondary/30 border border-border"
                      data-testid={`saved-load-${load.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" data-testid={`load-name-${load.id}`}>
                          {index + 1}. {load.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {load.inputs.length}×{load.inputs.width}×{load.inputs.height} {load.inputs.useMetric ? 'cm' : 'in'} | {load.inputs.weight} {load.inputs.useMetric ? 'kg' : 'lbs'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary text-sm" data-testid={`load-class-${load.id}`}>
                          Class {load.result.freightClass}
                        </span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeLoad(load.id)}
                          className="h-8 w-8"
                          data-testid={`button-remove-load-${load.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

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
                      <p className="text-sm md:text-base text-muted-foreground">
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
                        <th className="text-left py-3 px-3 text-sm md:text-base font-semibold text-muted-foreground uppercase tracking-wider">
                          Density Range (PCF)
                        </th>
                        <th className="text-right py-3 px-3 text-sm md:text-base font-semibold text-muted-foreground uppercase tracking-wider">
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
                          <td className="py-3 px-3 text-base md:text-lg font-mono">
                            {row.densityRange}
                          </td>
                          <td className={`py-3 px-3 text-right text-base md:text-lg font-mono font-semibold ${
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
            The NMFC uses a 13-tier density-based classification system (Classes 50-175) for standard commodities. Lower density means higher Freight Class and higher shipping costs. Items below 4 PCF density may require carrier review for handling, stowability, and liability factors.
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
