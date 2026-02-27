import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";
import logo from "@/assets/logo.png";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-card py-6">
        <div className="container flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <img src={logo} alt="BuyWithJava" className="h-8 w-auto opacity-70" />
          © {new Date().getFullYear()} BuyWithJava — Cannabis delivery in Johannesburg
        </div>
      </footer>
    </div>
  );
}
