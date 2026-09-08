export interface GuideSection {
  heading: string;
  body: string[];
  list?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  updated: string;
  readMinutes: number;
  sections: GuideSection[];
  faqs: { q: string; a: string }[];
  related: { label: string; href: string }[];
}

export const GUIDES: Guide[] = [
  {
    slug: "how-to-calculate-freight-density",
    title: "How to Calculate Freight Density (PCF) — Step-by-Step",
    description:
      "Learn the LTL density formula: volume in cubic feet, PCF, and how density maps to the 13-tier NMFC freight class table. With worked examples in inches/lbs and cm/kg.",
    updated: "2026-09-01",
    readMinutes: 6,
    sections: [
      {
        heading: "The 30-second answer",
        body: [
          "Freight density in pounds per cubic foot (PCF) is total weight in pounds divided by total volume in cubic feet. Measure Length × Width × Height in inches, divide by 1,728 to get cubic feet, then divide weight by cubic feet. Match the PCF to the 13-tier NMFC density table to get Class 50–400.",
        ],
      },
      {
        heading: "Formula (imperial)",
        body: [
          "Volume (cu ft) = (L × W × H in inches) ÷ 1,728. Density (PCF) = Weight (lbs) ÷ Volume (cu ft). Example: 48×40×48 in at 800 lbs = 53.33 cu ft = 15.0 PCF = Class 70.",
          "Always include the pallet footprint when palletized. FreightClassPro floors palletized footprints at 48×40 in. Enter full loaded height and total weight including the pallet.",
        ],
      },
      {
        heading: "Formula (metric)",
        body: [
          "Convert first, then use the same formula: inches = cm ÷ 2.54, lbs = kg × 2.20462. Example: 122×102×122 cm at 363 kg = 48×40×48 in at 800 lbs = 15.0 PCF = Class 70.",
          "The calculator toggle does this conversion automatically and saves your unit preference locally.",
        ],
      },
      {
        heading: "Common mistakes",
        body: ["Avoid these re-class triggers:"],
        list: [
          "Using box dims instead of loaded pallet dims (48×40 floor).",
          "Forgetting pallet tare (~40–48 lbs) and pallet height (~6 in).",
          "Rounding down volume or using outer vs. inner dims inconsistently.",
          "Listing a guessed class on the BOL instead of the density-derived class.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is PCF in freight?",
        a: "PCF means pounds per cubic foot: total shipment weight divided by total cubic feet. Higher PCF means denser freight and usually a lower (cheaper) class.",
      },
      {
        q: "How many cubic inches in a cubic foot?",
        a: "1,728. Divide Length × Width × Height in inches by 1,728 to get cubic feet.",
      },
      {
        q: "Does palletized change the calculation?",
        a: "Yes. Use the full pallet footprint (minimum 48×40 in on this tool), full loaded height, and total weight including the pallet.",
      },
    ],
    related: [
      { label: "LTL Density Calculator", href: "/" },
      { label: "How to Avoid Re-Classification Fees", href: "/guides/how-to-avoid-reclassification-fees" },
      { label: "Pallet Dimensions & Weight Guide", href: "/guides/pallet-dimensions-weight-guide" },
    ],
  },
  {
    slug: "how-to-avoid-reclassification-fees",
    title: "How to Avoid LTL Re-Classification Fees",
    description:
      "Carriers re-weigh and dimension pallets at terminals. Learn how accurate density, photos, pallet discipline, and BOL wording prevent re-class fees.",
    updated: "2026-09-01",
    readMinutes: 7,
    sections: [
      {
        heading: "The 30-second answer",
        body: [
          "Re-class fees happen when the BOL class doesn’t match terminal-measured density. Prevent them by measuring the loaded pallet (not the box), including pallet weight/height, photographing dims, listing the density-derived class, and keeping a PDF record with date and preparer.",
        ],
      },
      {
        heading: "Checklist before you tender",
        body: ["Do this for every pallet:"],
        list: [
          "Measure loaded L×W×H, floor at 48×40 in if palletized.",
          "Weigh total including pallet and stretch wrap.",
          "Calculate PCF and class; save the PDF with BOL/PO number as filename.",
          "Photo the tape measure + scale readout; attach to the shipment record.",
          "Copy the exact dims/weight/class onto the BOL — never guess.",
        ],
      },
      {
        heading: "What to write on the BOL",
        body: [
          "List quantity, handling unit (pallet/carton), description, NMFC if known, dims, weight, and density-derived class. Use the BOL Generator to keep formatting consistent and export a signed PDF.",
          "If density is borderline (e.g., 14.9 vs. 15.0 PCF), re-measure. Carriers round per their tariff — documented accuracy wins disputes.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is a re-class fee?",
        a: "A carrier adjustment when terminal inspection finds a different class than the BOL. You pay the rate difference plus a re-class fee.",
      },
      {
        q: "What evidence wins a dispute?",
        a: "Dated photos of dims/weight, a saved calculator PDF with preparer name, and matching BOL values. Consistency across documents matters most.",
      },
    ],
    related: [
      { label: "LTL Density Calculator", href: "/" },
      { label: "BOL Generator", href: "/bol-generator" },
      { label: "How to Calculate Freight Density", href: "/guides/how-to-calculate-freight-density" },
    ],
  },
  {
    slug: "pallet-dimensions-weight-guide",
    title: "Pallet Dimensions & Weight Guide (48×40, 48×48, EUR)",
    description:
      "Standard pallet footprints, heights, and tare weights for LTL: GMA 48×40, square 48×48, EUR 120×80 cm. How to enter them in metric or imperial.",
    updated: "2026-09-01",
    readMinutes: 5,
    sections: [
      {
        heading: "The 30-second answer",
        body: [
          "US LTL standard is the GMA pallet: 48×40 in footprint, ~6 in tall, ~40–48 lbs tare. Max LTL pallet height is commonly 96 in including the pallet. EUR/EPAL is 120×80 cm (47.2×31.5 in). Enter loaded pallet dims and total weight including the pallet.",
        ],
      },
      {
        heading: "Standard sizes",
        body: [
          "GMA/Standard 48×40 in (121.9×101.6 cm) — most US LTL. Square 48×48 in for drums/IBC totes. EUR 47.2×31.5 in (120×80 cm) for EU lanes. Custom sizes are allowed — measure the actual stringer footprint.",
          "In metric mode, the Pallet Optimizer accepts cm/kg and converts internally (cm ÷ 2.54, kg × 2.20462) so PCF math stays in imperial.",
        ],
      },
      {
        heading: "Height and weight limits",
        body: ["Plan within carrier limits:"],
        list: [
          "Height: 96 in total including pallet is the common LTL cap; confirm with carrier.",
          "Weight: ~4,000 lbs per pallet position is a common planning cap; confirm equipment.",
          "Stack: keep layers uniform; Pallet Optimizer shows boxes/layer, layers, and gross weight.",
        ],
      },
    ],
    faqs: [
      {
        q: "How tall is a standard pallet?",
        a: "Wood GMA pallets are ~5–6 in tall. Add that to load height for total height.",
      },
      {
        q: "How much does a pallet weigh?",
        a: "Typically 40–48 lbs for wood. Include it in total weight; this tool discloses that tare is not auto-added in the density calculator.",
      },
      {
        q: "Can I enter metric pallet dims?",
        a: "Yes. Toggle cm/kg in the calculator and pallet optimizer. Conversions use 1 in = 2.54 cm and 1 kg = 2.20462 lbs.",
      },
    ],
    related: [
      { label: "Pallet Optimizer", href: "/pallet-optimizer" },
      { label: "LTL Density Calculator", href: "/" },
      { label: "How to Calculate Freight Density", href: "/guides/how-to-calculate-freight-density" },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
