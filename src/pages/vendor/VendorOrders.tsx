import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  items: {
    productName: string;
    quantity: number;
    price: number;
  }[];
  total_amount: number;
  delivery_status: string;
  created_at: string;
}

const STATUS_OPTIONS = [
  "Order Placed",
  "Payment Success",
  "Preparing",
  "Out For Delivery",
  "Delivered",
  "Cancelled"
];

export default function VendorOrders() {

  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [newOrders, setNewOrders] = useState(0);

  // 🔹 Get vendor id
  const fetchVendorId = async () => {

    if (!user) return;

    const { data, error } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (error) return;

    if (data) setVendorId(data.id);
  };

  // 🔹 Fetch orders
  const fetchOrders = async () => {

    if (!vendorId) return;

    const { data, error } = await supabase
      .from("orders")
      .select("id, customer_name, customer_phone, delivery_address, items, total_amount, delivery_status, created_at")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });

    if (error) {

      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });

      return;
    }

    const ordersData = (data || []) as unknown as Order[];

    setOrders(ordersData);

    // 🔴 Count new orders
    const pending = ordersData.filter(
      (o) => o.delivery_status === "Order Placed"
    );

    setNewOrders(pending.length);

  };

  useEffect(() => {
    fetchVendorId();
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [vendorId]);

  // 🔹 Update status
  const updateStatus = async (orderId: string, status: string) => {

    const { error } = await supabase
      .from("orders")
      .update({ delivery_status: status })
      .eq("id", orderId);

    if (error) {

      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });

      return;
    }

    toast({ title: "Order status updated" });

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, delivery_status: status } : o
      )
    );

  };

  return (

    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">

        <h2 className="text-xl font-semibold">
          Vendor Orders
        </h2>

        {newOrders > 0 && (
          <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
            {newOrders} New Orders
          </span>
        )}

      </div>

      <Table>

        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Change Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>

          {orders.map((order) => (

            <TableRow key={order.id}>

              <TableCell>
                {order.customer_name}
              </TableCell>

              <TableCell>
                {order.customer_phone}
              </TableCell>

              <TableCell>
                {order.delivery_address}
              </TableCell>

              <TableCell>

                {order.items?.map((item, i) => (
                  <div key={i}>
                    {item.productName} × {item.quantity}
                  </div>
                ))}

              </TableCell>

              <TableCell>
                R {order.total_amount}
              </TableCell>

              <TableCell>
                {order.delivery_status || "Order Placed"}
              </TableCell>

              <TableCell>

                <Select
                  value={order.delivery_status || "Order Placed"}
                  onValueChange={(value) =>
                    updateStatus(order.id, value)
                  }
                >

                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>

                    {STATUS_OPTIONS.map((status) => (

                      <SelectItem
                        key={status}
                        value={status}
                      >

                        {status}

                      </SelectItem>

                    ))}

                  </SelectContent>

                </Select>

              </TableCell>

            </TableRow>

          ))}

        </TableBody>

      </Table>

    </div>

  );

}