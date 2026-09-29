"use client";

import { useParams } from "next/navigation";
import { PageHeader, PageShell } from "@/components/ui";
import { Inbox } from "@/features/messages/Inbox";

export default function MessagesPage() {
  const params = useParams<{ conversationId?: string[] }>();
  const selectedId = params.conversationId?.[0];
  return (
    <PageShell width="wide">
      <PageHeader eyebrow="Your account" title="Messages" description="Private conversations with the businesses you book." />
      <Inbox
        endpoint="/api/conversations"
        selectedId={selectedId}
        hrefFor={(id) => `/messages/${id}`}
        emptyHint="Open a business page and press Message to start a conversation."
      />
    </PageShell>
  );
}
