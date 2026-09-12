import { Metadata } from "next";
import DiagnosticClient from "./DiagnosticClient";

export const metadata: Metadata = {
  title: "Multi-Strand Diagnostic Portal | Ethiopian Wisdom Platform",
  description:
    "Intelligent health diagnostic portal querying 10+ knowledge strands (Biochemical, Medication, Ecological, Epidemiological, Dietary, Cultural, and Astrological) with cross-strand causal reasoning and safety gate validation.",
};

export default function DiagnosticPage() {
  return <DiagnosticClient />;
}
