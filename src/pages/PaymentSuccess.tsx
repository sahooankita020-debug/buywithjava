import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get("order");

  return (
    <div className="container py-20 text-center max-w-md">
      <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
      <h1 className="font-display text-3xl font-bold mb-2">Payment Successful!</h1>
      <p className="text-muted-foreground mb-6">
        Your payment has been confirmed. Your order is being processed.
      </p>
      {orderId && (
        <p className="text-sm text-muted-foreground mb-6">
          Order ID: <span className="font-mono font-medium text-foreground">{orderId.slice(0, 8)}</span>
        </p>
      )}
      <div className="flex gap-3 justify-center">
        <Link to="/"><Button variant="outline">Back to Menu</Button></Link>
        <Link to="/track"><Button>Track Order</Button></Link>
      </div>
    </div>
  );
}
