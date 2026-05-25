import { AppState, AnimationLoop, FlexPack } from '../types';
import { defaultDevSettings } from '../defaults';

export const createMediaLoopsSlice = (set: any) => ({
  backgroundVideoUrl: null as string | null,
  setBackgroundVideoUrl: (val: string | null) => set({ backgroundVideoUrl: val }),

  globalTrackStartTime: 0,
  setGlobalTrackStartTime: (val: number) => set({ globalTrackStartTime: val }),
  trackDuration: 0,
  setTrackDuration: (val: number) => set({ trackDuration: val }),
  currentLoopStartTime: 0,
  setCurrentLoopStartTime: (val: number) => set({ currentLoopStartTime: val }),
  updateLoopStartTime: (id: string, startTime: number) => set((state: AppState) => ({
    loops: state.loops.map(loop => loop.id === id ? { ...loop, trackStartTime: startTime } : loop)
  })),

  trackBPM: 120,
  setTrackBPM: (val: number) => set({ trackBPM: val }),

  loops: [] as AnimationLoop[],
  flexPacks: [] as FlexPack[],
  editingLoopId: null as string | null,
  setEditingLoopId: (id: string | null) => set({ editingLoopId: id }),
  
  loadLoopForEditing: (id: string) => set((state: AppState) => {
    const target = state.loops.find(l => l.id === id);
    if (!target) return state;
    
    const firstFrame = target.frames.length > 0 ? target.frames[0] : {};

    return {
      keyframes: [...target.frames],
      animationSpeed: target.speed,
      editingLoopId: id,
      devSettings: { ...state.devSettings, ...firstFrame },
      selectedKeyframeIndex: target.frames.length > 0 ? 0 : null
    };
  }),

  saveLoop: (name: string, delayAfter: number, replaceId?: string) => set((state: AppState) => {
    if (state.keyframes.length === 0) return state;
    
    let newLoops = [...state.loops];
    if (replaceId) {
      const index = newLoops.findIndex(l => l.id === replaceId);
      if (index !== -1) {
        newLoops[index] = { ...newLoops[index], name, frames: [...state.keyframes], speed: state.animationSpeed, delayAfter };
      }
    } else {
       newLoops.push({
         id: Date.now().toString(),
         name,
         frames: [...state.keyframes],
         speed: state.animationSpeed,
         delayAfter,
         trackStartTime: 0
       });
    }
    
    let currentTime = 0;
    for (let i = 0; i < newLoops.length; i++) {
       newLoops[i].trackStartTime = currentTime / 1000;
       currentTime += (newLoops[i].frames.length * newLoops[i].speed) + newLoops[i].delayAfter;
    }
    
    return {
       loops: newLoops,
       editingLoopId: null
    };
  }),

  removeLoop: (id: string) => set((state: AppState) => {
    let nextLoops = state.loops.filter(loop => loop.id !== id);
    
    let currentTime = 0;
    for (let i = 0; i < nextLoops.length; i++) {
       nextLoops[i] = { ...nextLoops[i] };
       nextLoops[i].trackStartTime = currentTime / 1000;
       currentTime += (nextLoops[i].frames.length * nextLoops[i].speed) + nextLoops[i].delayAfter;
    }
    
    let extraState: any = { loops: nextLoops };
    
    if (state.editingLoopId === id || nextLoops.length === 0) {
       extraState.editingLoopId = null;
       
       const resetPose = { ...defaultDevSettings };
       const keysToPreserve = [
         'cameraDistance', 'cameraHeight', 'cameraPitch',
         'worldCameraDistance', 'worldCameraHeight', 'worldCameraPitch',
         'spotLightPosX', 'spotLightPosY', 'spotLightPosZ', 'spotLightAngle',
         'spotLightPenumbra', 'spotLightIntensity',
         'rimPinkPosX', 'rimPinkPosY', 'rimPinkPosZ', 'rimPinkIntensity',
         'rimCyanPosX', 'rimCyanPosY', 'rimCyanPosZ', 'rimCyanIntensity',
         'backFillPosX', 'backFillPosY', 'backFillPosZ', 'backFillIntensity',
         'ambientIntensity'
       ];
       keysToPreserve.forEach(k => {
         (resetPose as any)[k] = (state.devSettings as any)[k];
       });

       extraState.keyframes = [];
       extraState.isPlayingAnimation = false;
       extraState.devSettings = resetPose;
       extraState.selectedKeyframeIndex = null;
    }

    return extraState;
  }),

  duplicateLoop: (id: string) => set((state: AppState) => {
    const target = state.loops.find(l => l.id === id);
    if (!target) return state;

    const duplicatedLoop = {
      ...target,
      id: `loop_${Date.now()}`,
      name: `${target.name} (Копия)`,
    };

    let newLoops = [...state.loops, duplicatedLoop];
    
    let currentTime = 0;
    for (let i = 0; i < newLoops.length; i++) {
       newLoops[i] = { ...newLoops[i] };
       newLoops[i].trackStartTime = currentTime / 1000;
       currentTime += (newLoops[i].frames.length * newLoops[i].speed) + newLoops[i].delayAfter;
    }
    
    return {
       loops: newLoops
    };
  }),

  saveFlexPack: (name: string, forcedId?: string) => set((state: AppState) => {
    if (state.loops.length === 0) return state;
    const newPack = {
      id: forcedId || `flex_${Date.now()}`,
      name,
      loops: [...state.loops],
      globalTrackUrl: state.globalTrackUrl,
      backgroundVideoUrl: state.backgroundVideoUrl,
      createdAt: Date.now()
    };
    return { flexPacks: [...(state.flexPacks || []), newPack] }; 
  }),

  loadFlexPack: (id: string) => set((state: AppState) => {
    const pack = (state.flexPacks || []).find(p => p.id === id);
    if (!pack) return state;
    
    let loadedLoops = JSON.parse(JSON.stringify(pack.loops || []));
    let currentTime = 0;
    for (let i = 0; i < loadedLoops.length; i++) {
       loadedLoops[i].trackStartTime = currentTime / 1000;
       
       const framesCount = loadedLoops[i].frames?.length || 1;
       const speedRaw = Number(loadedLoops[i].speed);
       const speed = isNaN(speedRaw) || speedRaw <= 0 ? 500 : speedRaw;
       const delayAfter = Number(loadedLoops[i].delayAfter) || 0;
       
       loadedLoops[i].speed = speed;
       loadedLoops[i].delayAfter = delayAfter;
       
       currentTime += (framesCount * speed) + delayAfter;
    }
    
    const newState: any = { loops: loadedLoops };
    newState.globalTrackUrl = pack.globalTrackUrl || null;
    newState.backgroundVideoUrl = pack.backgroundVideoUrl || null;
    return newState;
  }),

  removeFlexPack: (id: string) => set((state: AppState) => ({
    flexPacks: (state.flexPacks || []).filter(p => p.id !== id)
  })),

  isPlayingLoops: false,
  setIsPlayingLoops: (val: boolean) => set({ isPlayingLoops: val, isPaused: false }),
  isPlayingLoopsOnce: false,
  setIsPlayingLoopsOnce: (val: boolean) => set({ isPlayingLoopsOnce: val }),
  
  isPaused: false,
  setIsPaused: (val: boolean) => set({ isPaused: val }),
  
  audioScrubTrigger: 0,
  triggerAudioScrub: () => set((state: AppState) => ({ audioScrubTrigger: state.audioScrubTrigger + 1 })),
  
  updateLoopDelay: (id: string, delay: number) => set((state: AppState) => {
    let newLoops = state.loops.map(loop => loop.id === id ? { ...loop, delayAfter: delay } : { ...loop });
    let currentTime = 0;
    for (let i = 0; i < newLoops.length; i++) {
       newLoops[i].trackStartTime = currentTime / 1000;
       currentTime += (newLoops[i].frames.length * newLoops[i].speed) + (newLoops[i].delayAfter || 0);
    }
    return { loops: newLoops };
  }),

  globalTrackUrl: null as string | null,
  setGlobalTrackUrl: (url: string | null) => set({ globalTrackUrl: url }),
  
  globalTrackFile: null as File | null,
  setGlobalTrackFile: (file: File | null) => set({ globalTrackFile: file }),
  
  backgroundVideoFile: null as File | null,
  setBackgroundVideoFile: (file: File | null) => set({ backgroundVideoFile: file }),
});
