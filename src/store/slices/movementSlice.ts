import { AppState } from '../types';

export const createMovementSlice = (set: any, get: any) => ({
  cameraSpeed: 1.0,
  setCameraSpeed: (speed: number) => set({ cameraSpeed: speed }),

  isCrouching: false,
  toggleCrouch: () => set((state: AppState) => ({ isCrouching: !state.isCrouching })),

  jumpTrigger: 0,
  triggerJump: () => set((state: AppState) => ({ jumpTrigger: state.jumpTrigger + 1 })),

  isFirstPerson: false,
  setIsFirstPerson: (val: boolean) => set({ isFirstPerson: val }),

  hasSlingshot: false,
  setHasSlingshot: (val: boolean) => set({ hasSlingshot: val }),

  isNearSlingshot: false,
  setIsNearSlingshot: (val: boolean) => set({ isNearSlingshot: val }),

  hasInteractedJoystick: false,
  setHasInteractedJoystick: (val: boolean) => set({ hasInteractedJoystick: val }),
});
