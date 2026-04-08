import { Link, useLocation } from "wouter";
import { Home, Compass, Library, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

export function Navbar() {
  const [location] = useLocation();
  const { notifications } = useApp();
  const unread = notifications.filter((n) => !n.isRead).length;

  const navItems = [
    { icon: Home, path: "/", label: "Início" },
    { icon: Compass, path: "/explore", label: "Explorar" },
    { icon: Plus, path: "/nova-margem", label: "Criar Post", center: true },
    { icon: Library, path: "/library", label: "Biblioteca" },
    { icon: User, path: "/profile", label: "Perfil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F3]/95 dark:bg-[#1C1916]/95 backdrop-blur-md border-t border-[#AE8F7D]/15 dark:border-[#AE8F7D]/8">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const isCenter = item.center;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors duration-300",
                isActive ? "text-[#AE8F7D]" : "text-[#454545]/30 dark:text-[#E8E2D6]/30",
              )}
            >
              {isCenter ? (
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#454545] dark:bg-[#AE8F7D] shadow-lg mt-[-20px] border-4 border-[#FAF8F3] dark:border-[#1C1916] hover:opacity-90 transition-opacity">
                  <Plus className="w-6 h-6 text-[#FAF8F3]" strokeWidth={1.5} />
                </div>
              ) : (
                <>
                  <div className="relative w-10 h-7 flex items-center justify-center">
                    <item.icon
                      className={cn("w-5 h-5", isActive ? "stroke-[2px]" : "stroke-[1.5px]")}
                    />
                    {item.path === "/" && unread > 0 && (
                      <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-[#AE8F7D]" />
                    )}
                  </div>
                  <span className="text-[9px] font-sans font-light tracking-[0.1em] uppercase leading-none">
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
