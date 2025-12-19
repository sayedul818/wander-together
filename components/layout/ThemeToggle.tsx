"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, systemTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={cn("relative gap-2", className)}
      aria-label="Toggle color theme"
    >
      <Sun
        className={cn(
          "h-4 w-4 transition-transform duration-300",
          isDark ? "scale-0 rotate-90" : "scale-100 rotate-0"
        )}
      />
      <Moon
        className={cn(
          "h-4 w-4 transition-transform duration-300 absolute",
          isDark ? "scale-100 rotate-0" : "scale-0 -rotate-90"
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
