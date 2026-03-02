import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function VendorProducts() {
  const { user } = useAuth();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["vendor-products", user?.id],
    queryFn: async () => {
      const { data: vendor } = await (supabase as any)
        .from("vendors")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (!vendor) return [];

      const { data, error } = await (supabase as any)
        .from("products")
        .select("*")
        .eq("vendor_id", vendor.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  if (isLoading) return <div>Loading products...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Products</h1>

      {products.length === 0 && (
        <p className="text-muted-foreground">No products added yet.</p>
      )}

      {products.map((product: any) => (
        <div
          key={product.id}
          className="border p-4 rounded mb-4 flex justify-between"
        >
          <div>
            <p className="font-semibold">{product.name}</p>
            <p>Price: R{product.price}</p>
            <p>Stock: {product.stock ?? 0}</p>
            <p>Status: {product.is_active ? "Active" : "Inactive"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}