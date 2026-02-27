import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  OUT_FOR_DELIVERY: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="container py-20 text-center text-muted-foreground">Loading…</div>;
  if (!order) return <div className="container py-20 text-center">Order not found</div>;

  const items = order.items as unknown as Array<{ productName: string; quantity: number; price: number }>;

  return (
    <div className="container py-8 max-w-2xl">
      <div className="text-center mb-8">
        <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="font-display text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">Thank you for your order. Save your order ID to track it.</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
            <Badge className={statusColors[order.status] || ""}>{order.status.replace(/_/g, " ")}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <span className="text-muted-foreground">Name:</span> {order.customer_name}
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Phone:</span> {order.customer_phone}
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Address:</span> {order.delivery_address}
          </div>
          <div className="border-t pt-3">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between py-1">
                <span>{item.productName} × {item.quantity}</span>
                <span>R{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-3 font-display font-bold border-t mt-2">
              <span>Total</span>
              <span>R{order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-center">
        <Link to="/"><Button variant="outline">Back to Menu</Button></Link>
        <Link to="/track"><Button>Track Order</Button></Link>
      </div>
    </div>
  );
}
