import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";
import { RotateCcw, Truck, Package, Calculator, Scale, Plus, Minus, Download, ChevronDown, Save, Trash2, FileText, X, HelpCircle, Shield, Copy, Check, Share2, History } from "lucide-react";
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import { useSEO } from "@/hooks/use-seo";
import { useCalculationHistory } from "@/hooks/useCalculationHistory";
import {
  FREIGHT_CLASS_TABLE,
  REFERENCE_TABLE_DATA,
  TEMPLATES,
  getFreightClass,
  type CalculatorInputs,
  type CalculationResult,
  type SavedLoad
} from "@/lib/freight";

const STORAGE_KEY = "freightClassPro";

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

function getInitialInputs(): CalculatorInputs {
  try {
    const search = window.location.search;
    if (search) {
      const params = new URLSearchParams(search);
      const l = params.get("l");
      const w = params.get("w");
      const h = params.get("h");
      const wt = params.get("wt");
      if (l && w && h && wt) {
        return {
          length: l,
          width: w,
          height: h,
          weight: wt,
          useMetric: params.get("m") === "true",
          palletized: params.get("p") === "true",
        };
      }
    }
  } catch (e) {
    console.error("Error parsing URL params:", e);
  }
  return loadFromStorage();
}

export default function Home() {
  useSEO(
    "FreightClassPro - LTL Density Calculator | NMFC Freight Class",
    "Free LTL Density Calculator. Calculate freight class based on NMFC density guidelines. Accurate density-to-class mapping for warehouse managers and logistics coordinators.",
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "FreightClassPro",
      "description": "Calculate freight class based on NMFC density guidelines. Free, accurate, and easy to use.",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  );

  const [inputs, setInputs] = useState<CalculatorInputs>(getInitialInputs);
  const [result, setResult] = useState<CalculationResult>({
    density: null,
    freightClass: null,
    volume: null,
  });
  const [showTemplates, setShowTemplates] = useState(false);
  const [pdfFileName, setPdfFileName] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [savedLoads, setSavedLoads] = useState<SavedLoad[]>([]);
  const [loadName, setLoadName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showMultiPdfDialog, setShowMultiPdfDialog] = useState(false);
  const [multiPdfFileName, setMultiPdfFileName] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const { entries: historyEntries, add: addHistory, clear: clearHistory } = useCalculationHistory();
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        if (result.density !== null && !showSaveDialog) {
          setShowSaveDialog(true);
        }
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        if (result.density !== null && !showPdfDialog) {
          setShowPdfDialog(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [result.density, showSaveDialog, showPdfDialog]);

  useEffect(() => {
    if (result.freightClass && result.density !== null) {
      const timer = setTimeout(() => {
        addHistory(inputs, result);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [inputs, result, addHistory]);

  const copyToClipboard = async () => {
    if (!result.density || !result.freightClass) return;
    const text = `Freight Class: ${result.freightClass}\nDensity: ${result.density} PCF\nVolume: ${result.volume} cu ft`;
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const shareLink = async () => {
    const params = new URLSearchParams();
    if (inputs.length) params.set("l", inputs.length);
    if (inputs.width) params.set("w", inputs.width);
    if (inputs.height) params.set("h", inputs.height);
    if (inputs.weight) params.set("wt", inputs.weight);
    params.set("m", inputs.useMetric.toString());
    params.set("p", inputs.palletized.toString());

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    try {
      await navigator.clipboard.writeText(url);
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

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
    yPos += 10;

    const fileName = pdfFileName.trim() || "freight-calculation";
    const sanitized = fileName.replace(/[^a-z0-9 -]/gi, "").toUpperCase();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(sanitized, pageWidth / 2, yPos, { align: "center" });
    doc.setFont("helvetica", "normal");
    yPos += 12;

    doc.setFontSize(10);
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    doc.text(`Generated: ${date} at ${time}`, 20, yPos);
    if (preparedBy.trim()) {
      doc.text(`Prepared By: ${preparedBy.trim()}`, 20, yPos + 6);
      yPos += 18;
    } else {
      yPos += 12;
    }

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

    doc.save(`${sanitized}.pdf`);

    setShowPdfDialog(false);
    setPdfFileName("");
    setPreparedBy("");
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

    const multiFileName = multiPdfFileName.trim() || "multi-load-report";
    const multiSanitized = multiFileName.replace(/[^a-z0-9 -]/gi, "").toUpperCase();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(multiSanitized, pageWidth / 2, yPos, { align: "center" });
    doc.setFont("helvetica", "normal");
    yPos += 10;

    doc.setFontSize(10);
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    doc.text(`Generated: ${date} at ${time} | Total Loads: ${savedLoads.length}`, margin, yPos);
    if (preparedBy.trim()) {
      doc.text(`Prepared By: ${preparedBy.trim()}`, margin, yPos + 6);
      yPos += 16;
    } else {
      yPos += 10;
    }

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

    doc.save(`${multiSanitized}.pdf`);

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
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs md:text-sm font-medium border border-emerald-500/20" data-testid="trust-banner">
              <Shield className="h-4 w-4" />
              100% private — no data ever uploaded.
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-10" data-testid="main-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-6">
            <Card className="border-border" data-testid="card-calculator">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl" data-testid="title-calculator">
                    <Calculator className="h-5 w-5 text-primary" />
                    Calculate Freight Class
                    <div className="group relative ml-2 hidden md:block">
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md border whitespace-pre-line z-50">
                        Shortcuts:{"\n"}Ctrl+Enter: Save Load{"\n"}Ctrl+Shift+P: Download PDF
                      </div>
                    </div>
                  </CardTitle>
                  <Link
                    href="/faq"
                    className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                    data-testid="link-faq"
                  >
                    <HelpCircle className="h-4 w-4" />
                    FAQ
                  </Link>
                </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="length" className="text-sm md:text-sm font-medium">Length ({dimensionUnit})</Label>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => decrement("length", 1)}
                          onTouchEnd={(e) => { e.preventDefault(); decrement("length", 1); }}
                          className="h-14 w-14 md:h-10 md:w-10 touch-manipulation flex-shrink-0"
                          data-testid="button-length-minus"
                        >
                          <Minus className="h-6 w-6 md:h-4 md:w-4" />
                        </Button>
                        <input
                          id="length"
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9.]*"
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          placeholder="0"
                          value={inputs.length}
                          onChange={(e) => handleInputChange("length", e.target.value)}
                          className="h-14 md:h-10 w-20 md:flex-1 rounded-md border border-input bg-background px-2 py-2 font-mono text-center text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          style={{ fontSize: "1.25rem" }}
                          data-testid="input-length"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => increment("length", 1)}
                          onTouchEnd={(e) => { e.preventDefault(); increment("length", 1); }}
                          className="h-14 w-14 md:h-10 md:w-10 touch-manipulation flex-shrink-0"
                          data-testid="button-length-plus"
                        >
                          <Plus className="h-6 w-6 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="width" className="text-sm md:text-sm font-medium">Width ({dimensionUnit})</Label>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => decrement("width", 1)}
                          onTouchEnd={(e) => { e.preventDefault(); decrement("width", 1); }}
                          className="h-14 w-14 md:h-10 md:w-10 touch-manipulation flex-shrink-0"
                          data-testid="button-width-minus"
                        >
                          <Minus className="h-6 w-6 md:h-4 md:w-4" />
                        </Button>
                        <input
                          id="width"
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9.]*"
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          placeholder="0"
                          value={inputs.width}
                          onChange={(e) => handleInputChange("width", e.target.value)}
                          className="h-14 md:h-10 w-20 md:flex-1 rounded-md border border-input bg-background px-2 py-2 font-mono text-center text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          style={{ fontSize: "1.25rem" }}
                          data-testid="input-width"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => increment("width", 1)}
                          onTouchEnd={(e) => { e.preventDefault(); increment("width", 1); }}
                          className="h-14 w-14 md:h-10 md:w-10 touch-manipulation flex-shrink-0"
                          data-testid="button-width-plus"
                        >
                          <Plus className="h-6 w-6 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height" className="text-sm md:text-sm font-medium">Height ({dimensionUnit})</Label>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => decrement("height", 1)}
                          onTouchEnd={(e) => { e.preventDefault(); decrement("height", 1); }}
                          className="h-14 w-14 md:h-10 md:w-10 touch-manipulation flex-shrink-0"
                          data-testid="button-height-minus"
                        >
                          <Minus className="h-6 w-6 md:h-4 md:w-4" />
                        </Button>
                        <input
                          id="height"
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9.]*"
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          placeholder="0"
                          value={inputs.height}
                          onChange={(e) => handleInputChange("height", e.target.value)}
                          className="h-14 md:h-10 w-20 md:flex-1 rounded-md border border-input bg-background px-2 py-2 font-mono text-center text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          style={{ fontSize: "1.25rem" }}
                          data-testid="input-height"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => increment("height", 1)}
                          onTouchEnd={(e) => { e.preventDefault(); increment("height", 1); }}
                          className="h-14 w-14 md:h-10 md:w-10 touch-manipulation flex-shrink-0"
                          data-testid="button-height-plus"
                        >
                          <Plus className="h-6 w-6 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm font-medium flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Weight ({weightUnit})
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => decrement("weight", 1)}
                      onTouchEnd={(e) => { e.preventDefault(); decrement("weight", 1); }}
                      className="h-14 w-14 md:h-10 md:w-10 touch-manipulation flex-shrink-0"
                      data-testid="button-weight-minus"
                    >
                      <Minus className="h-6 w-6 md:h-4 md:w-4" />
                    </Button>
                    <input
                      id="weight"
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9.]*"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      placeholder="0"
                      value={inputs.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      className="h-14 md:h-10 w-24 md:flex-1 rounded-md border border-input bg-background px-2 py-2 font-mono text-center text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      style={{ fontSize: "1.25rem" }}
                      data-testid="input-weight"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => increment("weight", 1)}
                      onTouchEnd={(e) => { e.preventDefault(); increment("weight", 1); }}
                      className="h-14 w-14 md:h-10 md:w-10 touch-manipulation flex-shrink-0"
                      data-testid="button-weight-plus"
                    >
                      <Plus className="h-6 w-6 md:h-4 md:w-4" />
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

                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative md:flex-1">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowTemplates(!showTemplates)}
                        size="sm"
                        className="w-full"
                        data-testid="button-templates"
                      >
                        <Package className="h-3 w-3 mr-1" />
                        Templates
                        <ChevronDown className="h-3 w-3 ml-auto" />
                      </Button>

                      {showTemplates && (
                        <div className="absolute top-10 left-0 right-0 bg-card border border-border rounded-md shadow-lg z-10 p-2 space-y-2" data-testid="templates-menu">
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
                    <input
                      type="text"
                      placeholder="Prepared By (optional)"
                      value={preparedBy}
                      onChange={(e) => setPreparedBy(e.target.value)}
                      className="w-full md:flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      data-testid="input-prepared-by"
                    />
                  </div>

                  {result.density !== null && (
                    <>
                      <div className="flex gap-2 w-full">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowPdfDialog(true)}
                          className="flex-1 h-12"
                          data-testid="button-download-pdf"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          PDF Report
                        </Button>
                        <Button
                          type="button"
                          variant="default"
                          className="flex-1 h-12 bg-primary hover:bg-primary/90"
                          data-testid="button-generate-bol"
                          onClick={() => {
                            const l = encodeURIComponent(inputs.length);
                            const w = encodeURIComponent(inputs.width);
                            const h = encodeURIComponent(inputs.height);
                            const wt = encodeURIComponent(inputs.weight);
                            const c = encodeURIComponent(result.freightClass || "");
                            const p = encodeURIComponent(inputs.palletized ? "true" : "false");
                            const url = `/bol-generator?l=${l}&w=${w}&h=${h}&wt=${wt}&c=${c}&p=${p}`;
                            window.location.href = url;
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Generate BOL →
                        </Button>
                      </div>
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
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                downloadPDF();
                              }
                            }}
                            autoFocus
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
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                saveCurrentLoad();
                              }
                            }}
                            autoFocus
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
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                downloadMultiLoadPDF();
                              }
                            }}
                            autoFocus
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
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-primary/10 hover:bg-primary/20"
                        onClick={() => window.location.href = "/bol-generator?m=true"}
                        data-testid="button-generate-multi-bol"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Create BOL
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
                <AnimatePresence mode="popLayout">
                  {result.density !== null ? (
                    <motion.div
                      key={result.density + '-' + result.freightClass + '-' + result.volume}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                      data-testid="results-display"
                    >
                      <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <motion.div
                          className="text-center p-4 rounded-md bg-secondary/40"
                          data-testid="result-density-box"
                        >
                          <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider mb-1" data-testid="label-density">
                            Density (PCF)
                          </p>
                          <p className="text-3xl md:text-4xl font-bold font-mono text-foreground" data-testid="text-density">
                            {result.density}
                          </p>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0.8 }}
                          animate={{ opacity: [0.8, 1.2, 1] }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="text-center p-4 rounded-md bg-primary/20 border border-primary/30"
                          data-testid="result-class-box"
                        >
                          <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider mb-1" data-testid="label-freight-class">
                            Freight Class
                          </p>
                          <p className="text-3xl md:text-4xl font-bold font-mono text-primary" data-testid="text-freight-class">
                            {result.freightClass}
                          </p>
                        </motion.div>
                      </div>
                      <div className="text-center p-3 rounded-md bg-secondary/30" data-testid="result-volume-box">
                        <p className="text-sm md:text-base text-muted-foreground">
                          Volume: <span className="font-mono font-medium text-foreground" data-testid="text-volume">{result.volume}</span> cubic feet
                        </p>
                      </div>
                      <div className="flex gap-2 justify-center pt-2">
                        <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex-1 items-center justify-center">
                          {isCopied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                          {isCopied ? "Copied!" : "Copy Results"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={shareLink} className="flex-1 items-center justify-center">
                          {isLinkCopied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Share2 className="h-4 w-4 mr-2" />}
                          {isLinkCopied ? "Link Copied!" : "Share Link"}
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center py-6 md:py-8"
                      data-testid="results-empty-state"
                    >
                      <Calculator className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground" data-testid="text-empty-message">
                        Enter dimensions and weight to calculate freight class
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>



            <p className="text-xs text-muted-foreground text-center px-4 mt-6" data-testid="text-disclaimer">
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
                          className={`border-b border-border/50 transition-colors ${result.freightClass === row.class
                            ? 'bg-primary/20 border-primary/30'
                            : index % 2 === 0 ? 'bg-secondary/10' : ''
                            }`}
                          data-testid={`row-class-${row.class}`}
                        >
                          <td className="py-3 px-3 text-base md:text-lg font-mono">
                            {row.densityRange}
                          </td>
                          <td className={`py-3 px-3 text-right text-base md:text-lg font-mono font-semibold ${result.freightClass === row.class ? 'text-primary' : ''
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
            {historyEntries.length > 0 && (
              <Card className="border-border mt-6" data-testid="card-history">
                <CardHeader className="pb-3 cursor-pointer select-none" onClick={() => setShowHistory(!showHistory)}>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-lg" data-testid="title-history">
                      <History className="h-5 w-5 text-muted-foreground" />
                      Recent Calculations
                    </CardTitle>
                    <div className="flex gap-2">
                      <ChevronDown className={`h-4 w-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </CardHeader>
                {showHistory && (
                  <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                    {historyEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-secondary/50 border border-transparent hover:border-border cursor-pointer transition-colors"
                        onClick={() => {
                          setInputs(entry.inputs);
                          setResult(entry.result);
                        }}
                        data-testid={`history-entry-${entry.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">
                            {entry.inputs.length}×{entry.inputs.width}×{entry.inputs.height} {entry.inputs.useMetric ? 'cm' : 'in'} | {entry.inputs.weight} {entry.inputs.useMetric ? 'kg' : 'lbs'}
                          </p>
                        </div>
                        <span className="font-mono text-xs font-semibold text-primary">
                          Class {entry.result.freightClass}
                        </span>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); clearHistory(); }} className="w-full text-xs text-muted-foreground mt-2">
                      Clear History
                    </Button>
                  </CardContent>
                )}
              </Card>
            )}

          </div>
        </div>

        <article className="max-w-3xl mx-auto mt-12 md:mt-16 px-4" data-testid="article-seo">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4" data-testid="heading-nmfc">
            What is Freight Class?
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            In the Less-Than-Truckload (LTL) shipping industry, freight class is a standardized pricing classification established by the National Motor Freight Traffic Association (NMFTA). It determines how much you pay to ship your goods. Classes range from 50 (the cheapest, highest density) to 400 (the most expensive, lowest density). By correctly identifying your freight class using a density calculator, you ensure accurate quotes and avoid unexpected carrier re-classification fees.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3" data-testid="heading-density-calc">
            How to Calculate Freight Density — Step-by-Step
          </h2>
          <div className="text-muted-foreground mb-8 text-sm md:text-base space-y-4 leading-relaxed">
            <p>Calculating freight density involves simple math, but accuracy is critical. Here is the formula:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong>Measure the Dimensions:</strong> Measure the Length, Width, and Height of your shipment in inches. Always include the pallet dimensions if the shipment is palletized.</li>
              <li><strong>Calculate Volume in Cubic Inches:</strong> Multiply Length × Width × Height.</li>
              <li><strong>Convert to Cubic Feet:</strong> Divide the cubic inches by 1,728 (the number of cubic inches in a cubic foot).</li>
              <li><strong>Calculate Density (PCF):</strong> Divide the total weight of the shipment (in pounds) by the total volume (in cubic feet). </li>
            </ol>
            <p>The resulting number is your Pounds per Cubic Foot (PCF), which maps perfectly to the 13-tier NMFC density guidelines.</p>
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3" data-testid="heading-nmfc-vs-density">
            NMFC Codes vs Density-Based Classification
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            There are two primary ways freight is classified: by a specific <strong>NMFC Item Code</strong> assigned to particular commodities (like auto parts, plastics, or textiles) based on four transportability factors (density, handling, stowability, liability), and by pure <strong>Density</strong>. Today, an increasing number of carriers and commodities use purely density-based classification because it is objective and easily verifiable via dimensional scanners at cross-dock terminals.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3" data-testid="heading-examples">
            Freight Class Chart with Examples
          </h2>
          <div className="text-muted-foreground mb-8 text-sm md:text-base leading-relaxed overflow-x-auto">
            <table className="w-full text-left border-collapse border border-border mt-2">
              <thead>
                <tr className="bg-secondary/10">
                  <th className="p-2 border border-border">Class</th>
                  <th className="p-2 border border-border">Density (PCF)</th>
                  <th className="p-2 border border-border">Typical Commodities</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="p-2 border border-border">Class 50</td><td className="p-2 border border-border">50+</td><td className="p-2 border border-border">Nuts, bolts, steel, heavy building materials</td></tr>
                <tr><td className="p-2 border border-border">Class 85</td><td className="p-2 border border-border">12 to 15</td><td className="p-2 border border-border">Auto parts, cast iron stoves, boxed machinery</td></tr>
                <tr><td className="p-2 border border-border">Class 150</td><td className="p-2 border border-border">6 to 8</td><td className="p-2 border border-border">Assembled wooden furniture, sheet metal parts</td></tr>
                <tr><td className="p-2 border border-border">Class 400</td><td className="p-2 border border-border">Less than 1</td><td className="p-2 border border-border">Ping pong balls, highly fragile/bulky items</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3" data-testid="heading-reclass">
            How to Avoid Re-Classification Fees
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Carriers frequently re-weigh and re-measure pallets at terminals. If your Bill of Lading (BOL) lists an incorrect class (e.g., you guessed Class 70 but the true density dictates Class 100), the carrier will issue a "Re-Class Fee" adjustment on your final invoice. The best way to protect your profit margins is to document dimensions accurately, always factor in the pallet weight and size, and use an accurate density calculator before quoting shipping rates to your customers.
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
              <Link href="/commodity-lookup" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-commodity">
                Commodity Lookup
              </Link>
              <Link href="/bol-generator" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-bol">
                BOL Generator
              </Link>
              <Link href="/pallet-optimizer" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-pallet">
                Pallet Optimizer
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-contact">
                Contact
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-privacy">
                Privacy Policy
              </Link>
            </nav>
            <p className="text-xs md:text-sm text-muted-foreground" data-testid="text-copyright">
              &copy; {new Date().getFullYear()} Ellie Petal Media
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
