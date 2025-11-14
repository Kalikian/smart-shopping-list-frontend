// src/components/list-item/QuantityField.tsx
// Mobile-friendly quantity input with +/- steppers.

import { useTranslation } from "react-i18next";
import type { Unit } from "../../constants/categories";

type Props = {
  id: string;
  amount?: number;
  unit?: Unit;
  onChange: (next?: number) => void;
};

export default function QuantityField({ id, amount, unit, onChange }: Props) {
  const { t } = useTranslation("common");

  // Decimal for kg/L, integer otherwise
  const isDecimal = unit === "kg" || unit === "L";
  const step = isDecimal ? 0.1 : 1;

  const parseAmount = (raw: string): number | undefined => {
    const norm = raw.trim().replace(",", ".");
    if (norm === "") return undefined;
    const num = Number(norm);
    if (!Number.isFinite(num) || num < 0) return 0;
    return isDecimal ? Math.round(num * 10) / 10 : Math.trunc(num);
  };

  const inc = () => {
    const base = amount ?? 1;
    const next = isDecimal
      ? Math.round((base + step) * 10) / 10
      : Math.max(0, Math.trunc(base + step));
    onChange(next);
  };

  const dec = () => {
    const base = amount ?? 1;
    const nextRaw = base - step;
    const next = isDecimal
      ? Math.max(0, Math.round(nextRaw * 10) / 10)
      : Math.max(0, Math.trunc(nextRaw));
    onChange(next);
  };

  const onAmountTyped: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange(parseAmount(e.target.value));
  };

  const onAmountKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    const allowed = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End",
    ];
    const decimalChars = [",", "."];
    if (allowed.includes(e.key)) return;
    if (decimalChars.includes(e.key) && isDecimal) return;
    if (!/^[0-9]$/.test(e.key)) e.preventDefault();
  };

  return (
    <div className="block sm:basis-0 sm:flex-1">
      <label
        htmlFor={id}
        className="block text-xs font-medium text-slate-500 mb-1"
      >
        {/* Visible label uses translated amount label */}
        {t("item.amountLabel")}
      </label>

      <div className="sm:flex sm:justify-center">
        <div
          className="inline-flex sm:w-full sm:max-w-60 items-stretch rounded-full border border-black/10 bg-white overflow-hidden
                     transition focus-within:border-[hsl(var(--accent))] focus-within:ring-2 focus-within:ring-[hsl(var(--accent))/0.35]"
        >
          <button
            type="button"
            onClick={dec}
            className="w-10 h-10 grid place-items-center select-none hover:bg-slate-50 focus:outline-none"
            aria-label="Decrease quantity"
            title="Decrease"
          >
            –
          </button>

          <input
            id={id}
            type="text"
            inputMode={isDecimal ? "decimal" : "numeric"}
            onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
            className="h-10 w-20 sm:w-24 text-center outline-none px-2 border-0 focus:ring-0"
            value={amount ?? ""}
            onChange={onAmountTyped}
            onKeyDown={onAmountKeyDown}
            aria-label={t("item.amountLabel")}
          />

          <button
            type="button"
            onClick={inc}
            className="w-10 h-10 grid place-items-center select-none hover:bg-slate-50 focus:outline-none"
            aria-label="Increase quantity"
            title="Increase"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
