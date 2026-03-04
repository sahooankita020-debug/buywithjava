import { Link, Outlet } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

const Layout = () => {

  const items = useCartStore((s) => s.items);

  return (
    <div className="min-h-screen flex flex-col">

      {/* Navbar */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">

          {/* Logo */}
          <Link to="/" className="text-xl font-bold">
            Buy With Java
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6 text-sm font-medium">

            <Link to="/about" className="hover:text-purple-600">
              About Us
            </Link>

            <Link to="/contact" className="hover:text-purple-600">
              Contact
            </Link>

            <Link to="/vendor/signup" className="hover:text-purple-600">
              Sell With Us
            </Link>

            {/* Track Order */}
            <Link to="/track" className="hover:text-purple-600">
              Track Order
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative hover:text-purple-600">

              <ShoppingCart className="h-5 w-5" />

              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {items.length}
                </span>
              )}

            </Link>

          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Buy With Java. All rights reserved.
      </footer>

    </div>
  );
};

export default Layout;