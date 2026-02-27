import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import logo from "@/assets/logo.png";

export function Header() {
  const items = useCartStore((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="BuyWithJava" className="h-10 w-auto" />
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/track">
            <Button variant="ghost" size="sm">Track Order</Button>
          </Link>
          <Link to="/cart" className="relative">
            <Button variant="outline" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
