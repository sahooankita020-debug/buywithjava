import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";

export default function VendorPage() {
  const { slug } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["vendor", slug],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("vendors")
        .select(`
          *,
          products (*)
        `)
        .eq("store_slug", slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return <div className="container py-20">Loading...</div>;
  }

  if (!data) {
    return (
      <div className="container py-20 text-center">
        Vendor not found
      </div>
    );
  }

  return (
    <div className="container py-8">

      {/* Premium Vendor Banner */}
      <div className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 to-primary/5 p-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-3">
            {data.store_name}
          </h1>

          <p className="text-muted-foreground mb-6 text-lg">
            {data.description || "Premium cannabis products delivered safely and discreetly."}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
            <span>🌿 {data.products?.length || 0} Products</span>
            <span>🚚 Fast Delivery</span>
            <span>⭐ Trusted Vendor</span>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.products?.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

    </div>
  );
}