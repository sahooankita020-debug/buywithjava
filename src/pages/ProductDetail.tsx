import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading)
    return (
      <div className="container py-20 text-center text-muted-foreground">
        Loading…
      </div>
    );

  if (!product)
    return (
      <div className="container py-20 text-center">
        Product not found
      </div>
    );

  const inStock = product.stock > 0 && product.is_active;
  const maxQty = product.stock;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      quantity: qty,
      price: Number(product.price),
      clubId: product.vendor_id,     // 🔥 FIX
      clubName: "Vendor",            // 🔥 Temporary (replace later if needed)
    });

    toast({
      title: `${product.name} × ${qty} added to cart`,
    });
  };

  return (
    <div className="container py-8 max-w-3xl">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to menu
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        </div>

        {product.description && (
          <p className="text-muted-foreground">{product.description}</p>
        )}

        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-xs text-muted-foreground">Stock</div>
            <div className="font-bold text-lg">{product.stock}</div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4 pt-4 border-t">
          <span className="text-2xl font-bold">
            R{Number(product.price).toFixed(2)}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQty(Math.max(1, qty - 1))}
              disabled={qty <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>

            <span className="w-10 text-center font-medium">{qty}</span>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setQty(Math.min(maxQty, qty + 1))}
              disabled={qty >= maxQty}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            disabled={!inStock}
            onClick={handleAdd}
            className="ml-auto"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>
    </div>
  );
}