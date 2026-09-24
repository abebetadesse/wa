import type { Metadata } from "next";
import { PageShell } from "@/components/ui";
import { WorkflowHub } from "./WorkflowHub";

export const metadata: Metadata = {
  title: "Expert-reviewed cases | Ethiopian Wisdom Platform",
  description: "Start a career, legal, relationship, community or spiritual case reviewed by a verified practitioner.",
};

export default function WorkflowsPage() {
  return (
    <PageShell>
      <WorkflowHub />
    </PageShell>
  );
}
