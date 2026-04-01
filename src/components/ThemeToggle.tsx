"use client";
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button 
        aria-label="Toggle theme placeholder"
        className="relative inline-flex items-center justify-center rounded-full p-2 transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/5"
        style={{ width: "36px", height: "36px" }}
      >
        <div className="w-5 h-5 opacity-0" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="relative inline-flex items-center justify-center rounded-full p-2 transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/10 group active:scale-95"
      style={{ width: "36px", height: "36px" }}
    >
      <Sun 
        className="absolute w-5 h-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ 
          transform: isDark ? "rotate(90deg) scale(0)" : "rotate(0deg) scale(1)",
          opacity: isDark ? 0 : 1,
          color: "#080808"
        }}
      />
      <Moon 
        className="absolute w-5 h-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ 
          transform: isDark ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0)",
          opacity: isDark ? 1 : 0,
          color: "#ffffff"
        }}
      />
    </button>
  );
}
