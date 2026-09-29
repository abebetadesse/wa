"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Button, Card, CardContent, ErrorState, LoadingState, PageShell } from "@/components/ui";
import { useSession } from "@/features/session/SessionProvider";
import { useApi } from "@/features/workspace/useApi";

interface Preview {
  businessName: string;
  businessId: string;
  role: string;
  title: string | null;
  state: "pending" | "accepted" | "revoked" | "expired";
  email: string;
  matchesAccount: boolean;
}

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { user, loading, signOut } = useSession();
  const preview = useApi<Preview>(user ? `/api/invitations/${token}` : null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace(`/auth?next=${encodeURIComponent(`/invitations/${token}`)}`);
  }, [loading, user, router, token]);

  async function accept() {
    setBusy(true);
    setError(null);
    try {
      const result = await apiFetch<{ businessId: string }>(`/api/invitations/${token}`, { method: "POST" });
      router.push(`/business/${result.businessId}`);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  if (loading || !user || (!preview.data && !preview.error)) return <PageShell width="narrow"><LoadingState /></PageShell>;
  if (preview.error) return <PageShell width="narrow"><ErrorState message={preview.error === "Invitation not found." ? "This invitation link is not valid." : preview.error} /></PageShell>;
  const invite = preview.data!;

  return (
    <PageShell width="narrow">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-brand/20 via-transparent to-gold/20 p-8 text-center">
          <Users className="mx-auto size-10 text-brand" aria-hidden="true" />
          <h1 className="mt-4 font-display text-2xl font-extrabold text-foreground">Join {invite.businessName}</h1>
          <p className="mt-1 text-muted-foreground">
            as <span className="font-semibold capitalize text-foreground">{invite.role}</span>
            {invite.title ? ` · ${invite.title}` : ""}
          </p>
        </div>
        <CardContent className="flex flex-col gap-4 pt-6">
          {invite.state !== "pending" && <Alert tone="warning">This invitation has been {invite.state}. Ask the business owner for a new one.</Alert>}
          {invite.state === "pending" && !invite.matchesAccount && (
            <Alert tone="warning" title="Different account">
              This invitation is for {invite.email}, but you&apos;re signed in as {user.email}.{" "}
              <button type="button" className="font-semibold text-brand underline" onClick={async () => { await signOut(); router.push(`/auth?next=${encodeURIComponent(`/invitations/${token}`)}`); }}>
                Sign in with another account
              </button>
            </Alert>
          )}
          {error && <Alert tone="danger">{error}</Alert>}
          {invite.state === "pending" && invite.matchesAccount && (
            <Button size="lg" onClick={accept} disabled={busy}>{busy ? "Joining…" : "Accept and open the workspace"}</Button>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
