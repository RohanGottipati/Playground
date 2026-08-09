import {
  hasMagicPatternComponent,
  magicPatternSpriteUrl,
} from "@/magic-patterns/registry";

/**
 * Path to a catalog component's pre-rendered SVG. Safe in client components:
 * the art is generated ahead of time into public/sprites, never rendered in
 * the browser.
 */
export function spriteUrl(componentId: string | undefined): string | undefined {
  return hasMagicPatternComponent(componentId)
    ? magicPatternSpriteUrl(componentId)
    : undefined;
}
