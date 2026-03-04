export const FREIGHT_CLASS_TABLE = [
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

export const REFERENCE_TABLE_DATA = [
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

export const TEMPLATES = [
    { name: "Electronics (Typical)", length: "24", width: "18", height: "12", weight: "45", metric: false },
    { name: "Furniture (Couch)", length: "96", width: "36", height: "40", weight: "150", metric: false },
    { name: "Machinery", length: "36", width: "24", height: "30", weight: "200", metric: false },
    { name: "Textiles (Bolts)", length: "60", width: "48", height: "48", weight: "800", metric: false },
];

export function getFreightClass(density: number): string {
    for (const range of FREIGHT_CLASS_TABLE) {
        if (density >= range.minDensity && density < range.maxDensity) {
            return range.class;
        }
    }
    return "400";
}

export interface CalculatorInputs {
    length: string;
    width: string;
    height: string;
    weight: string;
    useMetric: boolean;
    palletized: boolean;
}

export interface CalculationResult {
    density: number | null;
    freightClass: string | null;
    volume: number | null;
}

export interface SavedLoad {
    id: string;
    name: string;
    inputs: CalculatorInputs;
    result: CalculationResult;
    timestamp: number;
}
