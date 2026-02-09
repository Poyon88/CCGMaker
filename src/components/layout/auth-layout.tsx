import { Link, Outlet } from "react-router-dom";
import { Layers } from "lucide-react";
import { LanguageSwitcher } from "@/components/common/language-switcher";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/50">
      <header className="flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Layers className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">CCGMaker</span>
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
