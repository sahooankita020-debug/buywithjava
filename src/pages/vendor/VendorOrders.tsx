import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function VendorOrders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["vendor-orders", user?.id],
    queryFn: async () => {
      const { data: vendor } = await (supabase as any)
        .from("vendors")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (!vendor) return [];

      const { data, error } = await (supabase as any)
        .from("orders")
        .select("*")
        .eq("vendor_id", vendor.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: any) => {
      const { error } = await (supabase as any)
        .from("orders")
        .update({ delivery_status: status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-orders"] });
    },
  });

  if (isLoading) return <div>Loading orders...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 && (
        <p className="text-muted-foreground">No orders found.</p>
      )}

      {orders.map((order: any) => (
        <div key={order.id} className="border p-4 rounded mb-4">
          <p>Order ID: {order.id}</p>
          <p>Status: {order.delivery_status}</p>

          <select
            className="border p-2 mt-2"
            value={order.delivery_status}
            onChange={(e) =>
              updateStatus.mutate({
                id: order.id,
                status: e.target.value,
              })
            }
          >
            <option value="Pending">Pending</option>
            <option value="Preparing">Preparing</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      ))}
    </div>
  );
}