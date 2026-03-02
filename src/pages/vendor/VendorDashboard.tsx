import { useAuth } from "@/hooks/useAuth";

export default function VendorDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {user?.email}
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-xl">
          <h3 className="font-semibold text-lg">Manage Products</h3>
          <p className="text-muted-foreground text-sm">
            Add, edit or remove your products.
          </p>
        </div>

        <div className="p-6 border rounded-xl">
          <h3 className="font-semibold text-lg">Manage Orders</h3>
          <p className="text-muted-foreground text-sm">
            Update delivery status of your orders.
          </p>
        </div>

        <div className="p-6 border rounded-xl">
          <h3 className="font-semibold text-lg">Store Settings</h3>
          <p className="text-muted-foreground text-sm">
            Update store information.
          </p>
        </div>
      </div>
    </div>
  );
}