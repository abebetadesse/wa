"use client";

import { useState } from "react";
import { MessageSquareReply } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Badge, Button, EmptyState, ErrorState, Field, LoadingState, PageHeader, Textarea } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useWorkspace } from "@/features/workspace/WorkspaceContext";
import { useToast } from "@/features/feedback/Toaster";
import { Stars } from "@/features/marketplace/shared";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  response: string | null;
  respondedAt: string | null;
  status: string;
  createdAt: string;
}

export default function ReviewsPage() {
  const { business, can } = useWorkspace();
  const toast = useToast();
  const { data, error, reload } = useApi<Review[]>(`/api/workspace/businesses/${business.id}/reviews`, { liveTypes: ["review."] });
  const [replying, setReplying] = useState<string | null>(null);
  const [text, setText] = useState("");

  async function reply(reviewId: string) {
    try {
      await apiFetch(`/api/workspace/businesses/${business.id}/reviews/${reviewId}/response`, { method: "POST", json: { response: text } });
      toast({ tone: "success", title: "Reply published" });
      setReplying(null);
      reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not publish reply", body: errorMessage(err) });
    }
  }

  const distribution = [5, 4, 3, 2, 1].map((stars) => ({ stars, count: (data ?? []).filter((r) => r.rating === stars && r.status === "published").length }));
  const total = distribution.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Reviews" description="Only clients with a completed booking can leave a review." className="mb-0" />
      {error && <ErrorState message={error} onRetry={reload} />}
      {!error && !data && <LoadingState />}
      {data && data.length === 0 && <EmptyState title="No reviews yet" description="Reviews appear here after clients complete a booking." />}
      {data && data.length > 0 && (
        <>
          <div className="grid gap-6 rounded-3xl border border-border bg-card p-6 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="text-center">
              <p className="font-display text-5xl font-extrabold text-foreground">{business.ratingAverage ? Number(business.ratingAverage).toFixed(1) : "—"}</p>
              <Stars value={business.ratingAverage} count={business.ratingCount} />
            </div>
            <ul className="flex flex-col gap-1.5">
              {distribution.map((d) => (
                <li key={d.stars} className="flex items-center gap-3 text-sm">
                  <span className="w-10 text-muted-foreground">{d.stars} ★</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-gold" style={{ width: `${total ? (d.count / total) * 100 : 0}%` }} /></span>
                  <span className="w-6 text-right text-muted-foreground">{d.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <ul className="flex flex-col gap-3">
            {data.map((review) => (
              <li key={review.id} className="rounded-3xl border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-gold" aria-label={`${review.rating} out of 5`}>{"★".repeat(review.rating)}<span className="text-muted-foreground/40">{"★".repeat(5 - review.rating)}</span></p>
                  <div className="flex items-center gap-2">
                    {review.status === "hidden" && <Badge tone="danger">Hidden by moderators</Badge>}
                    <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {review.comment && <p className="mt-2 text-foreground">{review.comment}</p>}
                {review.response && replying !== review.id && (
                  <div className="mt-3 rounded-2xl bg-muted p-3 text-sm">
                    <p className="text-xs font-semibold text-muted-foreground">Your reply</p>
                    <p className="text-foreground">{review.response}</p>
                  </div>
                )}
                {can("respondReviews") && replying !== review.id && (
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setReplying(review.id); setText(review.response ?? ""); }}>
                    <MessageSquareReply className="size-4" aria-hidden="true" /> {review.response ? "Edit reply" : "Reply"}
                  </Button>
                )}
                {replying === review.id && (
                  <div className="mt-3 flex flex-col gap-2">
                    <Field label="Public reply">{(control) => <Textarea {...control} rows={3} value={text} onChange={(e) => setText(e.target.value)} />}</Field>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setReplying(null)}>Cancel</Button>
                      <Button size="sm" onClick={() => reply(review.id)} disabled={text.trim().length < 2}>Publish reply</Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
