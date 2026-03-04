import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function TrackOrder() {

  const [orderId,setOrderId] = useState("");
  const [order,setOrder] = useState<any>(null);
  const [error,setError] = useState("");

  const searchOrder = async()=>{

    setError("");

    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number",orderId)
      .single();

    if(!data){
      setError("Order not found");
      return;
    }

    setOrder(data);

  };

  return (

    <div className="container py-10 max-w-xl">

      <h1 className="text-3xl font-bold text-center mb-6">
        Track Order
      </h1>

      <div className="flex gap-2 mb-6">

        <Input
          placeholder="Enter Order ID"
          value={orderId}
          onChange={(e)=>setOrderId(e.target.value)}
        />

        <Button onClick={searchOrder}>
          Track
        </Button>

      </div>

      {error && (
        <p className="text-red-500 text-center">
          {error}
        </p>
      )}

      {order && (

        <Card>

          <CardContent className="space-y-3 p-6">

            <div>
              <b>Status:</b> {order.delivery_status}
            </div>

            <div>
              <b>Name:</b> {order.customer_name}
            </div>

            <div>
              <b>Phone:</b> {order.customer_phone}
            </div>

            <div>
              <b>Address:</b> {order.delivery_address}
            </div>

          </CardContent>

        </Card>

      )}

    </div>

  );

}