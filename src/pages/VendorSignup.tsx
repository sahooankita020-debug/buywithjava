import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function VendorSignup() {
  const navigate = useNavigate();

  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, "-");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ Create auth user
      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("User not created");

      // 2️⃣ Insert vendor record
      const { error: vendorError } = await supabase
        .from("vendors")
        .insert({
          id: userId, // ✅ VERY IMPORTANT
          store_name: storeName,
          store_slug: generateSlug(storeName),
          description,
          email: email,
        });

      if (vendorError) throw vendorError;

      alert("Vendor account created successfully!");
      navigate("/dashboard"); // ✅ redirect to vendor dashboard
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-20 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Vendor Signup
      </h1>

      <form onSubmit={handleSignup} className="space-y-4">
        <input
          type="text"
          placeholder="Store Name"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          required
          className="w-full border rounded p-3"
        />

        <textarea
          placeholder="Store Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded p-3"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded p-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border rounded p-3"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white p-3 rounded font-semibold"
        >
          {loading ? "Creating..." : "Create Vendor Account"}
        </button>

        <div className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link
            to="/vendor/login"
            className="text-purple-600 font-medium hover:underline"
          >
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}