import { Leaf, Truck, ShieldCheck } from "lucide-react";

export default function About() {
  return (
    <div className="container py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        About Us
      </h1>

      <p className="text-muted-foreground text-lg text-center mb-12">
        BuyWithJava is a trusted cannabis marketplace connecting customers
        with verified dispensaries across Johannesburg. We focus on quality,
        safety, and fast delivery.
      </p>

      <div className="grid md:grid-cols-3 gap-8">

        <div className="p-6 rounded-xl border bg-card text-center">
          <Leaf className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h3 className="text-lg font-semibold mb-2">
            Premium Quality
          </h3>
          <p className="text-muted-foreground text-sm">
            We partner with trusted vendors to ensure top-quality products.
          </p>
        </div>

        <div className="p-6 rounded-xl border bg-card text-center">
          <Truck className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h3 className="text-lg font-semibold mb-2">
            Fast Delivery
          </h3>
          <p className="text-muted-foreground text-sm">
            Quick and discreet delivery directly to your door.
          </p>
        </div>

        <div className="p-6 rounded-xl border bg-card text-center">
          <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h3 className="text-lg font-semibold mb-2">
            Safe & Secure
          </h3>
          <p className="text-muted-foreground text-sm">
            Secure checkout and trusted vendor verification process.
          </p>
        </div>

      </div>
    </div>
  );
}