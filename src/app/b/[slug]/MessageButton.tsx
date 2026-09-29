"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Button } from "@/components/ui";
import { useSession } from "@/features/session/SessionProvider";
import { useToast } from "@/features/feedback/Toaster";

export function MessageButton({ slug }: { slug: string }) {
  const router = useRouter();
  const { user } = useSession();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function open() {
    if (!user) {
      router.push(`/auth?next=${encodeURIComponent(`/b/${slug}`)}`);
      return;
    }
    setBusy(true);
    try {
      const conversation = await apiFetch<{ id: string }>(`/api/marketplace/businesses/${slug}/conversation`, { method: "POST" });
      router.push(`/messages/${conversation.id}`);
    } catch (error) {
      toast({ tone: "error", title: "Could not open the conversation", body: errorMessage(error) });
      setBusy(false);
    }
  }

  return (
    <Button variant="outline" size="lg" onClick={open} disabled={busy}>
      <MessageCircle className="size-4" aria-hidden="true" /> Message
    </Button>
  );
}
