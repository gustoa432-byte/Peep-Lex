import { AppState, UserProfile } from '../types';

export const createProfileSlice = (set: any, get: any) => ({
  profile: null as UserProfile | null,
  setProfile: (profile: UserProfile | null) => set({ profile }),
  updateLocalPonts: (amount: number) => set((state: AppState) => {
    if (!state.profile) return state;
    return { profile: { ...state.profile, ponts: state.profile.ponts + amount } };
  }),
  updateLocalPrs: (amount: number) => set((state: AppState) => {
    if (!state.profile) return state;
    return { profile: { ...state.profile, prs: state.profile.prs + amount } };
  }),
});

