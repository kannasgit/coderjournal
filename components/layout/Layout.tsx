import { ReactNode, useState } from "react";
import SidePane from "./SidePane";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sideOpen, setSideOpen] = useState(false);

  return (
    <div className="min-h-screen bg-theme text-theme font-body">
      {/* Overlay when side pane is open on mobile */}
      {sideOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSideOpen(false)}
        />
      )}

      {/* Side Pane */}
      <SidePane isOpen={sideOpen} onClose={() => setSideOpen(false)} />

      {/* Main content shifts on desktop when pane is open */}
      <div className={`transition-all duration-300 ${sideOpen ? "lg:ml-72" : "lg:ml-0"}`}>
        <Navbar onToggleSide={() => setSideOpen(!sideOpen)} sideOpen={sideOpen} />
        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}