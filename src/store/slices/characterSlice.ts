import { AppState, CharacterConfig, TabType, BodyPartType } from '../types';
import { defaultCharacterConfig } from '../defaults';

export const createCharacterSlice = (set: any, get: any) => ({
  isBodyEditorOpen: false,
  setIsBodyEditorOpen: (val: boolean) => set({ isBodyEditorOpen: val, activeBodyPart: null }),
  
  activeTab: 'body' as TabType,
  setActiveTab: (tab: TabType) => set({ activeTab: tab, activeBodyPart: null }),
  
  selectedColorPart: 'headColor',
  setSelectedColorPart: (part: string) => set({ selectedColorPart: part }),
  
  activeBodyPart: null as BodyPartType,
  setActiveBodyPart: (part: BodyPartType) => set({ activeBodyPart: part }),

  characterConfig: defaultCharacterConfig,
  updateCharacterConfig: (config: Partial<CharacterConfig>) => set((state: AppState) => ({
    characterConfig: { ...state.characterConfig, ...config }
  })),

  activeBoneName: 'neck',
  setActiveBoneName: (val: string | null) => set({ activeBoneName: val }),
  
  activePoseSection: null as any,
  setActivePoseSection: (val: any) => set({ activePoseSection: val }),
  
  isTwistMode: false,
  setIsTwistMode: (val: boolean) => set({ isTwistMode: val }),

  isProfileMenuOpen: false,
  setIsProfileMenuOpen: (val: boolean) => set({ isProfileMenuOpen: val }),
  
  isAnimationMenuOpen: false,
  setIsAnimationMenuOpen: (val: boolean) => set({ isAnimationMenuOpen: val }),
});
