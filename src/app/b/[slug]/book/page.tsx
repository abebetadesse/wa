import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/ui";
import { BookingWizard } from "./BookingWizard";

export const metadata: Metadata = { title: "Book a service" };

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Suspense fallback={<LoadingState />}>
        <BookingWizard slug={slug} />
      </Suspense>
    </div>
  );
}
