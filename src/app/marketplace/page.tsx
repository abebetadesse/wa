import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/ui";
import { Directory } from "./Directory";

export const metadata: Metadata = {
  title: "Find a healer or cultural maker",
  description: "Search verified traditional healers, debteras, herbalists, artisans and ceremony hosts across Ethiopia.",
};

export default function MarketplacePage() {
  return (
    <Suspense fallback={<LoadingState label="Loading the marketplace…" />}>
      <Directory />
    </Suspense>
  );
}
