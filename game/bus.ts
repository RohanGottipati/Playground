import type { GameEventType } from "./types";

export type HudState = {
  elapsedMs: number;
  deaths: number;
  collectibles: number;
  totalCollectibles: number;
};

export type RunResult = {
  elapsedMs: number;
  deaths: number;
  collectibles: number;
  totalCollectibles: number;
};

export type BusEvents = {
  ready: undefined;
  hud: HudState;
  gameEvent: { type: GameEventType; payload?: Record<string, string | number | boolean> };
  completed: RunResult;
  error: { message: string };
};

type Handler<K extends keyof BusEvents> = (payload: BusEvents[K]) => void;
type AnyHandler = (payload: never) => void;

/** Minimal typed emitter so Phaser never writes into React state directly. */
export class GameBus {
  private handlers = new Map<keyof BusEvents, Set<AnyHandler>>();

  on<K extends keyof BusEvents>(type: K, handler: Handler<K>): () => void {
    let set = this.handlers.get(type);
    if (!set) {
      set = new Set<AnyHandler>();
      this.handlers.set(type, set);
    }
    set.add(handler as AnyHandler);
    return () => set?.delete(handler as AnyHandler);
  }

  emit<K extends keyof BusEvents>(type: K, payload: BusEvents[K]): void {
    for (const handler of this.handlers.get(type) ?? []) {
      (handler as (value: BusEvents[K]) => void)(payload);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}

export type ControlState = {
  left: boolean;
  right: boolean;
  jump: boolean;
  restart: boolean;
};

export function createControlState(): ControlState {
  return { left: false, right: false, jump: false, restart: false };
}
