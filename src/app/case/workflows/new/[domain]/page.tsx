import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui";
import { WORKFLOW_DOMAINS, type WorkflowDomain } from "@/server/cases/types";
import { StartCase } from "./StartCase";

export default async function NewCasePage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  if (!(WORKFLOW_DOMAINS as readonly string[]).includes(domain)) notFound();
  return (
    <PageShell width="narrow">
      <StartCase domain={domain as WorkflowDomain} />
    </PageShell>
  );
}
