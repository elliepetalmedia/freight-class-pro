import { useState, useEffect } from "react";

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

export interface HistoryEntry {
    id: string;
    timestamp: number;
    inputs: CalculatorInputs;
    result: CalculationResult;
}

export function useCalculationHistory() {
    const [entries, setEntries] = useState<HistoryEntry[]>(() => {
        try {
            const stored = localStorage.getItem("freightClassHistory");
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("freightClassHistory", JSON.stringify(entries));
    }, [entries]);

    const add = (inputs: CalculatorInputs, result: CalculationResult) => {
        setEntries(prev => {
            // Don't add if it's identical to the most recent entry
            if (prev.length > 0) {
                const last = prev[0];
                if (
                    last.result.freightClass === result.freightClass &&
                    last.result.density === result.density &&
                    last.inputs.length === inputs.length &&
                    last.inputs.width === inputs.width &&
                    last.inputs.height === inputs.height &&
                    last.inputs.weight === inputs.weight &&
                    last.inputs.useMetric === inputs.useMetric &&
                    last.inputs.palletized === inputs.palletized
                ) {
                    return prev;
                }
            }

            const newEntry: HistoryEntry = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                inputs,
                result
            };

            return [newEntry, ...prev].slice(0, 10);
        });
    };

    const clear = () => setEntries([]);

    return { entries, add, clear };
}
