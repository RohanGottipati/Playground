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
  return (
    <>
      <div className="fixed inset-0 -z-10 bg-white" />
      <div className="space-y-10">
        <header className="space-y-1">
          <p className="font-inter text-sm font-medium uppercase tracking-wide text-appleGray">
            Make a game
          </p>
          <h1
            className="font-inter font-medium text-appleInk"
            style={{ fontSize: 30, letterSpacing: "-0.04em" }}
          >
            Create
          </h1>
          <p className="font-inter text-sm text-appleGray" style={{ letterSpacing: "-0.01em" }}>
            Take one photo of real objects and get a playable platformer.
          </p>
        </header>

        <CreateFlow parentGameId={remixOf} />
      </div>
    </>
  );
}
