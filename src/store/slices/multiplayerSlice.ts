import { AppState, PlayerState } from '../types';

export const createMultiplayerSlice = (set: any, get: any) => ({
  otherPlayers: [] as PlayerState[],
  setOtherPlayers: (players: PlayerState[]) => set({ otherPlayers: players }),
  addOtherPlayer: (player: PlayerState) => set((state: AppState) => ({ otherPlayers: [...state.otherPlayers, player] })),
  removeOtherPlayer: (id: string) => set((state: AppState) => ({ otherPlayers: state.otherPlayers.filter(p => p.id !== id) })),
  updateOtherPlayer: (player: PlayerState) => set((state: AppState) => ({
    otherPlayers: state.otherPlayers.map(p => p.id === player.id ? { ...p, ...player } : p)
  })),

  physicsObjects: [],
  setPhysicsObjects: (objects: any[]) => set({ physicsObjects: objects }),

  isOnPodium: false,
  setIsOnPodium: (val: boolean) => set({ isOnPodium: val }),
});
