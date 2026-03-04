import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  is_active: boolean;
}

const VendorStore = () => {
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<Record<string, string>>({});

  // 🔹 Get vendor id
  const fetchVendorId = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (data) setVendorId(data.id);
  };

  // 🔹 Get vendor products
  const fetchProducts = async () => {
    if (!vendorId) return;

    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("vendor_id", vendorId);

    if (data) setProducts(data);
  };

  useEffect(() => {
    fetchVendorId();
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [vendorId]);

  // 🔹 Update price
  const updatePrice = async (id: string) => {
    const newPrice = Number(editingPrice[id]);

    const { error } = await supabase
      .from("products")
      .update({ price: newPrice })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Price updated" });

    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, price: newPrice } : p
      )
    );
  };

  // 🔹 Toggle stock
  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !current })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: !current ? "Product Available" : "Product Out of Stock",
    });

    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, is_active: !current } : p
      )
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Store Management</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price (R)</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>

              {/* Price edit */}
              <TableCell>
                <Input
                  type="number"
                  className="w-28"
                  value={editingPrice[p.id] ?? String(p.price)}
                  onChange={(e) =>
                    setEditingPrice({
                      ...editingPrice,
                      [p.id]: e.target.value,
                    })
                  }
                  onBlur={() => updatePrice(p.id)}
                />
              </TableCell>

              {/* Stock */}
              <TableCell>{p.stock}</TableCell>

              {/* Toggle */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={p.is_active}
                    onCheckedChange={() =>
                      toggleActive(p.id, p.is_active)
                    }
                  />
                  <span>
                    {p.is_active ? "Available" : "Out of Stock"}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VendorStore;