import { Metadata } from "next";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Personal Profile | Ethiopian Astrology, Numerology & Naming",
  description: "Unified personal Welbeing profiling module integrating classical Ethiopian Awde Negest astrology, Pythagorean numerology, and cultural naming analysis.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
