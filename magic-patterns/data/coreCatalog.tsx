import React from 'react';
import { TurretCannon } from '../components/sprites/Hazards';
import { ExitDoor, GoalFlag, PortalGate } from '../components/sprites/Mechanics';
import {
  BatteryCell,
  CoinPickup,
  GemPickup,
  KeyPickup } from
'../components/sprites/Collectibles';

const SIZE = 76;

type CoreEntry = {
  id: string;
  name: string;
  render: () => React.ReactNode;
};

/**
 * Core Magic Patterns sprites bridged onto bundled catalog rows. Only ids
 * whose colliders are roughly square are registered — wide, short bodies
 * (spike strips, bounce pads) keep the palette-aware drawn art so the visible
 * shape always matches the physics shape.
 */
export const coreEntries: CoreEntry[] = [
{ id: 'enemy-turret', name: 'Turret enemy', render: () => <TurretCannon size={SIZE} animated /> },
{ id: 'mechanic-exit-door', name: 'Exit door', render: () => <ExitDoor size={SIZE} animated /> },
{ id: 'decor-finish-flag', name: 'Finish flag', render: () => <GoalFlag size={SIZE} animated /> },
{ id: 'mechanic-portal-gate', name: 'Portal gate', render: () => <PortalGate size={SIZE} animated /> },
{ id: 'collectible-coin', name: 'Coin', render: () => <CoinPickup size={SIZE} animated /> },
{ id: 'collectible-gem', name: 'Gem', render: () => <GemPickup size={SIZE} animated /> },
{ id: 'collectible-key', name: 'Key collectible', render: () => <KeyPickup size={SIZE} animated /> },
{ id: 'collectible-battery', name: 'Battery collectible', render: () => <BatteryCell size={SIZE} animated /> }];
