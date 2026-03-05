import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/lib/cart-store";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Checkout() {

  const items = useCartStore((s) => s.items);
  const clubId = useCartStore((s) => s.clubId);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const navigate = useNavigate();

  const [form,setForm] = useState({
    name:"",
    phone:"",
    email:"",
    address:"",
  });

  const [paymentMethod,setPaymentMethod] = useState<"ozow" | "cod">("ozow");

  const [loading,setLoading] = useState(false);

  const handleSubmit = async(e:React.FormEvent)=>{

    e.preventDefault();

    if(!form.name || !form.phone || !form.address){
      toast({
        title:"Please fill all required fields",
        variant:"destructive"
      });
      return;
    }

    setLoading(true);

    try{

      const orderNumber = Math.floor(
        100000000000 + Math.random()*900000000000
      ).toString();

      const {data,error} = await supabase
      .from("orders")
      .insert({
        order_number:orderNumber,
        customer_name:form.name,
        customer_phone:form.phone,
        customer_email:form.email,
        delivery_address:form.address,
        vendor_id:clubId!,
        items:items as any,
        total_amount:getTotal(),
        delivery_status:"Order Placed",
        payment_method:paymentMethod
      })
      .select()
      .single();

      if(error) throw error;

      clearCart();

      navigate(`/order/${data.id}`);

    }catch(err:any){

      toast({
        title:"Failed to place order",
        description:err.message,
        variant:"destructive"
      });

    }finally{
      setLoading(false);
    }

  };

  return (

  <div className="container py-8 max-w-2xl">

  <h1 className="text-3xl font-bold mb-6">
  Checkout
  </h1>

  <form onSubmit={handleSubmit} className="space-y-6">

  <Card>

  <CardHeader>
  <CardTitle>Delivery Details</CardTitle>
  </CardHeader>

  <CardContent className="space-y-4">

  <div>
  <Label>Full Name *</Label>
  <Input
  value={form.name}
  onChange={(e)=>setForm({...form,name:e.target.value})}
  />
  </div>

  <div>
  <Label>Phone *</Label>
  <Input
  value={form.phone}
  onChange={(e)=>setForm({...form,phone:e.target.value})}
  />
  </div>

  <div>
  <Label>Email</Label>
  <Input
  value={form.email}
  onChange={(e)=>setForm({...form,email:e.target.value})}
  />
  </div>

  <div>
  <Label>Address *</Label>
  <Textarea
  value={form.address}
  onChange={(e)=>setForm({...form,address:e.target.value})}
  />
  </div>

  </CardContent>

  </Card>

  <Card>

  <CardHeader>
  <CardTitle>Payment Method</CardTitle>
  </CardHeader>

  <CardContent>

  <RadioGroup
  value={paymentMethod}
  onValueChange={(v)=>setPaymentMethod(v as "ozow" | "cod")}
  className="space-y-3"
  >

  <div className="flex items-center space-x-3 border rounded-lg p-4">

  <RadioGroupItem value="ozow" id="ozow"/>

  <Label htmlFor="ozow" className="cursor-pointer">
  ⚡ Instant EFT (Ozow)
  </Label>

  </div>

  <div className="flex items-center space-x-3 border rounded-lg p-4">

  <RadioGroupItem value="cod" id="cod"/>

  <Label htmlFor="cod" className="cursor-pointer">
  💵 Cash On Delivery
  </Label>

  </div>

  </RadioGroup>

  </CardContent>

  </Card>

  <Card>

  <CardHeader>
  <CardTitle>Order Summary</CardTitle>
  </CardHeader>

  <CardContent>

  {items.map((item)=>(
  <div key={item.productId} className="flex justify-between py-2">

  <span>
  {item.productName} × {item.quantity}
  </span>

  <span>
  R{(item.price*item.quantity).toFixed(2)}
  </span>

  </div>
  ))}

  <div className="flex justify-between pt-4 font-bold">

  <span>Total</span>

  <span>
  R{getTotal().toFixed(2)}
  </span>

  </div>

  </CardContent>

  </Card>

  <Button type="submit" className="w-full">

  {loading && (
  <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
  )}

  Place Order

  </Button>

  </form>

  </div>

  );

}