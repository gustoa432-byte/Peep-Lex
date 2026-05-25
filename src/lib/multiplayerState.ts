export interface PlayerStateSnapshot {
  t: number;
  position: { x: number, y: number, z: number };
  rotation: number;
  animation?: any;
  devSettings?: any;
}

export const remoteState = {
  players: new Map<string, any>(),
  physics: new Map<string, any>(),
  playerBuffers: new Map<string, PlayerStateSnapshot[]>()
};
