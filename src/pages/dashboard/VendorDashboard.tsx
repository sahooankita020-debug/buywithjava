import { useState } from "react";
import VendorProducts from "../vendor/VendorProducts";
import VendorOrders from "../vendor/VendorOrders";
import VendorStore from "../vendor/VendorStore";
import { Button } from "@/components/ui/button";

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Vendor Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-3">
        <Button
          variant={activeTab === "products" ? "default" : "outline"}
          onClick={() => setActiveTab("products")}
        >
          Products
        </Button>

        <Button
          variant={activeTab === "orders" ? "default" : "outline"}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </Button>

        <Button
          variant={activeTab === "store" ? "default" : "outline"}
          onClick={() => setActiveTab("store")}
        >
          Store
        </Button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border p-6">
        {activeTab === "products" && <VendorProducts />}
        {activeTab === "orders" && <VendorOrders />}
        {activeTab === "store" && <VendorStore />}
      </div>
    </div>
  );
};

export default VendorDashboard;