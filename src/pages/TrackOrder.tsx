import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  OUT_FOR_DELIVERY: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);

    const { data, error: err } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId.trim())
      .maybeSingle();

    setLoading(false);
    if (err || !data) {
      setError("Order not found. Please check your order ID.");
      return;
    }
    setOrder(data);
  };

  const items = order?.items as unknown as Array<{ productName: string; quantity: number; price: number }> | undefined;

  return (
    <div className="container py-8 max-w-xl">
      <div className="text-center mb-8">
        <Package className="h-12 w-12 text-primary mx-auto mb-3" />
        <h1 className="font-display text-3xl font-bold mb-2">Track Your Order</h1>
        <p className="text-muted-foreground">Enter your order ID to check the status</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <Input
          placeholder="Enter order ID…"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          <Search className="h-4 w-4 mr-1" />
          Track
        </Button>
      </form>

      {error && <p className="text-center text-destructive">{error}</p>}

      {order && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
              <Badge className={statusColors[order.status] || ""}>{order.status.replace(/_/g, " ")}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Placed:</span>{" "}
              {new Date(order.created_at).toLocaleString()}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Delivery to:</span> {order.delivery_address}
            </div>
            {items && (
              <div className="border-t pt-3">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between py-1 text-sm">
                    <span>{item.productName} × {item.quantity}</span>
                    <span>R{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 font-bold border-t mt-2">
                  <span>Total</span>
                  <span>R{order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
