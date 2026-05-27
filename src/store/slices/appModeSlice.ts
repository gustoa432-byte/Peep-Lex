import { AppState, AppMode } from '../types';

export const createAppModeSlice = (set: any, get: any) => ({
  appMode: 'editor' as AppMode,
  transitionState: 'idle' as 'idle' | 'in' | 'out',
  transitionTargetMode: null as AppMode | null,
  setTransitionState: (state: 'idle' | 'in' | 'out') => set({ transitionState: state }),
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
  requestAppMode: (mode: AppMode) => {
    const currentState = get();
    if (currentState.appMode === mode || currentState.transitionState !== 'idle') return;
    
    // Start transition
    set({ transitionState: 'in', transitionTargetMode: mode });
    
    // Middle of transition: switch mode
    setTimeout(() => {
      currentState.setAppMode(mode);
      set({ transitionState: 'out' });
      
      // End of transition
      setTimeout(() => {
        set({ transitionState: 'idle' });
      }, 500); // 500ms for out transition
    }, 600); // 600ms for in transition (waiting for text to be readable)
  },

  isDevUiOpen: false,
  setIsDevUiOpen: (val: boolean) => set({ isDevUiOpen: val }),
  
  isUiHidden: false,
  setIsUiHidden: (val: boolean) => set({ isUiHidden: val }),
  
  showStats: false,
  setShowStats: (val: boolean) => set({ showStats: val }),
});
