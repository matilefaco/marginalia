import { Link, useLocation } from "wouter";
import { Home, Compass, BookOpen, Library, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, path: "/", label: "Início" },
    { icon: Compass, path: "/explore", label: "Explorar" },
    { icon: BookOpen, path: "/reader/current", label: "Ler", center: true },
    { icon: Library, path: "/library", label: "Biblioteca" },
    { icon: User, path: "/profile", label: "Perfil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F3]/90 backdrop-blur-md border-t border-[#AE8F7D]/20">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const isCenter = item.center;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors duration-300",
                isActive ? "text-[#AE8F7D]" : "text-[#454545]/30",
                isCenter ? "mt-[-20px]" : ""
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-full transition-all duration-300",
                  isCenter ? "w-14 h-14 bg-[#FAF8F3] shadow-md border border-[#AE8F7D]/20" : "w-10 h-10",
                  isActive && isCenter ? "bg-[#AE8F7D]/10" : ""
                )}
              >
                <item.icon
                  className={cn(
                    isCenter ? "w-6 h-6" : "w-5 h-5",
                    isActive && !isCenter ? "stroke-[2.5px]" : "stroke-2"
                  )}
                />
              </div>
              {!isCenter && (
                <span className="text-[10px] font-sans uppercase tracking-widest mt-1 opacity-80">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}