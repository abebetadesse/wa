// Foods page — now fully client-side for interactive filtering and deep nutrient panels.
// The heavy lifting is in FoodsClient.tsx which imports all static nutrition data directly.
import FoodsPageClient from "./FoodsClient";

export const metadata = {
  title: "Ethiopian Foods & Nutrition Science | Debtera",
  description:
    "Explore the full nutritional composition of traditional Ethiopian foods — ingredients, cereals, amino acids, fatty acids, phenolics, antinutritional factors, and bioavailability.",
};

export default function FoodsPage() {
  return <FoodsPageClient />;
}
