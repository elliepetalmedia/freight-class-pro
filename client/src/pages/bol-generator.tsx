import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { jsPDF } from "jspdf";
import { ChevronLeft, FileText, Plus, Trash2, Download, FilePlus, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSEO } from "@/hooks/use-seo";

interface Party {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
}

interface LineItem {
    id: string;
    qty: string;
    pkgType: string;
    description: string;
    nmfc: string;
    weight: string;
    dims: string;
    freightClass: string;
    hazmat: boolean;
}

const initialParty: Party = { name: "", address: "", city: "", state: "", zip: "" };

export default function BolGenerator() {
    useSEO(
        "Bill of Lading (BOL) Generator - FreightClassPro",
        "Create and download a standard VICS Bill of Lading document in PDF format instantly. 100% private, runs entirely in your browser."
    );

    const [, setLocation] = useLocation();
    const [bolNumber, setBolNumber] = useState(`BOL-${Math.floor(Math.random() * 1000000)}`);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [carrierName, setCarrierName] = useState("");

    const [shipper, setShipper] = useState<Party>({ ...initialParty });
    const [consignee, setConsignee] = useState<Party>({ ...initialParty });
    const [billTo, setBillTo] = useState<Party>({ ...initialParty });

    const [paymentTerms, setPaymentTerms] = useState("Prepaid");
    const [specialInstructions, setSpecialInstructions] = useState("");
    const [declaredValue, setDeclaredValue] = useState("");

    const [items, setItems] = useState<LineItem[]>([{
        id: crypto.randomUUID(),
        qty: "1",
        pkgType: "Pallet",
        description: "",
        nmfc: "",
        weight: "",
        dims: "",
        freightClass: "",
        hazmat: false
    }]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const l = params.get("l");
        const w = params.get("w");
        const h = params.get("h");
        const wt = params.get("wt");
        const c = params.get("c");
        const p = params.get("p");

        // Always try to load multi-load history if it exists, since they might be navigating from the top nav
        try {
            const storedItem = localStorage.getItem("freightClassPro");
            if (storedItem) {
                const parsed = JSON.parse(storedItem);
                const savedLoads = parsed.state?.savedLoads || [];
                if (savedLoads.length > 0) {
                    setItems(savedLoads.map((load: any) => ({
                        id: crypto.randomUUID(),
                        qty: "1",
                        pkgType: load.inputs.palletized ? "Pallets" : "Cartons",
                        description: load.name || "Freight Load",
                        nmfc: "",
                        weight: load.inputs.weight,
                        dims: `${load.inputs.length}x${load.inputs.width}x${load.inputs.height}`,
                        freightClass: load.result.freightClass || "",
                        hazmat: false
                    })));
                    return; // Early return so we don't overwrite with URL params below
                }
            }
        } catch (e) {
            console.error("Failed to parse saved loads for BOL", e);
        }

        // Only pre-populate if we actually have data, otherwise just keep empty default row
        if (l || w || h || wt || c) {
            setItems([{
                id: crypto.randomUUID(),
                qty: "1",
                pkgType: p === "true" ? "Pallets" : "Cartons",
                description: "General Freight",
                nmfc: "",
                weight: wt || "",
                dims: (l && w && h) ? `${l}x${w}x${h}` : "",
                freightClass: c || "",
                hazmat: false
            }]);
        }
    }, [window.location.search]);

    const handlePartyChange = (partyType: "shipper" | "consignee" | "billTo", field: keyof Party, value: string) => {
        const setter = partyType === "shipper" ? setShipper : partyType === "consignee" ? setConsignee : setBillTo;
        setter(prev => ({ ...prev, [field]: value }));
    };

    const updateItem = (id: string, field: keyof LineItem, value: string | boolean) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const addItem = () => {
        setItems([...items, {
            id: crypto.randomUUID(),
            qty: "1",
            pkgType: "Pallet",
            description: "",
            nmfc: "",
            weight: "",
            dims: "",
            freightClass: "",
            hazmat: false
        }]);
    };

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPos = 15;

        // Header
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("STRAIGHT BILL OF LADING - SHORT FORM", pageWidth / 2, yPos, { align: "center" });

        yPos += 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Not Negotiable", pageWidth / 2, yPos, { align: "center" });

        yPos += 10;
        doc.setFont("helvetica", "bold");
        doc.text(`Date: ${date}`, 15, yPos);
        doc.text(`BOL Number: ${bolNumber}`, pageWidth - 15, yPos, { align: "right" });

        // Parties boxes
        yPos += 8;
        const boxWidth = (pageWidth - 35) / 2;

        // Shipper Box
        doc.rect(15, yPos, boxWidth, 35);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("SHIP FROM:", 17, yPos + 5);
        doc.setFont("helvetica", "normal");
        doc.text(shipper.name || "Name:", 17, yPos + 12);
        doc.text(shipper.address || "Address:", 17, yPos + 18);
        doc.text(`${shipper.city}${shipper.city ? ', ' : ''}${shipper.state} ${shipper.zip}`, 17, yPos + 24);

        // Consignee Box
        doc.rect(pageWidth / 2 + 2.5, yPos, boxWidth, 35);
        doc.setFont("helvetica", "bold");
        doc.text("SHIP TO:", pageWidth / 2 + 4.5, yPos + 5);
        doc.setFont("helvetica", "normal");
        doc.text(consignee.name || "Name:", pageWidth / 2 + 4.5, yPos + 12);
        doc.text(consignee.address || "Address:", pageWidth / 2 + 4.5, yPos + 18);
        doc.text(`${consignee.city}${consignee.city ? ', ' : ''}${consignee.state} ${consignee.zip}`, pageWidth / 2 + 4.5, yPos + 24);

        yPos += 40;

        // Bill To & Carrier
        doc.rect(15, yPos, pageWidth - 30, 20);
        doc.setFont("helvetica", "bold");
        doc.text("THIRD PARTY FREIGHT CHARGES BILL TO:", 17, yPos + 5);
        doc.setFont("helvetica", "normal");
        if (billTo.name) {
            doc.text(`${billTo.name}, ${billTo.address}, ${billTo.city}, ${billTo.state} ${billTo.zip}`, 17, yPos + 12);
        }

        doc.text(`Carrier Name: ${carrierName}`, pageWidth / 2, yPos + 5);
        doc.text(`Freight Charge Terms: ${paymentTerms}`, pageWidth / 2, yPos + 12);

        yPos += 25;

        // Special Instructions
        if (specialInstructions) {
            doc.setFont("helvetica", "bold");
            doc.text("Special Instructions:", 15, yPos);
            doc.setFont("helvetica", "normal");
            doc.text(specialInstructions, 15, yPos + 5, { maxWidth: pageWidth - 30 });
            yPos += 15;
        }

        // Line Items Header
        doc.setFillColor(230, 230, 230);
        doc.rect(15, yPos, pageWidth - 30, 8, "DF");
        doc.setFont("helvetica", "bold");
        doc.text("QTY", 17, yPos + 5.5);
        doc.text("TYPE", 28, yPos + 5.5);
        doc.text("HM", 45, yPos + 5.5);
        doc.text("DESCRIPTION / DIMS", 55, yPos + 5.5);
        doc.text("WEIGHT", 130, yPos + 5.5);
        doc.text("CLASS", 155, yPos + 5.5);
        doc.text("NMFC", 175, yPos + 5.5);

        yPos += 8;
        doc.setFont("helvetica", "normal");

        // Line Items
        let totalWeight = 0;

        for (const item of items) {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            const wtStr = item.weight.replace(/[^0-9.]/g, '');
            if (wtStr) totalWeight += parseFloat(wtStr);

            doc.text(item.qty || "0", 17, yPos + 5);
            doc.text(item.pkgType, 28, yPos + 5);
            if (item.hazmat) doc.text("X", 46, yPos + 5);

            let descText = item.description || "Commodity";
            if (item.dims) descText += ` (${item.dims})`;
            doc.text(descText, 55, yPos + 5, { maxWidth: 70 });

            doc.text(`${item.weight} lbs`, 130, yPos + 5);
            doc.text(item.freightClass, 155, yPos + 5);
            doc.text(item.nmfc, 175, yPos + 5);

            doc.setDrawColor(200);
            doc.line(15, yPos + 8, pageWidth - 15, yPos + 8);
            yPos += 8;
        }

        doc.setFont("helvetica", "bold");
        doc.text(`TOTAL WEIGHT: ${totalWeight} lbs`, 130, yPos + 6);
        yPos += 15;

        // Declared Value & Signatures
        if (declaredValue) {
            doc.setFont("helvetica", "normal");
            doc.text(`Declared Value: $${declaredValue}`, 15, yPos);
            yPos += 10;
        }

        yPos = Math.max(yPos, 230);

        doc.setFontSize(7);
        doc.text("RECEIVED, subject to individually determined rates or contracts that have been agreed upon in writing between the carrier and shipper, if applicable, otherwise to the rates, classifications and rules that have been established by the carrier and are available to the shipper, on request.", 15, yPos, { maxWidth: pageWidth - 30 });

        yPos += 12;
        doc.setFontSize(9);
        doc.text("Shipper Signature: _______________________   Date: _________", 15, yPos);
        doc.text("Carrier Signature: _______________________   Date: _________", pageWidth / 2, yPos);

        doc.save(`BOL_${bolNumber}.pdf`);
    };

    const PartyForm = ({ title, party, type }: { title: string, party: Party, type: "shipper" | "consignee" | "billTo" }) => (
        <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase">{title}</h3>
            <div className="space-y-2">
                <Input
                    placeholder="Company / Name"
                    value={party.name}
                    onChange={(e) => handlePartyChange(type, "name", e.target.value)}
                    className="bg-background"
                />
                <Input
                    placeholder="Street Address"
                    value={party.address}
                    onChange={(e) => handlePartyChange(type, "address", e.target.value)}
                    className="bg-background"
                />
                <div className="grid grid-cols-3 gap-2">
                    <Input
                        placeholder="City"
                        className="col-span-1 bg-background"
                        value={party.city}
                        onChange={(e) => handlePartyChange(type, "city", e.target.value)}
                    />
                    <Input
                        placeholder="State"
                        className="col-span-1 bg-background"
                        value={party.state}
                        onChange={(e) => handlePartyChange(type, "state", e.target.value)}
                    />
                    <Input
                        placeholder="ZIP"
                        className="col-span-1 bg-background"
                        value={party.zip}
                        onChange={(e) => handlePartyChange(type, "zip", e.target.value)}
                    />
                </div>
            </div>
        </div>
    );

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
                            <FileText className="h-6 w-6 text-primary" />
                            <h1 className="text-xl md:text-2xl font-bold text-foreground">
                                BOL Generator
                            </h1>
                        </div>

                        <div className="ml-auto">
                            <Button onClick={generatePDF} className="hidden sm:flex" data-testid="button-generate-pdf">
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-5xl mx-auto space-y-8">

                    {items.length > 1 && (
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-4 mb-2">
                            <FilePlus className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div className="text-sm text-foreground">
                                <p className="font-semibold mb-1">Multi-Load Import Active</p>
                                <p className="text-muted-foreground">We matched <strong>{items.length}</strong> saved loads from your Freight Calculator history. Each load has been automatically added as a line item below.</p>
                            </div>
                        </div>
                    )}

                    <Card className="border-border">
                        <CardHeader className="pb-4">
                            <CardTitle>Shipment Header</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>BOL Number</Label>
                                    <Input value={bolNumber} onChange={e => setBolNumber(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Carrier Name</Label>
                                    <Input placeholder="e.g. FedEx Freight, XPO" value={carrierName} onChange={e => setCarrierName(e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-secondary/10">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <PartyForm title="Ship From (Shipper)" party={shipper} type="shipper" />
                                <PartyForm title="Ship To (Consignee)" party={consignee} type="consignee" />
                                <PartyForm title="Third Party Bill To (Optional)" party={billTo} type="billTo" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle>Freight Information</CardTitle>
                                <CardDescription>Line items to be transported</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={addItem}>
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {items.map((item, index) => (
                                    <div key={item.id} className="grid grid-cols-2 md:grid-cols-12 gap-3 p-4 bg-secondary/30 border border-border rounded-lg relative">
                                        <div className="col-span-2 md:col-span-1 space-y-1">
                                            <Label className="text-xs">Qty</Label>
                                            <Input value={item.qty} onChange={e => updateItem(item.id, "qty", e.target.value)} className="bg-background" />
                                        </div>
                                        <div className="col-span-2 md:col-span-2 space-y-1">
                                            <Label className="text-xs">Package</Label>
                                            <Select value={item.pkgType} onValueChange={v => updateItem(item.id, "pkgType", v)}>
                                                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Pallet">Pallet</SelectItem>
                                                    <SelectItem value="Carton">Carton</SelectItem>
                                                    <SelectItem value="Crate">Crate</SelectItem>
                                                    <SelectItem value="Drum">Drum</SelectItem>
                                                    <SelectItem value="Roll">Roll</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-2 md:col-span-3 space-y-1">
                                            <Label className="text-xs">Description / Items</Label>
                                            <Input placeholder="Commodity name" value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} className="bg-background" />
                                        </div>
                                        <div className="col-span-1 md:col-span-2 space-y-1">
                                            <Label className="text-xs">Dims (L×W×H)</Label>
                                            <Input placeholder="48x40x48" value={item.dims} onChange={e => updateItem(item.id, "dims", e.target.value)} className="bg-background" />
                                        </div>
                                        <div className="col-span-1 md:col-span-1 space-y-1">
                                            <Label className="text-xs">Weight</Label>
                                            <Input placeholder="Lbs" value={item.weight} onChange={e => updateItem(item.id, "weight", e.target.value)} className="bg-background" />
                                        </div>
                                        <div className="col-span-1 md:col-span-1 space-y-1">
                                            <Label className="text-xs">Class</Label>
                                            <Input value={item.freightClass} onChange={e => updateItem(item.id, "freightClass", e.target.value)} className="bg-background" />
                                        </div>
                                        <div className="col-span-1 md:col-span-1 space-y-1">
                                            <Label className="text-xs">NMFC (Opt)</Label>
                                            <Input value={item.nmfc} onChange={e => updateItem(item.id, "nmfc", e.target.value)} className="bg-background overflow-hidden" />
                                        </div>

                                        <div className="col-span-2 md:col-span-1 flex flex-row md:flex-col items-center justify-between md:justify-end gap-2 pt-2 md:pt-0">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`hazmat-${item.id}`}
                                                    checked={item.hazmat}
                                                    onCheckedChange={c => updateItem(item.id, "hazmat", !!c)}
                                                />
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Label htmlFor={`hazmat-${item.id}`} className="text-xs cursor-pointer text-destructive font-bold flex items-center gap-1">
                                                            HM <HelpCircle className="h-3 w-3 text-muted-foreground" />
                                                        </Label>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                        <p className="max-w-xs text-xs">Check if this item contains Hazardous Materials regulated by the Department of Transportation (DOT).</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                            {items.length > 1 && (
                                                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="pb-4">
                            <CardTitle>Shipment Terms & Instructions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Freight Payment Terms</Label>
                                        <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                                            <SelectTrigger className="w-full sm:w-[200px]"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Prepaid">Prepaid</SelectItem>
                                                <SelectItem value="Collect">Collect</SelectItem>
                                                <SelectItem value="Third Party">Third Party</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Declared Value ($)</Label>
                                        <Input placeholder="Optional" value={declaredValue} onChange={e => setDeclaredValue(e.target.value)} className="w-full sm:w-[200px]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Special Instructions (Liftgate, Appointment, etc)</Label>
                                    <textarea
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Enter any delivery instructions..."
                                        value={specialInstructions}
                                        onChange={e => setSpecialInstructions(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pb-12 sm:hidden">
                        <Button size="lg" onClick={generatePDF} className="w-full" data-testid="button-generate-pdf-mobile">
                            <Download className="mr-2 h-5 w-5" />
                            Download PDF BOL
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
