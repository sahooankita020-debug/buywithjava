import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product, getDefaultPrice, isInStock } from "@/lib/product-utils";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Search, Leaf, Sparkles } from "lucide-react";

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
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as Product[];
    },
  });

  const weeklySpecials = useMemo(
    () => products.filter((p) => p.tags?.includes("weekly-special")),
    [products]
  );

  const clubs = useMemo(
    () => [...new Set(products.map((p) => p.club_name))].sort(),
    [products]
  );
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products]
  );

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (clubFilter !== "all" && p.club_name !== clubFilter) return false;
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      return true;
    });
  }, [products, search, clubFilter, categoryFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of filtered) {
      const key = groupBy === "club" ? p.club_name : (p.category || "Uncategorised");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, groupBy]);

  return (
    <div className="container py-8">
      {/* Hero */}
      <section className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Leaf className="h-4 w-4" />
          Cannabis delivery in Johannesburg
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl mb-3">
          Browse Our Menu
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Quality products from trusted dispensaries, delivered to your door. No delivery fees.
        </p>
      </section>

      {/* Weekly Specials */}
      {weeklySpecials.length > 0 && (
        <section className="mb-10 rounded-xl border-2 border-primary/20 bg-primary/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-primary">Weekly Specials</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {weeklySpecials.map((product) => (
              <div key={product.id} className="relative">
                <Badge className="absolute -top-2 -right-2 z-10 bg-primary text-primary-foreground text-[10px]">
                  Special
                </Badge>
                <ProductCard product={product} />
                {product.description && (
                  <p className="mt-2 text-sm font-medium text-primary text-center">{product.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={clubFilter} onValueChange={setClubFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Clubs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clubs</SelectItem>
            {clubs.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ToggleGroup type="single" value={groupBy} onValueChange={(v) => v && setGroupBy(v as "club" | "category")}>
          <ToggleGroupItem value="club" aria-label="Group by club">Club</ToggleGroupItem>
          <ToggleGroupItem value="category" aria-label="Group by category">Category</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Product grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Leaf className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : (
        grouped.map(([group, items]) => (
          <section key={group} className="mb-10">
            <h2 className="font-display text-xl font-semibold mb-4 border-b pb-2">
              {group}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
