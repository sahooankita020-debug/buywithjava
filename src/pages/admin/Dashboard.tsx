import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, Clock, TruckIcon } from "lucide-react";

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, orders] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, status, total_amount"),
      ]);

      const ordersList = orders.data || [];
      const pending = ordersList.filter((o) => o.status === "PENDING").length;
      const delivering = ordersList.filter((o) => o.status === "OUT_FOR_DELIVERY").length;
      const revenue = ordersList.reduce((sum, o) => sum + (o.total_amount || 0), 0);

      return {
        totalProducts: products.count || 0,
        totalOrders: ordersList.length,
        pendingOrders: pending,
        deliveringOrders: delivering,
        totalRevenue: revenue,
      };
    },
  });

  const cards = [
    { label: "Products", value: stats?.totalProducts ?? 0, icon: Package, color: "text-primary" },
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: "text-accent" },
    { label: "Pending", value: stats?.pendingOrders ?? 0, icon: Clock, color: "text-yellow-500" },
    { label: "Delivering", value: stats?.deliveringOrders ?? 0, icon: TruckIcon, color: "text-blue-500" },
  ];

  return (
    <div className="p-6">
      <h1 className="font-display text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl font-bold">R{stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
