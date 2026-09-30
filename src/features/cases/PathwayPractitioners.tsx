"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { Monogram, formatEtb } from "@/features/marketplace/shared";

interface Practitioner {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  logoUrl: string | null;
  ratingAverage: string | null;
  ratingCount: number;
  categoryName: string;
  serviceId: string;
  serviceName: string;
  priceEtb: string;
}

/**
 * Healers who offer this pathway as a bookable service. Booking one opens the same case, reviewed
 * personally by that healer, and covered by the booking price.
 */
export function PathwayPractitioners({ domain }: { domain: string }) {
  const [list, setList] = useState<Practitioner[] | null>(null);
  useEffect(() => {
    apiFetch<Practitioner[]>(`/api/marketplace/pathways/${domain}/practitioners`).then(setList).catch(() => setList([]));
  }, [domain]);
  if (!list?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Prefer a healer you choose?</CardTitle>
        <CardDescription>These practitioners offer this pathway. Book one and they review your answers personally; the report is included in the booking.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        {list.map((p) => (
          <Link key={p.id} href={`/b/${p.slug}/book?service=${p.serviceId}`} className="flex items-center gap-3 rounded-2xl border border-border p-3 transition-colors hover:border-brand/40">
            {p.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.logoUrl} alt="" className="size-11 rounded-xl object-cover" />
            ) : (
              <Monogram name={p.name} className="size-11 rounded-xl" />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-foreground">{p.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{p.serviceName} · {formatEtb(p.priceEtb)}{p.city ? ` · ${p.city}` : ""}</span>
            </span>
            {p.ratingAverage && <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground"><Star className="size-3.5 fill-gold text-gold" aria-hidden="true" />{Number(p.ratingAverage).toFixed(1)}</span>}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
