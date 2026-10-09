import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Clock, Globe2, MapPin, Phone, ShieldCheck } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/auth";
import { ApiError } from "@/lib/api/route";
import { getPublicBusiness } from "@/server/marketplace/businesses";
import { listPublicReviews } from "@/server/marketplace/engagement";
import { Alert, Badge, ButtonLink } from "@/components/ui";
import { LANGUAGE_LABELS, MODE_LABELS, Monogram, Stars, formatEtb } from "@/features/marketplace/shared";
import { MessageButton } from "./MessageButton";
import { HexacoreActivityGuide } from "@/features/hexacore/HexacoreActivityGuide";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  const viewer = await getAuthenticatedUser();
  try {
    const business = await getPublicBusiness(slug, viewer);
    return { business, reviews: await listPublicReviews(business.id) };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const business = await getPublicBusiness(slug, null);
    return { title: `${business.name} · ${business.category.name}`, description: business.tagline ?? business.description?.slice(0, 160) ?? undefined };
  } catch {
    return { title: "Business" };
  }
}

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { business, reviews } = await load(slug);
  const cultural = business.category.sector === "cultural";
  const demoSample = business.description?.startsWith("[DEMO SAMPLE]") ?? false;

  return (
    <div className="pb-20">
      <div
        className={`relative h-48 bg-cover bg-center sm:h-64 ${business.coverUrl ? "" : cultural ? "bg-gradient-to-br from-gold/50 via-amber-500/25 to-rose-500/25" : "bg-gradient-to-br from-brand/50 via-sky-500/25 to-emerald-500/25"}`}
        style={business.coverUrl ? { backgroundImage: `url(${business.coverUrl})` } : undefined}
      >
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
      </div>

      <div className="mx-auto -mt-20 max-w-6xl px-4 sm:px-6">
        {business.preview && (
          <Alert tone="warning" title="Preview" className="mb-4">
            Only your team can see this page until the business is verified.
          </Alert>
        )}
        {demoSample && (
          <Alert tone="warning" title="Fictional sample profile" className="mb-4">
            This profile, its owner, background, and listed service are fictional demo data. No identity or qualifications were verified; this is not a real provider or bookable service.
          </Alert>
        )}

        <div className="relative flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 shadow-xl backdrop-blur-xl sm:flex-row sm:items-end sm:p-8">
          {business.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logoUrl} alt="" className="size-24 rounded-3xl border-4 border-card object-cover shadow-lg" />
          ) : (
            <Monogram name={business.name} className="size-24 border-4 border-card text-4xl shadow-lg" />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={cultural ? "gold" : "brand"}>{business.category.name}</Badge>
              {!business.preview && !demoSample && (
                <Badge tone="success"><BadgeCheck className="size-3.5" aria-hidden="true" /> Verified</Badge>
              )}
              {demoSample && <Badge tone="warning">Sample · not credential-verified</Badge>}
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{business.name}</h1>
            {business.nameAm && <p lang="am" className="font-geez text-lg text-muted-foreground">{business.nameAm}</p>}
            {business.tagline && <p className="text-muted-foreground">{business.tagline}</p>}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <Stars value={business.ratingAverage} count={business.ratingCount} />
              {(business.city || business.region) && (
                <span className="inline-flex items-center gap-1"><MapPin className="size-4" aria-hidden="true" /> {[business.city, business.region].filter(Boolean).join(", ")}</span>
              )}
              {business.languages.length > 0 && (
                <span className="inline-flex items-center gap-1"><Globe2 className="size-4" aria-hidden="true" /> {business.languages.map((code) => LANGUAGE_LABELS[code] ?? code).join(" · ")}</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:flex-col">
            {!business.preview && !demoSample && business.services.length > 0 && <ButtonLink href={`/b/${business.slug}/book`} size="lg">Book now</ButtonLink>}
            {!business.preview && !demoSample && <MessageButton slug={business.slug} />}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
          <div className="flex flex-col gap-8">
            <section aria-labelledby="services-heading">
              <h2 id="services-heading" className="font-display text-2xl font-extrabold text-foreground">Services</h2>
              {business.services.length === 0 ? (
                <p className="mt-3 text-muted-foreground">No services are listed yet.</p>
              ) : (
                <ul className="mt-4 flex flex-col gap-3">
                  {business.services.map((service) => (
                    <li key={service.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-lg font-bold text-foreground">{service.name}</h3>
                          <Badge tone="neutral">{service.kind}</Badge>
                          {service.requiresSafetyScreen && (
                            <Badge tone="warning"><ShieldCheck className="size-3" aria-hidden="true" /> Safety check</Badge>
                          )}
                        </div>
                        {service.nameAm && <p lang="am" className="font-geez text-sm text-muted-foreground">{service.nameAm}</p>}
                        {service.description && <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden="true" /> {service.durationMinutes} min</span>
                          {service.deliveryModes.map((mode) => {
                            const meta = MODE_LABELS[mode];
                            return meta ? (
                              <span key={mode} className="inline-flex items-center gap-1"><meta.icon className="size-3.5" aria-hidden="true" /> {meta.label}</span>
                            ) : null;
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                        <span className="font-display text-xl font-extrabold text-foreground">{formatEtb(service.priceEtb)}</span>
                        {!business.preview && !demoSample && (
                          <ButtonLink href={`/b/${business.slug}/book?service=${service.id}`} variant="outline" size="sm">Book</ButtonLink>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {business.category.slug === "hexacore-practitioner" && <HexacoreActivityGuide />}

            {business.description && (
              <section aria-labelledby="about-heading">
                <h2 id="about-heading" className="font-display text-2xl font-extrabold text-foreground">About</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-foreground">{business.description}</p>
              </section>
            )}

            <section aria-labelledby="reviews-heading">
              <div className="flex items-center justify-between">
                <h2 id="reviews-heading" className="font-display text-2xl font-extrabold text-foreground">Reviews</h2>
                <Stars value={business.ratingAverage} count={business.ratingCount} size="lg" />
              </div>
              {reviews.length === 0 ? (
                <p className="mt-3 text-muted-foreground">No reviews yet. Reviews come only from clients after a completed booking.</p>
              ) : (
                <ul className="mt-4 flex flex-col gap-3">
                  {reviews.map((review) => (
                    <li key={review.id} className="rounded-2xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{review.author}</span>
                        <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="mt-1 text-gold" aria-label={`${review.rating} out of 5`}>{"★".repeat(review.rating)}<span className="text-muted-foreground/40">{"★".repeat(5 - review.rating)}</span></p>
                      {review.comment && <p className="mt-2 text-sm text-foreground">{review.comment}</p>}
                      {review.response && (
                        <div className="mt-3 rounded-xl bg-muted p-3 text-sm">
                          <p className="text-xs font-semibold text-muted-foreground">Response from {business.name}</p>
                          <p className="mt-1 text-foreground">{review.response}</p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display font-bold text-foreground">Contact & location</h2>
              <dl className="mt-3 flex flex-col gap-3 text-sm">
                {business.address && (
                  <div className="flex gap-2"><MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><dd className="text-foreground">{business.address}</dd></div>
                )}
                {business.phone && (
                  <div className="flex gap-2"><Phone className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><dd><a href={`tel:${business.phone}`} className="text-brand hover:underline">{business.phone}</a></dd></div>
                )}
              </dl>
              {business.deliveryModes.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {business.deliveryModes.map((mode) => {
                    const meta = MODE_LABELS[mode];
                    return meta ? <Badge key={mode} tone="neutral"><meta.icon className="size-3" aria-hidden="true" /> {meta.label}</Badge> : null;
                  })}
                </div>
              )}
            </div>
            {business.team.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-display font-bold text-foreground">Practitioners</h2>
                <ul className="mt-3 flex flex-col gap-3">
                  {business.team.map((member) => (
                    <li key={member.id} className="flex items-center gap-3">
                      <Monogram name={member.name ?? "?"} className="size-9 rounded-full text-sm" />
                      <span className="flex flex-col text-sm">
                        <span className="font-semibold text-foreground">{member.name}</span>
                        {member.title && <span className="text-xs text-muted-foreground">{member.title}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-2xl border border-border bg-muted/50 p-5 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5 font-semibold text-foreground"><ShieldCheck className="size-4 text-brand" aria-hidden="true" /> Your safety</p>
              <p className="mt-1">
                Traditional practice complements, and never replaces, medical care. Tell the practitioner about any medicines you take. In an emergency, see{" "}
                <Link href="/emergency" className="text-brand hover:underline">emergency support</Link>.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
