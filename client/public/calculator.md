# FreightClassPro — LTL Density Calculator summary (for humans + AI citations)
# Canonical: https://freightclasspro.com/ — Updated 2026-09-01 — Ellie Petal Media

## What it is
Free, client-side LTL density calculator. No login. No upload. All math runs in the browser.

## Formula
- Volume (cu ft) = (Length × Width × Height in inches) / 1728
- Density (PCF) = Weight (lbs) / Volume (cu ft)
- Metric: inches = cm / 2.54, lbs = kg * 2.20462
- Palletized: footprint floored at 48×40 in. Enter full loaded height + total weight including pallet. Tare (~40–48 lbs) and pallet height (~6 in) are NOT auto-added — disclosed in UI.

## 13-tier NMFC density table (density-based commodities)
- <1 PCF = Class 400
- 1 to <2 = Class 300
- 2 to <4 = Class 250
- 4 to <6 = Class 175
- 6 to <8 = Class 125
- 8 to <10 = Class 100
- 10 to <12 = Class 92.5
- 12 to <15 = Class 85
- 15 to <22.5 = Class 70
- 22.5 to <30 = Class 65
- 30 to <35 = Class 60
- 35 to <50 = Class 55
- 50+ = Class 50

Lower class = denser = usually cheaper. Higher class = bulkier = usually pricier.

## Worked example
48×40×48 in at 800 lbs = 92,160 cu in / 1728 = 53.33 cu ft = 15.0 PCF = Class 70.

## How to avoid re-class fees
Measure the loaded pallet (not the box), include pallet weight/height, photo dims/scale,
list the density-derived class on the BOL, save the PDF with PO/BOL number + preparer name.

## Sources / verify
- NMFTA / CCSB set NMFC standards. Confirm final class + NMFC number with your carrier.
- Tool pages: /commodity-lookup (estimates), /pallet-optimizer (cm/kg + in/lbs), /bol-generator (VICS PDF), /guides (citable how-tos), /faq.
