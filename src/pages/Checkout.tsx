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
import { Loader2, CreditCard, Building2 } from "lucide-react";

export default function Checkout() {
  const items = useCartStore((s) => s.items);
  const clubId = useCartStore((s) => s.clubId);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [paymentMethod, setPaymentMethod] = useState<"eft" | "card">("eft");
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Re-validate stock
      const productIds = items.map((i) => i.productId);
      const { data: products } = await supabase
        .from("products")
        .select("id, stock_available, name")
        .in("id", productIds);

      if (products) {
        for (const item of items) {
          const p = products.find((pr) => pr.id === item.productId);
          if (!p || p.stock_available < item.quantity) {
            toast({
              title: `${item.productName} is no longer available in the requested quantity`,
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
        }
      }

      const { data, error } = await supabase.from("orders").insert({
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email,
        delivery_address: form.address,
        club_id: clubId!,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          price: i.price,
        })),
        total_amount: getTotal(),
      }).select("id").single();

      if (error) throw error;

      clearCart();

      if (paymentMethod === "card") {
        // Stripe integration placeholder — redirect to payment page
        navigate(`/payment/success?order=${data.id}`);
      } else {
        // EFT — go to order confirmation with banking details
        navigate(`/order/${data.id}`);
      }
    } catch (err: any) {
      toast({ title: "Failed to place order", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="font-display text-3xl font-bold mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Delivery Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="address">Delivery Address *</Label>
              <Textarea id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "eft" | "card")} className="space-y-3">
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="eft" id="eft" />
                <Label htmlFor="eft" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">EFT / Bank Transfer</p>
                    <p className="text-xs text-muted-foreground">Pay via manual bank transfer</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Card Payment</p>
                    <p className="text-xs text-muted-foreground">Pay with credit or debit card (Stripe)</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
          <CardContent>
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between py-2 border-b last:border-0">
                <span>{item.productName} × {item.quantity}</span>
                <span className="font-medium">R{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-4 font-display font-bold text-lg">
              <span>Total</span>
              <span>R{getTotal().toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">No delivery fees</p>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Place Order
        </Button>
      </form>
    </div>
  );
}
