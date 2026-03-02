import { Outlet, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function VendorLayout() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10">Loading...</div>;

  if (!user) return <Navigate to="/vendor/login" />;

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r p-4 space-y-4">
        <Link to="/vendor/dashboard">Dashboard</Link>
        <br />
        <Link to="/vendor/dashboard/products">Products</Link>
        <br />
        <Link to="/vendor/dashboard/orders">Orders</Link>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}