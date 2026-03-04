import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function VendorSettings() {
  const { user } = useAuth();
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchStore = async () => {
      const { data } = await supabase
        .from("vendors")
        .select("store_name")
        .eq("id", user.id)
        .single();

      if (data) setStoreName(data.store_name);
    };

    fetchStore();
  }, [user]);

  const updateStore = async () => {
    await supabase
      .from("vendors")
      .update({ store_name: storeName })
      .eq("id", user?.id);

    alert("Updated!");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Store Settings
      </h1>

      <input
        value={storeName}
        onChange={(e) => setStoreName(e.target.value)}
        className="border p-3 w-full mb-4"
      />

      <button
        onClick={updateStore}
        className="bg-primary text-white px-6 py-3 rounded"
      >
        Save
      </button>
    </div>
  );
}