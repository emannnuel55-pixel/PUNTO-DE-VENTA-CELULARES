"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";

export function ThemeToggle() {
  const router = useRouter();
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const isLight = document.documentElement.classList.contains("light-theme");
    setTheme(isLight ? "light" : "dark");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    
    document.cookie = `pvc_theme=${nextTheme}; path=/; max-age=31536000; SameSite=Strict`;
    
    if (nextTheme === "light") {
      document.documentElement.classList.add("light-theme");
      document.body.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
      document.body.classList.remove("light-theme");
    }
    
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle-btn"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "50%",
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "inherit",
        transition: "all 0.2s ease"
      }}
      title={`Cambiar a tema ${theme === "dark" ? "claro" : "oscuro"}`}
    >
      {theme === "dark" ? (
        <Sun size={18} style={{ color: "#e2e8f0" }} />
      ) : (
        <Moon size={18} style={{ color: "#3b82f6" }} />
      )}
    </button>
  );
}
