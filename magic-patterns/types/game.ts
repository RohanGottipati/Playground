export type SpriteCategory =
'characters' |
'enemies' |
'terrain' |
'hazards' |
'mechanics' |
'collectibles' |
'decor' |
'furniture' |
'kitchen' |
'food' |
'tech' |
'stationery' |
'sports' |
'vehicles' |
'tools' |
'clothing' |
'outdoors' |
'toys' |
'music' |
'household' |
'hud' |
'controls' |
'panels' |
'overlays';

export type SpriteMotion = 'none' | 'bob' | 'float' | 'spin' | 'pulse' | 'sway';

export interface SpriteProps {
  /** Rendered pixel size of the square sprite. */
  size?: number;
  /** Extra classes applied to the sprite wrapper. */
  className?: string;
  /** Enables the sprite's idle motion loop. */
  animated?: boolean;
  /** Accessible label. Pass null for decorative sprites. */
  label?: string;
}

export interface CatalogEntry {
  id: string;
  name: string;
  category: SpriteCategory;
  description: string;
  tags: string[];
  /** Preview render. `wide` entries get a full-width stage. */
  render: () => React.ReactNode;
  wide?: boolean;
  dark?: boolean;
}
