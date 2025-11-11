// src/utils/color.ts
// Tiny color helpers shared across components.

export function alphaTint(input: string, alpha = 0.12): string {
    // Normalize alpha and support hsl(), rgb(), #hex and CSS var() tokens.
    const a = Math.max(0, Math.min(1, alpha));
    if (input.startsWith("hsl(")) return input.replace(/\)$/, ` / ${a})`);
    if (input.startsWith("rgb("))
        return input.replace(/^rgb\(/, "rgba(").replace(/\)$/, `, ${a})`);
    if (input.startsWith("#")) {
        const hex = input.slice(1);
        const norm =
            hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
        const r = parseInt(norm.slice(0, 2), 16);
        const g = parseInt(norm.slice(2, 4), 16);
        const b = parseInt(norm.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    if (input.startsWith("var(")) return `hsl(${input} / ${a})`;
    return "rgba(0,0,0,0.06)";
}