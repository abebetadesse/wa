import { PageShell } from "@/components/ui";
import { CaseView } from "./CaseView";

export default async function CasePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  return (
    <PageShell width="narrow">
      <CaseView caseId={caseId} />
    </PageShell>
  );
}
