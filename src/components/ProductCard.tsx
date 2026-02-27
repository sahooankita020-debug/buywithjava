import { Link } from "react-router-dom";
import { Product, getDefaultPrice, isInStock, isUnitBased } from "@/lib/product-utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { ShoppingCart } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function ProductCard({ product }: { product: Product }) {
  const price = getDefaultPrice(product);
  const inStock = isInStock(product);
  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const success = addItem({
      productId: product.id,
      productName: product.name,
      clubId: product.club_id,
      clubName: product.club_name,
      quantity: 1,
      price,
    });
    if (!success) {
      // Different club — show toast with clear option
      toast({
        title: "Different dispensary",
        description: `Your cart has items from another dispensary. Clear cart to add from ${product.club_name}?`,
        action: (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              clearCart();
              addItem({
                productId: product.id,
                productName: product.name,
                clubId: product.club_id,
                clubName: product.club_name,
                quantity: 1,
                price,
              });
              toast({ title: "Cart cleared & item added" });
            }}
          >
            Clear & Add
          </Button>
        ),
      });
      return;
    }
    toast({ title: `${product.name} added to cart` });
  };

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
        <CardContent className="flex-1 pt-6">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display font-semibold leading-tight line-clamp-2">
              {product.name}
            </h3>
            {!inStock && <Badge variant="destructive" className="shrink-0 text-[10px]">Out of Stock</Badge>}
          </div>
          <p className="text-xs text-muted-foreground mb-1">{product.club_name}</p>
          {product.category && (
            <Badge variant="secondary" className="text-[10px] mb-2">{product.category}</Badge>
          )}
          <div className="flex gap-3 text-xs text-muted-foreground mt-2">
            {product.thc != null && product.thc > 0 && <span>THC {product.thc}%</span>}
            {product.cbd != null && product.cbd > 0 && <span>CBD {product.cbd}%</span>}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <span className="font-display text-lg font-bold">R{price.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">{isUnitBased(product) ? "each" : "per g"}</span></span>
          <Button
            size="sm"
            disabled={!inStock}
            onClick={handleAdd}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
