import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    className="px-3 py-1.5 rounded-md text-sm transition-colors"
    style={{
        border: '1px solid var(--border2)',
        color: 'var(--text)',
    }}>   
    {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}