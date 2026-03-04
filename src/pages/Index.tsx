import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Search, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  const [search, setSearch] = useState("");
  const [clubFilter, setClubFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [groupBy, setGroupBy] = useState<"club" | "category">("club");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          vendors ( store_name, store_slug ),
          categories ( name )
        `)
        .eq("is_active", true);

      if (error) throw error;

      return (data || []).map((p: any) => ({
        ...p,
        club_name: p.vendors?.store_name ?? "Unknown Club",
        store_slug: p.vendors?.store_slug ?? "",
        category_name: p.categories?.name ?? "Uncategorised",
      }));
    },
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("id, store_name")
        .order("store_name");

      if (error) throw error;
      return data || [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
        return false;

      if (clubFilter !== "all" && p.vendor_id !== clubFilter)
        return false;

      if (categoryFilter !== "all" && p.category_id !== categoryFilter)
        return false;

      return true;
    });
  }, [products, search, clubFilter, categoryFilter]);

  const groupedProducts = useMemo(() => {
    const map = new Map<string, any[]>();

    filteredProducts.forEach((p: any) => {
      const key =
        groupBy === "club" ? p.club_name : p.category_name;

      if (!map.has(key)) map.set(key, []);

      map.get(key)!.push(p);
    });

    return Array.from(map.entries());
  }, [filteredProducts, groupBy]);

  return (
    <div className="container py-8">
      {/* HERO */}
      <section className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Leaf className="h-4 w-4" />
          Cannabis delivery in Johannesburg
        </div>

        <h1 className="text-4xl font-bold mb-3">
          Browse Our Menu
        </h1>

        <p className="text-muted-foreground">
          Quality products from trusted dispensaries, delivered to your door.
          No delivery fees.
        </p>
      </section>

      {/* FILTERS */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Vendor Filter */}
        <Select value={clubFilter} onValueChange={setClubFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Vendors" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Vendors</SelectItem>

            {vendors.map((v: any) => (
              <SelectItem key={v.id} value={v.id}>
                {v.store_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>

            {categories.map((c: any) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Group toggle */}
        <ToggleGroup
          type="single"
          value={groupBy}
          onValueChange={(val) => {
            if (val) setGroupBy(val as "club" | "category");
          }}
        >
          <ToggleGroupItem value="club">Club</ToggleGroupItem>
          <ToggleGroupItem value="category">Category</ToggleGroupItem>
        </ToggleGroup>

      </div>

      {/* PRODUCTS */}

      {isLoading ? (
        <div>Loading...</div>
      ) : groupedProducts.length === 0 ? (
        <div className="text-center py-20">
          <Leaf className="mx-auto mb-4 h-10 w-10 opacity-40" />
          <p>No products found</p>
        </div>
      ) : (
        groupedProducts.map(([group, items]) => (
          <section key={group} className="mb-10">

            <h2 className="text-xl font-semibold mb-4 border-b pb-2">
              {groupBy === "club" ? (
                <Link
                  to={`/vendor/${items[0]?.store_slug}`}
                  className="hover:text-primary"
                >
                  {group}
                </Link>
              ) : (
                group
              )}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

              {items.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}

            </div>

          </section>
        ))
      )}
    </div>
  );
}