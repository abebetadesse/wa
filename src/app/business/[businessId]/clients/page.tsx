"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Plus, Search } from "lucide-react";
import { Badge, Button, EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/ui";
import { ClientDialog } from "@/features/workspace/ClientDialog";
import { useApi } from "@/features/workspace/useApi";
import { useWorkspace } from "@/features/workspace/WorkspaceContext";
import { Monogram, formatEtb } from "@/features/marketplace/shared";

interface ClientRow {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  tags: string[];
  hasAccount: boolean;
  visits: number;
  lastVisit: string | null;
  nextVisit: string | null;
  totalPaidEtb: string;
}

export default function ClientsPage() {
  const { business, base } = useWorkspace();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const params = new URLSearchParams({ page: String(page), ...(query ? { q: query } : {}) });
  const { data, error, reload } = useApi<{ clients: ClientRow[]; total: number; page: number; totalPages: number }>(`/api/workspace/businesses/${business.id}/clients?${params}`, { liveTypes: ["client.", "booking.created", "payment."] });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Clients" description="Everyone who has booked with you, plus clients you add yourself." actions={<Button onClick={() => setAdding(true)}><Plus className="size-4" aria-hidden="true" /> Add client</Button>} className="mb-0" />
      <label className="flex items-center gap-2 rounded-full border border-border bg-card px-4 focus-within:ring-2 focus-within:ring-ring">
        <Search className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Search clients</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone or email" className="h-11 flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none" />
      </label>
      {error && <ErrorState message={error} onRetry={reload} />}
      {!error && !data && <LoadingState />}
      {data && data.clients.length === 0 && <EmptyState title={query ? "No matching clients" : "No clients yet"} description="Clients are added automatically when they book." />}
      {data && data.clients.length > 0 && (
        <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
          {data.clients.map((client) => (
            <li key={client.id}>
              <Link href={`${base}/clients/${client.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-accent">
                <Monogram name={client.name} className="size-10 shrink-0 rounded-full text-sm" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-2 font-semibold text-foreground">
                    <span className="truncate">{client.name}</span>
                    {client.hasAccount && <Badge tone="brand">Online</Badge>}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {[client.phone, client.email].filter(Boolean).join(" · ") || "No contact details"}
                  </span>
                </span>
                <span className="hidden flex-col items-end text-xs text-muted-foreground sm:flex">
                  <span>{client.visits} {client.visits === 1 ? "visit" : "visits"} · {formatEtb(client.totalPaidEtb)}</span>
                  <span>{client.nextVisit ? `Next: ${new Date(client.nextVisit).toLocaleDateString()}` : client.lastVisit ? `Last: ${new Date(client.lastVisit).toLocaleDateString()}` : ""}</span>
                </span>
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {data.page} of {data.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
      {adding && <ClientDialog onClose={() => setAdding(false)} onSaved={reload} />}
    </div>
  );
}
