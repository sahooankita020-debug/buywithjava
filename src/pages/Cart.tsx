import { Link } from "react-router-dom";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const clubName = useCartStore((s) => s.clubName);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getTotal = useCartStore((s) => s.getTotal);

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Browse our menu and add some products</p>
        <Link to="/"><Button>Browse Menu</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="font-display text-3xl font-bold mb-2">Your Cart</h1>
      {clubName && <p className="text-sm text-muted-foreground mb-6">Ordering from: {clubName}</p>}

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <Card key={item.productId}>
            <CardContent className="flex items-center justify-between py-4 px-4">
              <div className="flex-1 min-w-0 mr-4">
                <p className="font-medium truncate">{item.productName}</p>
                <p className="text-sm text-muted-foreground">R{item.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(item.productId)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="w-24 text-right font-display font-bold">
                R{(item.price * item.quantity).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between border-t pt-4 mb-6">
        <span className="text-lg font-medium">Subtotal</span>
        <span className="font-display text-2xl font-bold">R{getTotal().toFixed(2)}</span>
      </div>

      <Link to="/checkout">
        <Button className="w-full" size="lg">Proceed to Checkout</Button>
      </Link>
    </div>
  );
}
