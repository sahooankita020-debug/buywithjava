import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const items = useCartStore((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="BuyWithJava" className="h-10 w-auto" />
        </Link>

        {/* Middle Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">

          <Link to="/about" className="hover:text-primary transition">
            About Us
          </Link>

          <Link to="/contact" className="hover:text-primary transition">
            Contact
          </Link>

          {/* Sell With Us Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Sell With Us
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/vendor/signup">
                  Become a Vendor
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to="/vendor/login">
                  Login (Existing Vendor)
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">

          <Link to="/track">
            <Button variant="ghost" size="sm">
              Track Order
            </Button>
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

        </div>
      </div>
    </header>
  );
}