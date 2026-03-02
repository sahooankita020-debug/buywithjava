import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await (supabase as any)
      .from("contact_messages")
      .insert({
        name,
        email,
        message,
      });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setMessageSent(true);
    setLoading(false);
  };

  return (
    <div className="container py-16 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Contact Us
      </h1>

      <p className="text-muted-foreground text-center mb-10">
        Have a question? We’d love to hear from you.
      </p>

      {messageSent ? (
        <div className="text-center text-primary font-medium">
          ✅ Thank you! Your message has been saved.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            type="text"
            placeholder="Your Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded p-3"
          />

          <input
            type="email"
            placeholder="Your Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded p-3"
          />

          <textarea
            placeholder="Your Message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border rounded p-3"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white p-3 rounded font-semibold"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>

        </form>
      )}
    </div>
  );
}