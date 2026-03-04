import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

interface Props {
  product: any;
}

export function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      quantity: 1,
      price: Number(product.price),
      clubId: product.vendor_id,
      clubName: product.club_name || "Vendor",
    });
  };

  return (
    <div className="border rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition">

      {/* PRODUCT NAME */}
      <h3 className="font-semibold text-lg">{product.name}</h3>

      {/* PRICE */}
      <p className="text-muted-foreground">R{product.price}</p>

      {/* STOCK */}
      <p
        className={`text-sm ${
          product.stock > 0 ? "text-green-600" : "text-red-500"
        }`}
      >
        {product.stock > 0 ? "Available" : "Out of Stock"}
      </p>

      {/* ACTIONS */}
      <div className="flex items-center justify-between mt-2">

        {/* VIEW PRODUCT */}
        <Link
          to={`/product/${product.id}`}
          className="text-primary text-sm hover:underline"
        >
          View Product
        </Link>

        {/* ADD TO CART */}
        <button
          onClick={handleAdd}
          disabled={product.stock <= 0}
          className="bg-primary text-white p-2 rounded-full hover:opacity-90 disabled:opacity-40"
        >
          <Plus size={16} />
        </button>

      </div>
    </div>
  );
}