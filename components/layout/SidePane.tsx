import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

interface SidePaneProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SidePane({ isOpen, onClose }: SidePaneProps) {
    const { data: session } = useSession();
    const [displayName, setDisplayName] = useState(session?.user?.name || "");
    const [tagSearch, setTagSearch] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagsLoaded, setTagsLoaded] = useState(false);
    const DEFAULT_TAGS = ["JavaScript", "TypeScript", "React"];

    useEffect(() => {
    fetch("/api/get-tags")
    .then(r => r.json())
    .then(d => {
      setTags(d.tags || []);
      setTagsLoaded(true); 
    })
    .catch(() => {
      setTagsLoaded(true);
    });
}, []);

    useEffect(() => {
    if (session?.user?.email) {
        fetch(`/api/get-profile?email=${session.user.email}`)
        .then(r => r.json())
        .then(d => { if (d.display_name) setDisplayName(d.display_name); });
    }
    }, [session]);

  return (
    <aside
        className={`fixed top-0 left-0 h-full w-72 z-30 flex flex-col transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backgroundColor: 'var(--bg)', borderRight: '1px solid var(--border2)' }}
    >
      {/* Logo */}
      <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border2)' }}>
        <Link href="/" onClick={onClose}>
          <span className="text-xl text-[#c9a96e] tracking-wide cursor-pointer" style={{ fontFamily: '"Playfair Display", serif' }}>
            The CoderJournal
          </span>
        </Link>
      </div>

      {/* Explore Tags */}
<div className="px-6 py-5 flex-1 overflow-y-auto">
  <p className="text-xs uppercase tracking-widest text-[#c9a96e] mb-3">
    Explore Tags
  </p>

  {/* Search input */}
  <input
    type="text"
    placeholder="Search tags..."
    value={tagSearch}
    onChange={e => setTagSearch(e.target.value)}
    className="w-full px-3 py-1.5 rounded-md text-sm mb-3 focus:outline-none transition-colors"
    style={{
      backgroundColor: '#1e1d1b',
      border: '1px solid #2a2825',
      color: '#e8e4dc',
    }}
  />

  <ul className="space-y-1">
    {!tagsLoaded ? (
  <p className="text-xs px-3 py-2" style={{ color: '#555' }}>Loading tags...</p>
) : tagSearch.trim() === "" ? (
  // No search — show only default tags
  DEFAULT_TAGS.map((tag) => (
    <li key={tag}>
      <Link
        href={`/tag/${tag.toLowerCase()}`}
        onClick={onClose}
        className="block px-3 py-2 rounded-md text-sm text-[#e8e4dc] hover:bg-[#1e1d1b] hover:text-[#c9a96e] transition-colors"
      >
        # {tag}
      </Link>
    </li>
  ))
) : (
  // Searching — show matching tags from Supabase
  tags.filter(tag =>
    tag.toLowerCase().includes(tagSearch.toLowerCase())
  ).length === 0 ? (
    <li className="px-3 py-2 text-sm" style={{ color: '#555' }}>
      No tags found
    </li>
  ) : (
    tags.filter(tag =>
      tag.toLowerCase().includes(tagSearch.toLowerCase())
    ).map((tag) => (
      <li key={tag}>
        <Link
          href={`/tag/${tag.toLowerCase()}`}
          onClick={onClose}
          className="block px-3 py-2 rounded-md text-sm text-[#e8e4dc] hover:bg-[#1e1d1b] hover:text-[#c9a96e] transition-colors"
        >
          # {tag}
        </Link>
      </li>
    ))
  )
)}
  {tagsLoaded && tags.filter(tag =>
    tag.toLowerCase().includes(tagSearch.toLowerCase())
  ).length === 0 && (
    <li className="px-3 py-2 text-sm" style={{ color: '#555' }}>
      No tags found
    </li>
  )}
</ul>
</div>

      {/* Create Blog Button */}
      {session && (
        <div className="px-6 py-4" style={{ borderTop: '1px solid var(--border2)' }}>
          <Link
            href="/editor"
            onClick={onClose}
            className="block w-full text-center px-4 py-2 rounded-md border border-[#c9a96e] text-[#c9a96e] text-sm hover:bg-[#c9a96e] hover:text-[#0f0e0c] transition-colors font-medium"
          >
            + Create your new blog
          </Link>
        </div>
      )}

      {/* User Section */}
      <div className="px-6 py-4" style={{ borderTop: '1px solid var(--border2)' }}>
        {session ? (
          <>
            {/* User info */}
            <div className="flex items-center gap-3 mb-3 px-3 py-2">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-8 h-8 rounded-full border border-[#2a2825]"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#e8e4dc] truncate font-medium">
                    {displayName}
                </p>
                <p className="text-xs text-[#555] truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
            <Link
                href="/notifications"
                onClick={onClose}
                className="block w-full text-left px-3 py-2 rounded-md text-sm text-[#e8e4dc] hover:bg-[#1e1d1b] transition-colors"
            >
                ✉︎ Notifications
            </Link>
            <Link
                 href="/settings"
                onClick={onClose}
                className="block w-full text-left px-3 py-2 rounded-md text-sm text-[#e8e4dc] hover:bg-[#1e1d1b] transition-colors"
                >
              ⚙ Settings
            </Link>
            <button
              onClick={() => signOut()}
              className="w-full text-left px-3 py-2 rounded-md text-sm text-red-400 hover:bg-[#1e1d1b] transition-colors"
            >
              ⇱ Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-[#2a2825] text-sm text-[#e8e4dc] hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        )}
      </div>
    </aside>
  );
}