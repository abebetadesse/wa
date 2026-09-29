"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Copy, LogOut, Mail, Trash2, UserPlus } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Badge, Button, Card, CardContent, CardHeader, CardTitle, Dialog, ErrorState, Field, Input, LoadingState, PageHeader, Select } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useWorkspace } from "@/features/workspace/WorkspaceContext";
import { useToast } from "@/features/feedback/Toaster";
import { Monogram } from "@/features/marketplace/shared";

interface Team {
  members: { id: string; userId: string; role: string; title: string | null; isBookable: boolean; name: string | null; email: string; joinedAt: string }[];
  invitations: { id: string; email: string; role: string; title: string | null; expiresAt: string; createdAt: string }[];
  myRole: string;
  myUserId: string;
}

const ROLE_INFO: Record<string, string> = {
  owner: "Everything, including the team",
  manager: "Runs the business: services, hours, payments, reviews",
  practitioner: "Serves clients: bookings, clients, remedies, case reviews",
  staff: "Front desk: bookings, payments and messages",
};

export default function TeamPage() {
  const { business } = useWorkspace();
  const router = useRouter();
  const toast = useToast();
  const { data, error, reload } = useApi<Team>(`/api/workspace/businesses/${business.id}/team`, { liveTypes: ["team."] });
  const [inviting, setInviting] = useState(false);
  const [link, setLink] = useState<{ email: string; url: string } | null>(null);
  const [removing, setRemoving] = useState<Team["members"][number] | null>(null);

  async function patchMember(memberId: string, body: Record<string, unknown>) {
    try {
      await apiFetch(`/api/workspace/businesses/${business.id}/team/members/${memberId}`, { method: "PATCH", json: body });
      reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not update", body: errorMessage(err) });
    }
  }

  async function remove(member: Team["members"][number]) {
    try {
      const result = await apiFetch<{ left: boolean }>(`/api/workspace/businesses/${business.id}/team/members/${member.id}`, { method: "DELETE" });
      setRemoving(null);
      if (result.left) {
        toast({ tone: "success", title: `You left ${business.name}` });
        router.push("/business");
      } else {
        toast({ tone: "success", title: `${member.name ?? member.email} was removed` });
        reload();
      }
    } catch (err) {
      toast({ tone: "error", title: "Could not remove", body: errorMessage(err) });
    }
  }

  async function revoke(invitationId: string) {
    try {
      await apiFetch(`/api/workspace/businesses/${business.id}/team/invitations/${invitationId}`, { method: "DELETE" });
      toast({ tone: "success", title: "Invitation cancelled" });
      reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not cancel", body: errorMessage(err) });
    }
  }

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;
  const isOwner = data.myRole === "owner";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Team"
        description="Everyone who works in this business, and what each role can do."
        actions={isOwner ? <Button onClick={() => setInviting(true)}><UserPlus className="size-4" aria-hidden="true" /> Invite someone</Button> : undefined}
        className="mb-0"
      />

      {link && (
        <Alert tone="success" title={`Invitation created for ${link.email}`}>
          <span className="block">Share this link with them. It works once, only for that email address, and expires in 14 days. It won&apos;t be shown again.</span>
          <CopyField value={link.url} />
        </Alert>
      )}

      <Card>
        <CardContent className="divide-y divide-border pt-2">
          {data.members.map((member) => {
            const self = member.userId === data.myUserId;
            const editable = isOwner && member.role !== "owner";
            return (
              <div key={member.id} className="flex flex-wrap items-center gap-4 py-4">
                <Monogram name={member.name ?? member.email} className="size-11 rounded-full text-base" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{member.name ?? member.email}{self && <span className="text-muted-foreground"> (you)</span>}</p>
                  <p className="truncate text-xs text-muted-foreground">{member.email}{member.title ? ` · ${member.title}` : ""}</p>
                </div>
                {editable ? (
                  <Select aria-label={`Role for ${member.name ?? member.email}`} className="h-9 w-40 py-1" value={member.role} onChange={(e) => patchMember(member.id, { role: e.target.value })}>
                    <option value="manager">Manager</option>
                    <option value="practitioner">Practitioner</option>
                    <option value="staff">Staff</option>
                  </Select>
                ) : (
                  <Badge tone={member.role === "owner" ? "gold" : "neutral"} className="capitalize">{member.role}</Badge>
                )}
                {isOwner && (
                  <label className="flex items-center gap-2 text-xs text-muted-foreground" title="Clients can choose this person when booking">
                    <input type="checkbox" checked={member.isBookable} onChange={(e) => patchMember(member.id, { isBookable: e.target.checked })} className="size-4 accent-[var(--brand-accent)]" />
                    Bookable
                  </label>
                )}
                {(editable || (self && member.role !== "owner")) && (
                  <Button variant="ghost" size="sm" className="text-danger" onClick={() => setRemoving(member)}>
                    {self ? <><LogOut className="size-4" aria-hidden="true" /> Leave</> : <><Trash2 className="size-4" aria-hidden="true" /> Remove</>}
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {isOwner && data.invitations.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Pending invitations</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {data.invitations.map((invitation) => (
              <div key={invitation.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm">
                <Mail className="size-4 text-muted-foreground" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-foreground">{invitation.email}</span>
                <Badge tone="neutral" className="capitalize">{invitation.role}</Badge>
                <span className="text-xs text-muted-foreground">expires {new Date(invitation.expiresAt).toLocaleDateString()}</span>
                <Button variant="ghost" size="sm" onClick={() => revoke(invitation.id)}>Cancel</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">What each role can do</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2">
            {Object.entries(ROLE_INFO).map(([role, info]) => (
              <div key={role} className="rounded-2xl bg-muted/60 p-3">
                <dt className="font-semibold capitalize text-foreground">{role}</dt>
                <dd className="text-sm text-muted-foreground">{info}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {inviting && (
        <InviteDialog
          onClose={() => setInviting(false)}
          onInvited={(email, url) => {
            setLink({ email, url });
            reload();
          }}
        />
      )}

      <Dialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        size="sm"
        title={removing?.userId === data.myUserId ? `Leave ${business.name}?` : `Remove ${removing?.name ?? removing?.email}?`}
        description={removing?.userId === data.myUserId ? "You'll lose access to this workspace." : "They lose access immediately. Their past bookings and notes stay with the business."}
        footer={<><Button variant="ghost" onClick={() => setRemoving(null)}>Cancel</Button><Button variant="destructive" onClick={() => removing && remove(removing)}>{removing?.userId === data.myUserId ? "Leave" : "Remove"}</Button></>}
      >
        <p className="text-sm text-muted-foreground">You can invite them again later.</p>
      </Dialog>
    </div>
  );
}

function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-2 flex items-center gap-2">
      <Input readOnly value={value} onFocus={(e) => e.target.select()} className="h-10 font-mono text-xs" aria-label="Invitation link" />
      <Button
        size="sm"
        variant="outline"
        onClick={async () => {
          await navigator.clipboard.writeText(value).catch(() => null);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />} {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

function InviteDialog({ onClose, onInvited }: { onClose: () => void; onInvited: (email: string, url: string) => void }) {
  const { business } = useWorkspace();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("practitioner");
  const [title, setTitle] = useState("");
  const [bookable, setBookable] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function send() {
    setBusy(true);
    setError(null);
    try {
      const result = await apiFetch<{ email: string; link: string }>(`/api/workspace/businesses/${business.id}/team`, {
        method: "POST",
        json: { email, role, title: title.trim() || undefined, isBookable: bookable },
      });
      onInvited(result.email, result.link);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onClose={onClose} title="Invite someone to your team" description="If they already have an account, they'll also see the invitation in their notifications." footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={send} disabled={busy || !email.includes("@")}>{busy ? "Creating…" : "Create invitation"}</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" required className="sm:col-span-2">{(control) => <Input {...control} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
        <Field label="Role" hint={ROLE_INFO[role]}>
          {(control) => (
            <Select {...control} value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="manager">Manager</option>
              <option value="practitioner">Practitioner</option>
              <option value="staff">Staff</option>
            </Select>
          )}
        </Field>
        <Field label="Title (optional)">{(control) => <Input {...control} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Herbalist" />}</Field>
        <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
          <input type="checkbox" checked={bookable} onChange={(e) => setBookable(e.target.checked)} className="size-4 accent-[var(--brand-accent)]" />
          Clients can book this person directly
        </label>
        {error && <Alert tone="danger" className="sm:col-span-2">{error}</Alert>}
      </div>
    </Dialog>
  );
}
