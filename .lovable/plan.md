
# Add New Products, Categories & Weekly Specials

## Overview

Add new product categories (Drinks, Edibles, Rolling Papers, Prerolls, Weekly Specials) and new Indoor AA strains to the menu.

## 1. New Products to Add

### Drinks (new category)
| Product | Price | Notes |
|---|---|---|
| Sodaze Can | R79 (per unit) | High THC |
| Lucky Club Can | R79 (per unit) | High THC |
| Pops Soda Can | R55 (per unit) | CBD |
| Im Potent Can | R55 (per unit) | CBD |

### Rolling Papers (new category)
| Product | Price |
|---|---|
| Raw Classic Rolling Papers | R55 |
| Raw Natural Rolling Papers | R50 |
| OCB Rolling Papers | R35 |

### Edibles (new category)
| Product | Price |
|---|---|
| Sky Gummies | R18 each, R140 for 10 |

### Prerolls (new category)
| Product | Price |
|---|---|
| Coconut Chalice AAA | R80 per preroll |

### Indoor AA (existing category -- add new strains)
| Product | Price |
|---|---|
| Pineapple Express | R130/g, R210 for 2g |
| Blunicorn | R130/g, R210 for 2g |

Note: "Break Pad Breath" already exists as "Brake Pad Breath" in Indoor AA, so it won't be duplicated.

### Weekly Specials (new section)
| Product | Deal |
|---|---|
| Jelly Breath (Tunnel Indica) | 3g for R200 -- buy 2g get 1 free |

## 2. Database Changes

Insert new products into the `products` table with appropriate pricing JSON:
- Drinks, Papers, Prerolls use flat unit pricing: `[{"type":"Per Unit","value":79,"qty":1}]`
- Sky Gummies uses tiered pricing: `[{"type":"Per Unit","value":18,"qty":1},{"type":"Discount","value":140,"qty":10}]`
- Indoor AA uses existing gram pricing format
- Weekly special: `[{"type":"Per Gram","value":100,"qty":1},{"type":"Special","value":200,"qty":3}]`

## 3. UI Changes

### Price display updates
- Update `getDefaultPrice` in `product-utils.ts` to also handle "Per Unit" price type
- Update `ProductCard.tsx` to show "each" instead of "per g" for non-gram products (Drinks, Papers, Prerolls, Edibles)
- Update `ProductDetail.tsx` similarly for the detail page labels

### Weekly Specials section
- Add a dedicated "Weekly Specials" banner/section on the homepage above the regular product grid
- Query products tagged with "weekly-special" and display them with the deal description highlighted (e.g., "3g for R200 -- Buy 2g Get 1 Free")
- The Jelly Breath product in Tunnel stays as-is; a separate entry tagged as a weekly special will be created

## 4. Files to Change

1. **Database** -- Insert ~9 new product rows via data tool
2. **`src/lib/product-utils.ts`** -- Add "Per Unit" support to `getDefaultPrice`
3. **`src/components/ProductCard.tsx`** -- Show "each" vs "per g" based on product units
4. **`src/pages/ProductDetail.tsx`** -- Same unit label logic for detail page
5. **`src/pages/Index.tsx`** -- Add Weekly Specials section at the top of the product grid
