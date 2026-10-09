import Link from "next/link";
import { BadgeCheck, Home, MapPin, MessageSquare, Phone, Star, UserRound, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

export const MODE_LABELS: Record<string, { label: string; icon: typeof Video }> = {
  in_person: { label: "In person", icon: UserRound },
  home_visit: { label: "Home visit", icon: Home },
  video: { label: "Video call", icon: Video },
  voice: { label: "Phone call", icon: Phone },
  chat: { label: "Chat", icon: MessageSquare },
};

export const LANGUAGE_LABELS: Record<string, string> = {
  am: "Amharic",
  om: "Afaan Oromoo",
  ti: "Tigrinya",
  so: "Somali",
  en: "English",
};

export const formatEtb = (value: number | string | null | undefined) =>
  value === null || value === undefined || value === "" ? "—" : `${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })} ETB`;

export function Stars({ value, count, size = "sm" }: { value: number | string | null; count?: number; size?: "sm" | "lg" }) {
  const { t } = useLanguage();
  const rating = value === null ? null : Number(value);
  if (rating === null || !count) return <span className="text-xs text-muted-foreground">{t.marketplace.newListing}</span>;
  return (
    <span className="inline-flex items-center gap-1" aria-label={t.marketplace.ratedOutOfFive.replace("{rating}", rating.toFixed(1)).replace("{count}", String(count))}>
      <Star className={cn("fill-gold text-gold", size === "lg" ? "size-5" : "size-3.5")} aria-hidden="true" />
      <span className={cn("font-bold text-foreground", size === "lg" ? "text-lg" : "text-sm")}>{rating.toFixed(1)}</span>
      <span className="text-xs text-muted-foreground">({count})</span>
    </span>
  );
}

export interface BusinessSummary {
  id: string;
  slug: string;
  name: string;
  nameAm: string | null;
  tagline: string | null;
  region: string | null;
  city: string | null;
  deliveryModes: string[];
  logoUrl: string | null;
  coverUrl: string | null;
  ratingAverage: string | null;
  ratingCount: number;
  demoSample?: boolean;
  categoryName: string;
  categoryNameAm: string | null;
  sector: string;
  fromPriceEtb: string | null;
  matchingServices?: string[];
}

/** Monogram shown when a business has not uploaded a logo. */
export function Monogram({ name, className }: { name: string; className?: string }) {
  const letter = name.trim()[0]?.toUpperCase() ?? "?";
  return (
    <span className={cn("grid place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-strong font-display font-extrabold text-inverse-foreground", className)} aria-hidden="true">
      {letter}
    </span>
  );
}

export function BusinessCard({ business }: { business: BusinessSummary }) {
  const { language, t } = useLanguage();
  const cultural = business.sector === "cultural";
  const categoryName = language === "am" ? business.categoryNameAm ?? business.categoryName : business.categoryName;
  const businessName = language === "am" ? business.nameAm ?? business.name : business.name;
  return (
    <Link
      href={`/b/${business.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-input hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div
        className={cn(
          "relative h-28 bg-cover bg-center",
          !business.coverUrl && (cultural ? "bg-gradient-to-br from-gold/40 via-amber-500/20 to-rose-500/20" : "bg-gradient-to-br from-brand/40 via-sky-500/20 to-emerald-500/20"),
        )}
        style={business.coverUrl ? { backgroundImage: `url(${business.coverUrl})` } : undefined}
      >
        <span className={cn("absolute left-4 top-3 rounded-full px-2.5 py-0.5 text-[11px] font-bold backdrop-blur", cultural ? "bg-gold/90 text-inverse" : "bg-card/90 text-brand-strong")}>
          {categoryName}
        </span>
      </div>
      <div className="-mt-8 flex flex-1 flex-col gap-2 px-5 pb-5">
        {business.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.logoUrl} alt="" className="size-14 rounded-2xl border-4 border-card object-cover" />
        ) : (
          <Monogram name={businessName} className="size-14 border-4 border-card text-xl" />
        )}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="flex items-center gap-1 font-display text-lg font-bold leading-tight text-foreground group-hover:text-brand-strong">
              <span className="truncate">{businessName}</span>
              {business.demoSample ? (
                <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-900">{t.marketplace.sample}</span>
              ) : (
                <BadgeCheck className="size-4 shrink-0 text-brand" aria-label={t.marketplace.verified} />
              )}
            </h3>
            {language !== "am" && business.nameAm && <p lang="am" className="truncate font-geez text-sm text-muted-foreground">{business.nameAm}</p>}
          </div>
          <Stars value={business.ratingAverage} count={business.ratingCount} />
        </div>
        {business.tagline && <p className="line-clamp-2 text-sm text-muted-foreground">{business.tagline}</p>}

        {Boolean(business.matchingServices?.length) && (
          <div className="flex flex-wrap gap-1 pt-1">
            {business.matchingServices!.slice(0, 2).map((srv) => (
              <span key={srv} className="inline-flex items-center rounded-lg bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand-strong">
                {srv}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{[business.city, business.region].filter(Boolean).join(", ") || t.marketplace.ethiopia}</span>
          </span>
          {business.fromPriceEtb && <span className="shrink-0 font-semibold text-foreground">{t.marketplace.from} {formatEtb(business.fromPriceEtb)}</span>}
        </div>
      </div>
    </Link>
  );
}
