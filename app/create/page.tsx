import type { Metadata } from "next";
import { CreateFlow } from "@/components/create/CreateFlow";

export const metadata: Metadata = {
  title: "Make a game — Playground",
  description: "Take one photo of real objects and get a playable platformer.",
};

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ remixOf?: string }>;
}) {
  const { remixOf } = await searchParams;
  return <CreateFlow parentGameId={remixOf} />;
}
