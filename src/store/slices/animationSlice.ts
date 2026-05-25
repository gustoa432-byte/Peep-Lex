import { AppState, DevSettings } from '../types';
import { defaultDevSettings } from '../defaults';

export const createAnimationSlice = (set: any, get: any) => ({
  devSettings: defaultDevSettings,
  updateDevSettings: (settings: Partial<DevSettings>, skipKeyframeUpdate?: boolean) => set((state: AppState) => {
    const newSettings = { ...state.devSettings, ...settings };
    const updates: any = { devSettings: newSettings };
    
    if (!skipKeyframeUpdate && state.selectedKeyframeIndex !== null && !state.isPlayingAnimation) {
      const cleanedPose = { ...newSettings };
      const keysToRemove = [
        'cameraDistance', 'cameraHeight', 'cameraPitch', 'worldCameraDistance', 'worldCameraHeight', 'worldCameraPitch',
        'spotLightPosX', 'spotLightPosY', 'spotLightPosZ', 'spotLightAngle', 'spotLightPenumbra', 'spotLightIntensity',
        'rimPinkPosX', 'rimPinkPosY', 'rimPinkPosZ', 'rimPinkIntensity',
        'rimCyanPosX', 'rimCyanPosY', 'rimCyanPosZ', 'rimCyanIntensity',
        'ambientIntensity'
      ];
      keysToRemove.forEach(k => delete (cleanedPose as any)[k]);
      const newKf = [...state.keyframes];
      if (newKf[state.selectedKeyframeIndex]) {
        newKf[state.selectedKeyframeIndex] = cleanedPose;
        updates.keyframes = newKf;
      }
    }
    
    return updates;
  }),
  
  history: [defaultDevSettings],
  historyIndex: 0,
  pushHistory: (newSettings: DevSettings) => set((state: AppState) => {
    // Remove redo stack
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push({ ...newSettings });
    // Keep last 30 items max
    if (newHistory.length > 30) newHistory.shift();
    return { history: newHistory, historyIndex: newHistory.length - 1 };
  }),
  undoHistory: () => set((state: AppState) => {
    if (state.historyIndex > 0) {
      const newIdx = state.historyIndex - 1;
      const newSettings = { ...state.history[newIdx] };
      const updates: any = { historyIndex: newIdx, devSettings: newSettings };
      
      if (state.selectedKeyframeIndex !== null && !state.isPlayingAnimation) {
        const cleanedPose = { ...newSettings };
        const keysToRemove = [
          'cameraDistance', 'cameraHeight', 'cameraPitch', 'worldCameraDistance', 'worldCameraHeight', 'worldCameraPitch',
          'spotLightPosX', 'spotLightPosY', 'spotLightPosZ', 'spotLightAngle', 'spotLightPenumbra', 'spotLightIntensity',
          'rimPinkPosX', 'rimPinkPosY', 'rimPinkPosZ', 'rimPinkIntensity',
          'rimCyanPosX', 'rimCyanPosY', 'rimCyanPosZ', 'rimCyanIntensity',
          'ambientIntensity'
        ];
        keysToRemove.forEach(k => delete (cleanedPose as any)[k]);
        const newKf = [...state.keyframes];
        if (newKf[state.selectedKeyframeIndex]) {
          newKf[state.selectedKeyframeIndex] = cleanedPose;
          updates.keyframes = newKf;
        }
      }
      return updates;
    }
    return state;
  }),
  redoHistory: () => set((state: AppState) => {
    if (state.historyIndex < state.history.length - 1) {
      const newIdx = state.historyIndex + 1;
      const newSettings = { ...state.history[newIdx] };
      const updates: any = { historyIndex: newIdx, devSettings: newSettings };
      
      if (state.selectedKeyframeIndex !== null && !state.isPlayingAnimation) {
        const cleanedPose = { ...newSettings };
        const keysToRemove = [
          'cameraDistance', 'cameraHeight', 'cameraPitch', 'worldCameraDistance', 'worldCameraHeight', 'worldCameraPitch',
          'spotLightPosX', 'spotLightPosY', 'spotLightPosZ', 'spotLightAngle', 'spotLightPenumbra', 'spotLightIntensity',
          'rimPinkPosX', 'rimPinkPosY', 'rimPinkPosZ', 'rimPinkIntensity',
          'rimCyanPosX', 'rimCyanPosY', 'rimCyanPosZ', 'rimCyanIntensity',
          'ambientIntensity'
        ];
        keysToRemove.forEach(k => delete (cleanedPose as any)[k]);
        const newKf = [...state.keyframes];
        if (newKf[state.selectedKeyframeIndex]) {
          newKf[state.selectedKeyframeIndex] = cleanedPose;
          updates.keyframes = newKf;
        }
      }
      return updates;
    }
    return state;
  }),

  keyframes: [] as DevSettings[],
  selectedKeyframeIndex: null as number | null,
  setSelectedKeyframeIndex: (val: number | null) => set({ selectedKeyframeIndex: val }),
  addKeyframe: (pose: DevSettings) => set((state: AppState) => {
    if (state.keyframes.length >= 4) return state;
    const cleanedPose = { ...pose };
    const keysToRemove = [
      'cameraDistance', 'cameraHeight', 'cameraPitch', 'worldCameraDistance', 'worldCameraHeight', 'worldCameraPitch',
      'spotLightPosX', 'spotLightPosY', 'spotLightPosZ', 'spotLightAngle', 'spotLightPenumbra', 'spotLightIntensity',
      'rimPinkPosX', 'rimPinkPosY', 'rimPinkPosZ', 'rimPinkIntensity',
      'rimCyanPosX', 'rimCyanPosY', 'rimCyanPosZ', 'rimCyanIntensity',
      'ambientIntensity'
    ];
    keysToRemove.forEach(k => delete (cleanedPose as any)[k]);
    return { 
      keyframes: [...state.keyframes, cleanedPose],
      selectedKeyframeIndex: state.keyframes.length
    };
  }),
  updateKeyframe: (index: number, updates: Partial<DevSettings>) => set((state: AppState) => {
    const newKf = [...state.keyframes];
    if (newKf[index]) {
      const cleanedUpdates = { ...updates };
      const keysToRemove = [
        'cameraDistance', 'cameraHeight', 'cameraPitch', 'worldCameraDistance', 'worldCameraHeight', 'worldCameraPitch',
        'spotLightPosX', 'spotLightPosY', 'spotLightPosZ', 'spotLightAngle', 'spotLightPenumbra', 'spotLightIntensity',
        'rimPinkPosX', 'rimPinkPosY', 'rimPinkPosZ', 'rimPinkIntensity',
        'rimCyanPosX', 'rimCyanPosY', 'rimCyanPosZ', 'rimCyanIntensity',
        'ambientIntensity'
      ];
      keysToRemove.forEach(k => delete (cleanedUpdates as any)[k]);
      newKf[index] = { ...newKf[index], ...cleanedUpdates };
    }
    return { keyframes: newKf };
  }),
  removeKeyframe: (index: number) => set((state: AppState) => {
    let newSelectedIndex = state.selectedKeyframeIndex;
    if (newSelectedIndex === index) {
      newSelectedIndex = null;
    } else if (newSelectedIndex !== null && newSelectedIndex > index) {
      newSelectedIndex -= 1;
    }
    return { 
      keyframes: state.keyframes.filter((_, i) => i !== index),
      selectedKeyframeIndex: newSelectedIndex
    };
  }),
  clearKeyframes: (initialPose?: Partial<DevSettings>) => set((state: AppState) => {
    const resetPose = { ...defaultDevSettings, ...(initialPose || {}) };
    const keysToPreserve = [
      'cameraDistance', 'cameraHeight', 'cameraPitch', 'worldCameraDistance', 'worldCameraHeight', 'worldCameraPitch',
      'spotLightPosX', 'spotLightPosY', 'spotLightPosZ', 'spotLightAngle', 'spotLightPenumbra', 'spotLightIntensity',
      'rimPinkPosX', 'rimPinkPosY', 'rimPinkPosZ', 'rimPinkIntensity',
      'rimCyanPosX', 'rimCyanPosY', 'rimCyanPosZ', 'rimCyanIntensity',
      'backFillPosX', 'backFillPosY', 'backFillPosZ', 'backFillIntensity',
      'ambientIntensity'
    ];
    keysToPreserve.forEach(k => {
      (resetPose as any)[k] = (state.devSettings as any)[k];
    });

    return { 
      keyframes: [], 
      isPlayingAnimation: false,
      devSettings: resetPose,
      selectedKeyframeIndex: null
    };
  }),
  isPlayingAnimation: false,
  setIsPlayingAnimation: (val: boolean) => set((state: AppState) => {
    if (!val && state.selectedKeyframeIndex !== null && state.keyframes[state.selectedKeyframeIndex]) {
      return {
        isPlayingAnimation: false,
        devSettings: { ...state.devSettings, ...state.keyframes[state.selectedKeyframeIndex] }
      };
    }
    return { isPlayingAnimation: val };
  }),
  animationSpeed: 500,
  setAnimationSpeed: (val: number) => set({ animationSpeed: val }),
});
