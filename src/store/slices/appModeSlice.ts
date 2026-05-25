import { AppState, AppMode } from '../types';

export const createAppModeSlice = (set: any, get: any) => ({
  appMode: 'editor' as AppMode,
  setAppMode: (mode: AppMode) => set((state: AppState) => ({ 
    appMode: mode, 
    isCrouching: false, 
    isFirstPerson: false,
    hasSlingshot: false,
    isNearSlingshot: false,
    move: { x: 0, y: 0 },
    look: { x: 0, y: 0 },
    isPlayingAnimation: false,
    isPlayingLoops: false
  })),

  isDevUiOpen: false,
  setIsDevUiOpen: (val: boolean) => set({ isDevUiOpen: val }),
  
  isUiHidden: false,
  setIsUiHidden: (val: boolean) => set({ isUiHidden: val }),
  
  showStats: false,
  setShowStats: (val: boolean) => set({ showStats: val }),
});
