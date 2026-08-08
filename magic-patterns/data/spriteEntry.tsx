import React from 'react';
import type { CatalogEntry, SpriteCategory } from '../types/game';

export const PREVIEW_SIZE = 76;

type SpriteComponent = React.ComponentType<{size?: number;animated?: boolean;}>;

/** Builds a catalog entry for a square sprite component. */
export function spriteEntry(
id: string,
name: string,
category: SpriteCategory,
description: string,
tags: string[],
Comp: SpriteComponent,
animated = true)
: CatalogEntry {
  return {
    id,
    name,
    category,
    description,
    tags,
    render: () => <Comp size={PREVIEW_SIZE} animated={animated} />
  };
}

/** Row shape used by the everyday-object catalog: component, name, role, mechanic tag, animated. */
export type ObjectRow = [SpriteComponent, string, string, string, boolean?];

/** Expands a category of everyday objects into catalog entries. */
export function objectGroup(category: SpriteCategory, prefix: string, rows: ObjectRow[]): CatalogEntry[] {
  return rows.map(([Comp, name, description, mechanic, animated = false]) =>
  spriteEntry(
    `${prefix}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name,
    category,
    description,
    ['everyday', mechanic],
    Comp,
    animated
  )
  );
}
