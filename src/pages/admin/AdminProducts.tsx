import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/lib/product-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

const emptyProduct = {
  name: "",
  category: "",
  brand: "",
  description: "",
  club_id: "dank-connections",
  club_name: "Dank Connections",
  units: "GRAMS",
  status: "IN_STOCK",
  stock_available: 0,
  is_active: true,
  prices: "[]",
  tags: "",
};

export default function AdminProducts() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (error) throw error;
      return data as Product[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: typeof form) => {
      let parsedPrices: any;
      try {
        parsedPrices = JSON.parse(values.prices);
      } catch {
        throw new Error("Invalid prices JSON");
      }

      const payload = {
        name: values.name,
        category: values.category,
        brand: values.brand,
        description: values.description,
        club_id: values.club_id,
        club_name: values.club_name,
        units: values.units,
        status: values.status,
        stock_available: Number(values.stock_available),
        is_active: values.is_active,
        prices: parsedPrices,
        tags: values.tags,
      };

      if (editing) {
        const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert({ ...payload, id: crypto.randomUUID() });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast({ title: editing ? "Product updated" : "Product created" });
      handleClose();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category,
      brand: p.brand,
      description: p.description,
      club_id: p.club_id,
      club_name: p.club_name,
      units: p.units,
      status: p.status,
      stock_available: p.stock_available,
      is_active: p.is_active,
      prices: JSON.stringify(p.prices, null, 2),
      tags: p.tags,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyProduct);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Product name is required", variant: "destructive" });
      return;
    }
    saveMutation.mutate(form);
  };

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">Products</h1>
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Product" : "New Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Category</Label><Input value={form.category} onChange={(e) => set("category", e.target.value)} /></div>
                <div><Label>Brand</Label><Input value={form.brand} onChange={(e) => set("brand", e.target.value)} /></div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Club ID</Label><Input value={form.club_id} onChange={(e) => set("club_id", e.target.value)} /></div>
                <div><Label>Club Name</Label><Input value={form.club_name} onChange={(e) => set("club_name", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Units</Label><Input value={form.units} onChange={(e) => set("units", e.target.value)} placeholder="GRAMS or UNITS" /></div>
                <div><Label>Status</Label><Input value={form.status} onChange={(e) => set("status", e.target.value)} /></div>
                <div><Label>Stock</Label><Input type="number" value={form.stock_available} onChange={(e) => set("stock_available", e.target.value)} /></div>
              </div>
              <div><Label>Prices (JSON)</Label><Textarea value={form.prices} onChange={(e) => set("prices", e.target.value)} rows={4} className="font-mono text-xs" /></div>
              <div><Label>Tags</Label><Input value={form.tags} onChange={(e) => set("tags", e.target.value)} /></div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} />
                <Label>Active</Label>
              </div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">Loading…</div>
      ) : (
        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category && <Badge variant="secondary">{p.category}</Badge>}</TableCell>
                  <TableCell>{p.stock_available}</TableCell>
                  <TableCell>{p.is_active ? <Badge>Active</Badge> : <Badge variant="destructive">Inactive</Badge>}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { if (confirm("Delete this product?")) deleteMutation.mutate(p.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
