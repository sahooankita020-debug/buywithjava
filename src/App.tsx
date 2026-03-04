import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import TrackOrder from "@/pages/TrackOrder";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import AdminLogin from "./pages/AdminLogin";

import VendorDashboard from "@/pages/dashboard/VendorDashboard";
import VendorPage from "./pages/VendorPage";
import VendorLogin from "./pages/VendorLogin";
import VendorSignup from "./pages/VendorSignup";

import Contact from "./pages/Contact";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        
          <Routes>
            <Route element={<Layout />}>
  <Route path="/" element={<Index />} />
  <Route path="/product/:id" element={<ProductDetail />} />
  <Route path="/cart" element={<Cart />} />
  <Route path="/checkout" element={<Checkout />} />
  <Route path="/order/:id" element={<OrderConfirmation />} />
  <Route path="/track" element={<TrackOrder />} />
  <Route path="/payment/success" element={<PaymentSuccess />} />
  <Route path="/payment/failed" element={<PaymentFailed />} />
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/dashboard" element={<VendorDashboard />} />
</Route>
            {/* Public Pages */}
            <Route path="/" element={<Index />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:id" element={<OrderConfirmation />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Vendor Auth */}
            <Route path="/vendor/login" element={<VendorLogin />} />
            <Route path="/vendor/signup" element={<VendorSignup />} />

            {/* Vendor Dashboard */}
            <Route path="/dashboard" element={<VendorDashboard />} />

            {/* Public Vendor Page */}
            <Route path="/vendor/:slug" element={<VendorPage />} />

            {/* Static Pages */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;