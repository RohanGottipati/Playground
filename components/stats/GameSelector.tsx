"use client";

import { Gamepad2 } from "lucide-react";

export type SelectableGame = { id: string; title: string };

export function GameSelector({
  games,
  selectedId,
  onSelect,
}: {
  games: SelectableGame[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-xl border-[3px] border-ink bg-cabinet/90 px-3 py-2 font-mono text-xs uppercase text-paper/70">
      <Gamepad2 className="h-4 w-4 text-token" aria-hidden />
      <span className="whitespace-nowrap text-paper/50">Game</span>
      <select
        value={selectedId ?? ""}
        onChange={(event) => onSelect(event.target.value)}
        className="min-w-0 max-w-[16rem] truncate bg-transparent text-paper outline-none"
      >
        {games.map((game) => (
          <option key={game.id} value={game.id} className="bg-cabinet text-paper">
            {game.title}
          </option>
        ))}
      </select>
    </label>
  );
}
