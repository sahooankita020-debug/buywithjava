import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product, getDefaultPrice, isInStock, isUnitBased, PriceEntry } from "@/lib/product-utils";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as Product;
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="container py-20 text-center text-muted-foreground">Loading…</div>;
  if (!product) return <div className="container py-20 text-center">Product not found</div>;

  const prices = (product.prices as unknown as PriceEntry[]) || [];
  const defaultPrice = getDefaultPrice(product);
  const inStock = isInStock(product);
  const maxQty = product.stock_available;

  const handleAdd = () => {
    const success = addItem({
      productId: product.id,
      productName: product.name,
      clubId: product.club_id,
      clubName: product.club_name,
      quantity: qty,
      price: defaultPrice,
    });
    if (!success) {
      toast({
        title: "Different dispensary",
        description: `Clear cart to add from ${product.club_name}?`,
        action: (
          <Button variant="destructive" size="sm" onClick={() => {
            clearCart();
            addItem({ productId: product.id, productName: product.name, clubId: product.club_id, clubName: product.club_name, quantity: qty, price: defaultPrice });
            toast({ title: "Cart cleared & item added" });
          }}>Clear & Add</Button>
        ),
      });
      return;
    }
    toast({ title: `${product.name} × ${qty} added to cart` });
  };

  return (
    <div className="container py-8 max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to menu
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">{product.name}</h1>
          <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
            <span>{product.club_name}</span>
            {product.category && <Badge variant="secondary">{product.category}</Badge>}
            {product.brand && <span>• {product.brand}</span>}
          </div>
        </div>

        {product.description && <p className="text-muted-foreground">{product.description}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {product.thc != null && product.thc > 0 && (
            <Card><CardContent className="pt-4 text-center"><div className="text-xs text-muted-foreground">THC</div><div className="font-display font-bold text-lg">{product.thc}%</div></CardContent></Card>
          )}
          {product.cbd != null && product.cbd > 0 && (
            <Card><CardContent className="pt-4 text-center"><div className="text-xs text-muted-foreground">CBD</div><div className="font-display font-bold text-lg">{product.cbd}%</div></CardContent></Card>
          )}
          {product.jar_weight != null && product.jar_weight > 0 && (
            <Card><CardContent className="pt-4 text-center"><div className="text-xs text-muted-foreground">Weight</div><div className="font-display font-bold text-lg">{product.jar_weight}g</div></CardContent></Card>
          )}
          <Card><CardContent className="pt-4 text-center"><div className="text-xs text-muted-foreground">Stock</div><div className="font-display font-bold text-lg">{product.stock_available}</div></CardContent></Card>
        </div>

        {product.tags && (
          <div className="flex flex-wrap gap-1">
            {product.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}

        {/* Price table */}
        {prices.length > 0 && (
          <div>
            <h2 className="font-display font-semibold text-lg mb-2">Price Tiers</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prices.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell>{p.qty}g{p.type === "Discount" ? " (discount)" : ""}</TableCell>
                    <TableCell className="text-right font-medium">R{p.value.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Add to cart */}
        <div className="flex items-center gap-4 pt-4 border-t">
          <span className="font-display text-2xl font-bold">R{defaultPrice.toFixed(2)} <span className="text-base font-normal text-muted-foreground">{isUnitBased(product) ? "each" : "per g"}</span></span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-10 text-center font-medium">{qty}</span>
            <Button variant="outline" size="icon" onClick={() => setQty(Math.min(maxQty, qty + 1))} disabled={qty >= maxQty}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button disabled={!inStock} onClick={handleAdd} className="ml-auto">
            <ShoppingCart className="h-4 w-4 mr-2" />
            {inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>
    </div>
  );
}
