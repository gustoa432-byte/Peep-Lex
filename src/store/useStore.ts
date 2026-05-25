import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState } from './types';
import { defaultDevSettings } from './defaults';

import { createMultiplayerSlice } from './slices/multiplayerSlice';
import { createAppModeSlice } from './slices/appModeSlice';
import { createProfileSlice } from './slices/profileSlice';
import { createCharacterSlice } from './slices/characterSlice';
import { createMovementSlice } from './slices/movementSlice';
import { createEnvironmentSlice } from './slices/environmentSlice';
import { createRoomEditorSlice } from './slices/roomEditorSlice';
import { createAnimationSlice } from './slices/animationSlice';
import { createMediaLoopsSlice } from './slices/mediaLoopsSlice';

export * from './types';
export * from './defaults';

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...createMultiplayerSlice(set, get),
      ...createAppModeSlice(set, get),
      ...createProfileSlice(set, get),
      ...createCharacterSlice(set, get),
      ...createMovementSlice(set, get),
      ...createEnvironmentSlice(set),
      ...createRoomEditorSlice(set),
      ...createAnimationSlice(set, get),
      ...createMediaLoopsSlice(set),
    }),
    {
      name: 'peep-studio-storage',
      merge: (persistedState: any, currentState: AppState) => {
        const merged = { ...currentState, ...persistedState };
        if (merged.devSettings) {
          let poseSettings = merged.devSettings;
          if ((!merged.loops || merged.loops.length === 0) && (!merged.keyframes || merged.keyframes.length === 0)) {
             const tempSettings = { ...poseSettings };
             poseSettings = { ...defaultDevSettings };
             const keysToPreserve = [
               'cameraDistance', 'cameraHeight', 'cameraPitch', 'worldCameraDistance', 'worldCameraHeight', 'worldCameraPitch',
               'spotLightPosX', 'spotLightPosY', 'spotLightPosZ', 'spotLightAngle', 'spotLightPenumbra', 'spotLightIntensity',
               'rimPinkPosX', 'rimPinkPosY', 'rimPinkPosZ', 'rimPinkIntensity',
               'rimCyanPosX', 'rimCyanPosY', 'rimCyanPosZ', 'rimCyanIntensity',
               'backFillPosX', 'backFillPosY', 'backFillPosZ', 'backFillIntensity',
               'ambientIntensity'
             ];
             keysToPreserve.forEach(k => {
               (poseSettings as any)[k] = (tempSettings as any)[k];
             });
          }
          merged.devSettings = poseSettings;
        }
        return merged;
      },
      partialize: (state) => ({
        appMode: state.appMode,
        isBodyEditorOpen: state.isBodyEditorOpen,
        activeTab: state.activeTab,
        selectedColorPart: state.selectedColorPart,
        activeBodyPart: state.activeBodyPart,
        isAnimationMenuOpen: state.isAnimationMenuOpen,
        isUiHidden: state.isUiHidden,
        activeBoneName: state.activeBoneName,
        activePoseSection: state.activePoseSection,
        isTwistMode: state.isTwistMode,
        
        characterConfig: state.characterConfig,
        devSettings: state.devSettings,
        history: state.history,
        historyIndex: state.historyIndex,
        keyframes: state.keyframes,
        selectedKeyframeIndex: state.selectedKeyframeIndex,
        editingLoopId: state.editingLoopId,
        animationSpeed: state.animationSpeed,
        loops: state.loops,
        flexPacks: state.flexPacks,
        trackBPM: state.trackBPM,
        
        globalTrackUrl: state.globalTrackUrl,
        backgroundVideoUrl: state.backgroundVideoUrl,
        globalTrackStartTime: state.globalTrackStartTime,
        currentLoopStartTime: state.currentLoopStartTime,
        profile: state.profile,

        roomObjects: state.roomObjects,
        environmentTime: state.environmentTime,
        environmentTerrain: state.environmentTerrain,
      }),
    }
  )
);

