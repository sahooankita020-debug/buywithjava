import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
}

const VendorProducts = () => {
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
  });

  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  // 🔹 Fetch vendor id
  const fetchVendorId = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (data) setVendorId(data.id);
  };

  // 🔹 Fetch categories
  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id,name")
      .order("name");

    if (data) setCategories(data);
  };

  // 🔹 Fetch products
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
    fetchCategories();
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [vendorId]);

  // 🔹 Add product
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendorId) {
      toast({
        title: "Error",
        description: "Vendor not found",
        variant: "destructive",
      });
      return;
    }

    let categoryId = selectedCategory;

    // 🔹 If "Other" selected → create new category
    if (selectedCategory === "other") {
      const slug = customCategory
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const { data: newCategory, error } = await supabase
        .from("categories")
        .insert({
          name: customCategory,
          slug: slug,
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      categoryId = newCategory.id;
    }

    const { error } = await supabase.from("products").insert({
      name: form.name,
      price: Number(form.price),
      stock: Number(form.stock),
      vendor_id: vendorId,
      category_id: categoryId,
      is_active: true,
      slug: form.name.toLowerCase().replace(/\s+/g, "-"),
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Product added successfully!" });

    setForm({ name: "", price: "", stock: "" });
    setSelectedCategory("");
    setCustomCategory("");
    setFormOpen(false);

    fetchProducts();
    fetchCategories();
  };

  return (
    <div className="space-y-4">

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Your Products</h2>

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Product</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAdd} className="space-y-3">

              <Input
                placeholder="Product Name"
                required
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <Input
                type="number"
                placeholder="Price (R)"
                required
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value })
                }
              />

              {/* Category dropdown */}
              <select
                className="w-full border rounded p-3"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
              >
                <option value="">Select Category</option>

                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}

                <option value="other">Other</option>
              </select>

              {/* Other category input */}
              {selectedCategory === "other" && (
                <Input
                  placeholder="Enter new category"
                  value={customCategory}
                  onChange={(e) =>
                    setCustomCategory(e.target.value)
                  }
                  required
                />
              )}

              <Input
                type="number"
                placeholder="Stock"
                required
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: e.target.value })
                }
              />

              <Button type="submit" className="w-full">
                Add Product
              </Button>

            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Table */}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>R {p.price}</TableCell>
              <TableCell>{p.stock}</TableCell>
              <TableCell>
                {p.is_active ? "Active" : "Inactive"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

    </div>
  );
};

export default VendorProducts;