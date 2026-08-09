export type DashboardEntity = {
  id: string;
  mechanic: string;
  sourceLabel?: string;
  bounds: { x: number; y: number; width: number; height: number };
};

export type DashboardWorld = { width: number; height: number };

export type DeathPoint = { x: number; y: number };
