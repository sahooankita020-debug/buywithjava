import { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;
export type Order = Tables<"orders">;

export interface PriceEntry {
  type: string;
  value: number;
  qty: number;
}

export function getDefaultPrice(product: Product): number {
  const prices = product.prices as unknown as PriceEntry[] | null;
  if (!prices || prices.length === 0) return 0;
  const perGram = prices.find((p) => p.type === "Per Gram");
  if (perGram) return perGram.value;
  const perUnit = prices.find((p) => p.type === "Per Unit");
  if (perUnit) return perUnit.value;
  return prices[0].value ?? 0;
}

export function isUnitBased(product: Product): boolean {
  return product.units !== "GRAMS";
}

export function isInStock(product: Product): boolean {
  return product.is_active && product.status === "IN_STOCK" && product.stock_available > 0;
}
