import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = searchParams ? await searchParams : {};
  const next = typeof params?.next === "string" ? `&next=${encodeURIComponent(params.next)}` : "";
  redirect(`/auth?mode=login${next}`);
}
