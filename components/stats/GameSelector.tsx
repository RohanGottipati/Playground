"use client";

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
    <label className="flex max-w-md items-center gap-3 rounded-2xl bg-appleBg px-4 py-3">
      <span className="whitespace-nowrap font-inter text-xs font-medium uppercase tracking-wide text-appleGray">
        Game
      </span>
      <select
        value={selectedId ?? ""}
        onChange={(event) => onSelect(event.target.value)}
        className="min-w-0 flex-1 truncate bg-transparent font-inter text-sm font-medium text-appleInk outline-none"
      >
        {games.map((game) => (
          <option key={game.id} value={game.id}>
            {game.title}
          </option>
        ))}
      </select>
    </label>
  );
}
