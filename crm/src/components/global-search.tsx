"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

interface SearchResult {
  type: "contact" | "deal" | "campaign";
  id: string;
  title: string;
  subtitle: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setActiveIdx(0);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  function handleInputChange(value: string) {
    setQuery(value);
    setOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  }

  function navigate(result: SearchResult) {
    setOpen(false);
    setQuery("");
    if (result.type === "contact") router.push(`/contacts/${result.id}`);
    else if (result.type === "deal") router.push(`/deals/${result.id}`);
    else router.push(`/ads`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[activeIdx]) { navigate(results[activeIdx]); }
  }

  const typeIcons: Record<string, string> = { contact: "person", deal: "briefcase", campaign: "megaphone" };
  const grouped = {
    contacts: results.filter((r) => r.type === "contact"),
    deals: results.filter((r) => r.type === "deal"),
    campaigns: results.filter((r) => r.type === "campaign"),
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search contacts, deals, campaigns..."
          className="pl-10 pr-20"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      {open && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border bg-popover shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {loading && <div className="px-4 py-3 text-sm text-muted-foreground">Searching...</div>}
          {!loading && results.length === 0 && query.length >= 2 && (
            <div className="px-4 py-3 text-sm text-muted-foreground">No results found</div>
          )}
          {!loading && Object.entries(grouped).map(([group, items]) => {
            if (items.length === 0) return null;
            let flatIdx = group === "contacts" ? 0 : group === "deals" ? grouped.contacts.length : grouped.contacts.length + grouped.deals.length;
            return (
              <div key={group}>
                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50">
                  {group}
                </div>
                {items.map((item, i) => {
                  const idx = flatIdx + i;
                  return (
                    <button
                      key={item.id}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent transition-colors ${idx === activeIdx ? "bg-accent" : ""}`}
                      onClick={() => navigate(item)}
                      onMouseEnter={() => setActiveIdx(idx)}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-medium">
                        {item.type === "contact" ? "C" : item.type === "deal" ? "D" : "A"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
