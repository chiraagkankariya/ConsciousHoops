import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  created_at: string;
};

export const Route = createFileRoute("/admin/inquiries")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Contact inquiries — Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminInquiriesPage,
});

function AdminInquiriesPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "unauthed" | "forbidden" | "ready">("loading");
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        if (!cancelled) setStatus("unauthed");
        return;
      }
      const { data: roleRows, error: roleErr } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (cancelled) return;
      if (roleErr || !roleRows) {
        setStatus("forbidden");
        return;
      }
      const { data, error } = await supabase
        .from("contact_inquiries")
        .select("id, name, email, topic, message, created_at")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        setError(error.message);
        setStatus("ready");
        return;
      }
      setRows((data ?? []) as Inquiry[]);
      setStatus("ready");
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const topics = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => s.add(r.topic));
    return Array.from(s).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromTs = dateFrom ? new Date(dateFrom).getTime() : null;
    const toTs = dateTo ? new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 : null;
    return rows.filter((r) => {
      if (topicFilter !== "all" && r.topic !== topicFilter) return false;
      if (q) {
        const hay = `${r.name} ${r.email} ${r.message}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const ts = new Date(r.created_at).getTime();
      if (fromTs && ts < fromTs) return false;
      if (toTs && ts >= toTs) return false;
      return true;
    });
  }, [rows, search, topicFilter, dateFrom, dateTo]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (status === "loading") {
    return <CenteredMessage>Loading…</CenteredMessage>;
  }
  if (status === "unauthed") {
    return (
      <CenteredMessage>
        <p className="mb-4">You need to sign in to view this page.</p>
        <Link to="/auth" className="rounded-lg bg-[#C87F4F] text-white px-4 py-2 text-sm">
          Go to sign in
        </Link>
      </CenteredMessage>
    );
  }
  if (status === "forbidden") {
    return (
      <CenteredMessage>
        <p className="mb-4">Your account doesn't have admin access.</p>
        <button onClick={signOut} className="rounded-lg border border-[#E5DDCB] px-4 py-2 text-sm">
          Sign out
        </button>
      </CenteredMessage>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6EF] font-[DM_Sans,sans-serif] text-[#2B2A26]">
      <header className="border-b border-[#E5DDCB] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-[Playfair_Display,serif]">Contact inquiries</h1>
            <p className="text-sm text-[#6B675F]">
              {filtered.length} of {rows.length} submissions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-[#6B675F] underline underline-offset-2">
              Home
            </Link>
            <button
              onClick={signOut}
              className="rounded-lg border border-[#E5DDCB] bg-white px-3 py-1.5 text-sm hover:bg-[#F2E8D9]"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <div className="md:col-span-2">
            <label className="block text-xs text-[#6B675F] mb-1">Search name, email, message</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to filter…"
              className="w-full rounded-lg border border-[#E5DDCB] bg-white px-3 py-2 text-sm outline-none focus:border-[#C87F4F]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#6B675F] mb-1">Topic</label>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="w-full rounded-lg border border-[#E5DDCB] bg-white px-3 py-2 text-sm outline-none focus:border-[#C87F4F]"
            >
              <option value="all">All topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-[#6B675F] mb-1">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-lg border border-[#E5DDCB] bg-white px-2 py-2 text-sm outline-none focus:border-[#C87F4F]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6B675F] mb-1">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-lg border border-[#E5DDCB] bg-white px-2 py-2 text-sm outline-none focus:border-[#C87F4F]"
              />
            </div>
          </div>
        </div>

        {(search || topicFilter !== "all" || dateFrom || dateTo) && (
          <button
            onClick={() => {
              setSearch("");
              setTopicFilter("all");
              setDateFrom("");
              setDateTo("");
            }}
            className="mb-4 text-xs text-[#6B675F] underline underline-offset-2"
          >
            Clear filters
          </button>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#E5DDCB] overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-[#6B675F]">No inquiries match.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#F2E8D9] text-left text-[#6B675F]">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Topic</th>
                  <th className="px-4 py-3 font-medium">Message</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const isOpen = expanded.has(r.id);
                  return (
                    <tr
                      key={r.id}
                      className="border-t border-[#F0E8D8] cursor-pointer hover:bg-[#FAF6EF]"
                      onClick={() => toggleExpand(r.id)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-[#6B675F]">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">{r.name}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`mailto:${r.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#C87F4F] hover:underline"
                        >
                          {r.email}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-full bg-[#F2E8D9] px-2 py-0.5 text-xs">
                          {r.topic}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-md">
                        <p className={isOpen ? "whitespace-pre-wrap" : "truncate"}>{r.message}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF6EF] font-[DM_Sans,sans-serif] text-[#2B2A26] px-4">
      <div className="max-w-md text-center bg-white rounded-2xl border border-[#E5DDCB] p-8">
        {children}
      </div>
    </div>
  );
}
