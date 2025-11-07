// src/constants/categories.ts

// --- category label union ---
export type CategoryLabel =
    | "Default"
    | "Produce"
    | "Dairy"
    | "Meat & Fish"
    | "Bakery"
    | "Pantry (Dry)"
    | "Beverages"
    | "Frozen"
    | "Snacks & Sweets"
    | "Household & Care";

// --- PNG-Icons ---
import producePng from "../assets/category-icons/produce.png";
import dairyPng from "../assets/category-icons/dairy.png";
import meatPng from "../assets/category-icons/meat.png";
import backeryPng from "../assets/category-icons/backery.png";
import pantryPng from "../assets/category-icons/pantry.png";
import beveragesPng from "../assets/category-icons/beverages.png";
import frozenPng from "../assets/category-icons/frozen.png";
import snacksPng from "../assets/category-icons/snacks.png";
import housholdPng from "../assets/category-icons/houshold.png";

// Central: Label -> Icon (Default has no icon)
export const CATEGORY_ICON_BY_LABEL: Record<CategoryLabel, string | null> = {
    Default: null,
    Produce: producePng,
    Dairy: dairyPng,
    "Meat & Fish": meatPng,
    Bakery: backeryPng,
    "Pantry (Dry)": pantryPng,
    Beverages: beveragesPng,
    Frozen: frozenPng,
    "Snacks & Sweets": snacksPng,
    "Household & Care": housholdPng,
};

// --- NEW: central lists for UI ---

/** Default category used when none selected */
export const CATEGORY_DEFAULT: CategoryLabel = "Default";

/** Ordered list of categories for selects & validation */
export const CATEGORIES = [
    "Default",
    "Produce",
    "Dairy",
    "Meat & Fish",
    "Bakery",
    "Pantry (Dry)",
    "Beverages",
    "Frozen",
    "Snacks & Sweets",
    "Household & Care",
] as const satisfies readonly CategoryLabel[];

/** Supported units for amounts */
export const UNITS = ["pcs", "kg", "g", "L", "mL", "pack"] as const;

/** Unit type derived from UNITS */
export type Unit = (typeof UNITS)[number];