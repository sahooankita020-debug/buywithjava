import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function PaymentFailed() {
  return (
    <div className="container py-20 text-center max-w-md">
      <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
      <h1 className="font-display text-3xl font-bold mb-2">Payment Failed</h1>
      <p className="text-muted-foreground mb-6">
        Something went wrong with your payment. Please try again or choose a different payment method.
      </p>
      <div className="flex gap-3 justify-center">
        <Link to="/cart"><Button variant="outline">Back to Cart</Button></Link>
        <Link to="/checkout"><Button>Try Again</Button></Link>
      </div>
    </div>
  );
}
