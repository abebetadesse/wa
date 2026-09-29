"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { Inbox } from "@/features/messages/Inbox";
import { useWorkspace } from "@/features/workspace/WorkspaceContext";

export default function BusinessMessagesPage() {
  const params = useParams<{ conversationId?: string[] }>();
  const { business, base } = useWorkspace();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Messages" description="Conversations with your clients. Everyone on your team sees new messages instantly." className="mb-0" />
      <Inbox
        endpoint={`/api/workspace/businesses/${business.id}/conversations`}
        selectedId={params.conversationId?.[0]}
        hrefFor={(id) => `${base}/messages/${id}`}
        emptyHint="When a client messages you from your public page, the conversation appears here."
      />
    </div>
  );
}
