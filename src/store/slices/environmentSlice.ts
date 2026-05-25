import { AppState } from '../types';

export const createEnvironmentSlice = (set: any) => ({
  bgSphereY: 7.3,
  setBgSphereY: (val: number) => set({ bgSphereY: val }),
  bgSphereRotY: -1.38,
  setBgSphereRotY: (val: number) => set({ bgSphereRotY: val }),

  environmentTime: 'day' as 'day' | 'night' | 'dusk',
  setEnvironmentTime: (time: 'day' | 'night' | 'dusk') => set({ environmentTime: time }),
  
  environmentTerrain: 'concrete' as 'concrete' | 'grass' | 'dirt',
  setEnvironmentTerrain: (terrain: 'concrete' | 'grass' | 'dirt') => set({ environmentTerrain: terrain }),
});
