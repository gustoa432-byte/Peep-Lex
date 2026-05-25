import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { ApiService } from '../services/ApiService';
import { UserProfile } from '../store/types';

export const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setProfile = useStore(state => state.setProfile);

  useEffect(() => {
    const initProfile = async () => {
      try {
        let deviceId = localStorage.getItem('peep_device_id');
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!deviceId || !uuidRegex.test(deviceId)) {
          deviceId = crypto.randomUUID();
          localStorage.setItem('peep_device_id', deviceId);
        }

        const localProfile = useStore.getState().profile;

        // Set a default profile immediately so the app isn't waiting indefinitely
        const newProfile = {
          id: deviceId,
          username: localProfile?.username || `Guest_${Math.floor(Math.random() * 10000)}`,
          ponts: localProfile?.ponts ?? 500,
          prs: localProfile?.prs ?? 500,
          last_claim_time: localProfile?.last_claim_time || Date.now(),
          unlockedGradients: localProfile?.unlockedGradients || [],
          unlockedPrints: localProfile?.unlockedPrints || [],
        };
        
        // We set the fallback first so the user can use the app without delay
        setProfile(newProfile as UserProfile);

        // Then we attempt to sync with Supabase via ApiService
        const finalProfile = await ApiService.authOrCreateProfile(deviceId, newProfile);
        
        // Merge with local profile if needed, like the old logic
        let ProfileMapped = {
          ...finalProfile,
          unlockedGradients: Array.from(new Set([...(finalProfile.unlockedGradients || []), ...(localProfile?.unlockedGradients || [])])),
          unlockedPrints: Array.from(new Set([...(finalProfile.unlockedPrints || []), ...(localProfile?.unlockedPrints || [])])),
        };
        setProfile(ProfileMapped as UserProfile);
      } catch (err) {
        console.error("Failed to init profile", err);
      }
    };

    initProfile();
  }, [setProfile]);

  return <>{children}</>;
};
