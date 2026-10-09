import type { Metadata } from "next";
import { HomePageContent } from "@/components/home/HomePageContent";
import { directoryFacets, searchDirectory } from "@/server/marketplace/businesses";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ethiopian Wisdom | Traditional healers & cultural makers",
  description: "Find and book verified traditional healers, debteras, herbalists and cultural makers across Ethiopia.",
};

async function loadHome() {
  try {
    const viewer = await getAuthenticatedUser().catch(() => null);
    const [facets, featured] = await Promise.all([directoryFacets(viewer), searchDirectory({ sort: "rating", page: 1, limit: 6 }, viewer)]);
    return { facets, featured };
  } catch (error) {
    console.error("[home] marketplace data unavailable:", error);
    return null;
  }
}

export default async function HomePage() {
  const data = await loadHome();
  return <HomePageContent data={data} />;
}
