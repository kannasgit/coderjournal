import { useSession, signIn } from "next-auth/react";

interface NavbarProps {
  onToggleSide: () => void;
  sideOpen: boolean;
}

export default function Navbar({ onToggleSide, sideOpen }: NavbarProps) {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-10 bg-theme/90 backdrop-blur border-b border-theme2 px-4 py-3 flex items-center justify-between" style={{ borderColor: 'var(--border2)', backgroundColor: 'var(--bg)' }}>
      {/* Hamburger */}
      <button
        onClick={onToggleSide}
        className="flex flex-col gap-1.5 p-2 rounded-md hover:bg-[#1e1d1b] transition-colors"
        aria-label="Toggle menu"
      >
        <span className={`block w-5 h-0.5 bg-[#e8e4dc] transition-transform duration-300 ${sideOpen ? "rotate-45 translate-y-2" : ""}`} />
        <span className={`block w-5 h-0.5 bg-[#e8e4dc] transition-opacity duration-300 ${sideOpen ? "opacity-0" : ""}`} />
        <span className={`block w-5 h-0.5 bg-[#e8e4dc] transition-transform duration-300 ${sideOpen ? "-rotate-45 -translate-y-2" : ""}`} />
      </button>

      {/* Title */}
      <span className="text-lg text-[#c9a96e] tracking-wide" style={{ fontFamily: '"Playfair Display", serif' }}>
        The CoderJournal
      </span>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {!session && (
          <button
            onClick={() => signIn("google")}
            className="px-3 py-1.5 rounded-md border border-[#2a2825] text-xs text-[#e8e4dc] hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors"
          >
            Sign in
          </button>
        )}
        {session && session.user.image && (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="w-8 h-8 rounded-full border border-[#2a2825] cursor-pointer"
            onClick={onToggleSide}
          />
        )}
      </div>
    </nav>
  );
}