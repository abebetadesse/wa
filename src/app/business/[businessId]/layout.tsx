"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  CalendarDays,
  Clock,
  ExternalLink,
  FlaskConical,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Star,
  Users,
  Wallet,
  Wand2,
} from "lucide-react";
import { Badge, ErrorState, LoadingState } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { WorkspaceProvider, type WorkspaceBusiness } from "@/features/workspace/WorkspaceContext";
import { BUSINESS_STATUS } from "@/features/workspace/labels";
import { Monogram } from "@/features/marketplace/shared";
import { useRealtimeState } from "@/features/realtime/RealtimeProvider";
import type { Capability } from "@/server/marketplace/roles";
import { roleCan } from "@/server/marketplace/roles";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; icon: typeof LayoutDashboard; capability: Capability }[] = [
  { href: "", label: "Dashboard", icon: LayoutDashboard, capability: "view" },
  { href: "/bookings", label: "Bookings", icon: CalendarDays, capability: "manageBookings" },
  { href: "/clients", label: "Clients", icon: Users, capability: "manageClients" },
  { href: "/messages", label: "Messages", icon: MessageCircle, capability: "message" },
  { href: "/services", label: "Services", icon: Wand2, capability: "manageServices" },
  { href: "/hours", label: "Hours", icon: Clock, capability: "manageSchedule" },
  { href: "/remedies", label: "Remedies & stock", icon: FlaskConical, capability: "manageInventory" },
  { href: "/payments", label: "Payments", icon: Wallet, capability: "viewFinance" },
  { href: "/reviews", label: "Reviews", icon: Star, capability: "view" },
  { href: "/settings", label: "Settings", icon: Settings, capability: "manageProfile" },
];

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  const { businessId } = useParams<{ businessId: string }>();
  const pathname = usePathname();
  const live = useRealtimeState();
  const { data, error, reload } = useApi<WorkspaceBusiness>(`/api/workspace/businesses/${businessId}`, { liveTypes: ["business."] });

  if (error) return <div className="mx-auto max-w-3xl px-4 py-12"><ErrorState message={error} onRetry={reload} /></div>;
  if (!data) return <LoadingState label="Opening your workspace…" className="min-h-[60vh]" />;

  const base = `/business/${data.id}`;
  const status = BUSINESS_STATUS[data.status] ?? { label: data.status, tone: "neutral" as const };
  const links = NAV.filter((item) => roleCan(data.myRole, item.capability));

  return (
    <WorkspaceProvider business={data} reload={reload}>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[15rem_1fr] lg:py-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            {data.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.logoUrl} alt="" className="size-11 rounded-xl object-cover" />
            ) : (
              <Monogram name={data.name} className="size-11 rounded-xl" />
            )}
            <div className="min-w-0">
              <p className="truncate font-display font-bold text-foreground">{data.name}</p>
              <Badge tone={status.tone} className="mt-0.5">{status.label}</Badge>
            </div>
          </div>
          <nav aria-label="Workspace" className="mt-3 flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {links.map((item) => {
              const href = `${base}${item.href}`;
              const active = item.href === "" ? pathname === base : pathname.startsWith(href);
              return (
                <Link
                  key={item.label}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                    active ? "bg-brand text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4" aria-hidden="true" /> {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 hidden flex-col gap-2 text-xs text-muted-foreground lg:flex">
            <Link href={`/b/${data.slug}`} className="inline-flex items-center gap-1.5 px-3 font-semibold hover:text-foreground">
              <ExternalLink className="size-3.5" aria-hidden="true" /> View public page
            </Link>
            <span className="inline-flex items-center gap-1.5 px-3">
              <span className={cn("size-2 rounded-full", live === "live" ? "bg-success" : live === "connecting" ? "bg-warning" : "bg-muted-foreground/40")} />
              {live === "live" ? "Live — updates appear instantly" : live === "connecting" ? "Reconnecting…" : "Offline"}
            </span>
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </WorkspaceProvider>
  );
}
