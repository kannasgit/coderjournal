import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Notification {
  id: string;
  type: string;
  message: string;
  post_slug: string;
  post_title: string;
  read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/"); return; }
    if (session?.user?.email) fetchNotifications();
  }, [session, status]);

  async function fetchNotifications() {
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_email", session?.user?.email!)
      .order("created_at", { ascending: false });

    setNotifications(data || []);
    setLoading(false);

    // Mark all as read
    if (data?.some(n => !n.read)) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("recipient_email", session?.user?.email!)
        .eq("read", false);
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-[#555] text-sm">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <Link href="/" className="text-sm text-[#555] hover:text-[#c9a96e] transition-colors">
          ← Back to Journal
        </Link>
        <div className="flex items-center gap-3 mt-4">
          <h1 className="font-heading text-4xl text-[#e8e4dc]">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-[#c9a96e] text-[#0f0e0c] text-xs font-medium rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="mt-4 h-px bg-[#1e1d1b]" />
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">🔔</div>
          <p className="text-[#555]">No notifications yet.</p>
          <p className="text-sm text-[#444] mt-2">
            When someone comments on your posts, you'll see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <Link href={`/blog/${n.post_slug}`} key={n.id}>
              <div className={`flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer hover:border-[#c9a96e] ${
                n.read
                  ? "bg-[#0f0e0c] border-[#1e1d1b]"
                  : "bg-[#141311] border-[#2a2825]"
              }`}>
                {/* Icon */}
                <div className="shrink-0 w-9 h-9 rounded-full bg-[#1e1d1b] flex items-center justify-center text-base">
                  {n.type === "comment" ? "💬" : "↗"}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#e8e4dc]">{n.message}</p>
                  {n.post_title && (
                    <p className="text-xs text-[#c9a96e] mt-1 truncate">
                      {n.post_title}
                    </p>
                  )}
                  <p className="text-xs text-[#444] mt-1">
                    {new Date(n.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric",
                      hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>

                {/* Unread dot */}
                {!n.read && (
                  <div className="shrink-0 w-2 h-2 rounded-full bg-[#c9a96e] mt-2" />
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}