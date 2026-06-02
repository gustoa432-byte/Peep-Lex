import { AppState, RoomEditorMode, RoomEditorTool, RoomObject } from '../types';

export const createRoomEditorSlice = (set: any) => ({
  roomEditorMode: 'build' as RoomEditorMode,
  setRoomEditorMode: (mode: RoomEditorMode) => set({ roomEditorMode: mode }),

  isErasing: false,
  setIsErasing: (val: boolean) => set({ isErasing: val }),
  isBuildingActive: false,
  setIsBuildingActive: (val: boolean) => set({ isBuildingActive: val }),
  isVoxelMenuOpen: false,
  setIsVoxelMenuOpen: (val: boolean) => set({ isVoxelMenuOpen: val }),

  roomObjects: [] as RoomObject[],
  setRoomObjects: (objects: RoomObject[]) => set({ roomObjects: objects }),

  roomChunks: {},
  setRoomChunks: (chunks: Record<string, RoomObject[]>) => set({ roomChunks: chunks }),

  roomEditorHistory: [[]] as RoomObject[][],
  roomEditorHistoryIndex: 0,
  
  roomCameraResetTrigger: 0,
  triggerRoomCameraReset: () => set((state: AppState) => ({ roomCameraResetTrigger: state.roomCameraResetTrigger + 1 })),

  macroCameraState: null as { position: [number, number, number], target: [number, number, number] } | null,
  setMacroCameraState: (val: { position: [number, number, number], target: [number, number, number] } | null) => set({ macroCameraState: val }),

  commitRoomEditorHistory: () => set((state: AppState) => {
    const lastHistory = state.roomEditorHistory[state.roomEditorHistoryIndex] || [];
    // Only push if there's a difference in length OR the objects are different (checking IDs for speed)
    const hasChanged = state.roomObjects.length !== lastHistory.length || !state.roomObjects.every((o, i) => o.id === lastHistory[i]?.id && o.position.join(',') === lastHistory[i]?.position.join(','));
    
    if (hasChanged) {
       const newHistory = state.roomEditorHistory.slice(0, state.roomEditorHistoryIndex + 1);
       newHistory.push([...state.roomObjects]);
       if (newHistory.length > 50) newHistory.shift();
       return {
         roomEditorHistory: newHistory,
         roomEditorHistoryIndex: newHistory.length - 1
       };
    }
    return state;
  }),
  
  pushRoomEditorHistory: (objects: RoomObject[]) => set((state: AppState) => {
    const newHistory = state.roomEditorHistory.slice(0, state.roomEditorHistoryIndex + 1);
    newHistory.push([...objects]);
    if (newHistory.length > 50) newHistory.shift();
    return { 
      roomEditorHistory: newHistory, 
      roomEditorHistoryIndex: newHistory.length - 1,
      roomObjects: objects
    };
  }),
  
  undoRoomEditorHistory: () => set((state: AppState) => {
    if (state.roomEditorHistoryIndex > 0) {
      const newIdx = state.roomEditorHistoryIndex - 1;
      return {
        roomEditorHistoryIndex: newIdx,
        roomObjects: [...state.roomEditorHistory[newIdx]]
      };
    }
    return state;
  }),
  
  redoRoomEditorHistory: () => set((state: AppState) => {
    if (state.roomEditorHistoryIndex < state.roomEditorHistory.length - 1) {
      const newIdx = state.roomEditorHistoryIndex + 1;
      return {
        roomEditorHistoryIndex: newIdx,
        roomObjects: [...state.roomEditorHistory[newIdx]]
      };
    }
    return state;
  }),

  roomSelectedTool: 'stamp' as RoomEditorTool,
  setRoomSelectedTool: (tool: RoomEditorTool) => set({ roomSelectedTool: tool, grabbedBlock: null }),

  grabbedBlock: null as RoomObject | null,
  setGrabbedBlock: (block: RoomObject | null) => set({ grabbedBlock: block }),

  roomSelectedStamp: 'house',
  setRoomSelectedStamp: (stamp: string) => set({ roomSelectedStamp: stamp }),

  roomBlockSize: 2,
  setRoomBlockSize: (size: number) => set({ roomBlockSize: size }),

  buildLayer: 0,
  setBuildLayer: (layer: number) => set({ buildLayer: layer }),

  brushShape: 'rect' as 'rect' | 'line' | 'point' | 'stairs' | 'roof' | 'box',
  setBrushShape: (shape: 'rect' | 'line' | 'point' | 'stairs' | 'roof' | 'box') => set({ brushShape: shape }),

  brushHeight: 1,
  setBrushHeight: (height: number) => set({ brushHeight: height }),

  podiumPosition: [0, 0, 0] as [number, number, number],
  setPodiumPosition: (pos: [number, number, number]) => set({ podiumPosition: pos }),
});
