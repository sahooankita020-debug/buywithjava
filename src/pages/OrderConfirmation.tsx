import { useParams,Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card,CardContent,CardHeader,CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle,Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Order{
id:string
order_number:string
customer_name:string
customer_phone:string
delivery_address:string
items:any
total_amount:number
delivery_status:string
payment_method:string
}

export default function OrderConfirmation(){

const {id} = useParams()

const {data:order} = useQuery<Order>({
queryKey:["order",id],
queryFn:async()=>{

const {data,error} = await supabase
.from("orders")
.select("*")
.eq("id",id!)
.single()

if(error) throw error

return data as unknown as Order

},
enabled:!!id
})

if(!order) return null

const items = order.items || []

const copyOrder=()=>{

navigator.clipboard.writeText(order.order_number)

toast({
title:"Order ID copied"
})

}

return(

<div className="container py-8 max-w-2xl">

<div className="text-center mb-8">

<CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4"/>

<h1 className="text-3xl font-bold">
Order Confirmed!
</h1>

<p className="text-muted-foreground">
Save your Order ID to track your order
</p>

</div>

<Card>

<CardHeader>

<CardTitle className="flex justify-between">

<span>Order ID</span>

<Badge>{order.delivery_status}</Badge>

</CardTitle>

</CardHeader>

<CardContent className="space-y-4">

<div className="flex items-center justify-between">

<span className="font-mono text-lg">
{order.order_number}
</span>

<Button size="sm" onClick={copyOrder}>
<Copy className="h-4 w-4 mr-1"/>
Copy
</Button>

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

<div>
<b>Payment:</b> {order.payment_method === "ozow" ? "Instant EFT (Ozow)" : "Cash On Delivery"}
</div>

<div className="border-t pt-3">

{items.map((item:any,i:number)=>(
<div key={i} className="flex justify-between py-1">

<span>
{item.productName} × {item.quantity}
</span>

<span>
R{(item.price*item.quantity).toFixed(2)}
</span>

</div>
))}

<div className="flex justify-between pt-3 font-bold border-t">

<span>Total</span>

<span>
R{order.total_amount.toFixed(2)}
</span>

</div>

</div>

</CardContent>

</Card>

<div className="flex gap-3 justify-center mt-6">

<Link to="/">
<Button variant="outline">
Back to Menu
</Button>
</Link>

<Link to="/track">
<Button>
Track Order
</Button>
</Link>

</div>

</div>

)

}