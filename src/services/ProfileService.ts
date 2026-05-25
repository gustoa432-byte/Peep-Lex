import { useStore } from '../store/useStore';
import { ApiService } from './ApiService';

class CoreProfileService {
  claimAFKPonts() {
    const store = useStore.getState();
    if (!store.profile) return 0;
    
    const now = Date.now();
    const maxTimeMs = 3 * 60 * 60 * 1000; // 3 hours
    const diffMs = Math.min(now - store.profile.last_claim_time, maxTimeMs);
    if (diffMs < 0) return 0;
    
    // 100 ponts per hour
    const pontsToClaim = Math.floor(diffMs * (100 / (60 * 60 * 1000)));
    if (pontsToClaim > 0) {
      const newPonts = store.profile.ponts + pontsToClaim;
      store.setProfile({ 
        ...store.profile, 
        ponts: newPonts, 
        last_claim_time: now 
      });
      
      ApiService.updateProfile(store.profile.id, {
        ponts: newPonts,
        last_claim_time: now
      });
    }
    
    return pontsToClaim;
  }

  purchaseGradient(id: string, cost: number) {
    const store = useStore.getState();
    if (!store.profile || store.profile.ponts < cost) return false;
    
    const unlocked = store.profile.unlockedGradients || [];
    if (unlocked.includes(id)) return false;

    const newPonts = store.profile.ponts - cost;
    const newUnlocked = [...unlocked, id];
    
    store.setProfile({
      ...store.profile,
      ponts: newPonts,
      unlockedGradients: newUnlocked
    });

    ApiService.updateProfile(store.profile.id, {
      ponts: newPonts,
      unlockedGradients: newUnlocked
    });

    return true;
  }

  purchasePrint(id: string, cost: number) {
    const store = useStore.getState();
    if (!store.profile || store.profile.prs < cost) return false;
    
    const unlocked = store.profile.unlockedPrints || [];
    if (unlocked.includes(id)) return false;

    const newPrs = store.profile.prs - cost;
    const newUnlocked = [...unlocked, id];

    store.setProfile({
      ...store.profile,
      prs: newPrs,
      unlockedPrints: newUnlocked
    });

    ApiService.updateProfile(store.profile.id, {
      prs: newPrs,
      unlockedPrints: newUnlocked
    });

    return true;
  }

  purchaseAccessory(id: string, cost: number, currency: 'ponts' | 'prs') {
    const store = useStore.getState();
    if (!store.profile) return false;
    
    if (currency === 'ponts' && store.profile.ponts < cost) return false;
    if (currency === 'prs' && store.profile.prs < cost) return false;

    const unlocked = store.profile.unlockedPrints || [];
    if (unlocked.includes(id)) return false;

    const newPonts = currency === 'ponts' ? store.profile.ponts - cost : store.profile.ponts;
    const newPrs = currency === 'prs' ? store.profile.prs - cost : store.profile.prs;
    const newUnlocked = [...unlocked, id];

    store.setProfile({
      ...store.profile,
      ponts: newPonts,
      prs: newPrs,
      unlockedPrints: newUnlocked
    });

    ApiService.updateProfile(store.profile.id, {
      ponts: newPonts,
      prs: newPrs,
      unlockedPrints: newUnlocked
    });

    return true;
  }

  changeNickname(newName: string) {
    const store = useStore.getState();
    if (!store.profile) return false;
    
    let used = store.profile.free_name_changes_used || 0;
    let prsCost = 0;
    if (used > 0) {
      prsCost = 100;
      if (store.profile.prs < prsCost) return false;
    }
    
    const newPrs = store.profile.prs - prsCost;
    const newUsed = used + 1;

    store.setProfile({
      ...store.profile,
      nickname: newName,
      free_name_changes_used: newUsed,
      prs: newPrs
    });

    ApiService.updateProfile(store.profile.id, {
      nickname: newName,
      free_name_changes_used: newUsed,
      prs: newPrs
    });

    return true;
  }
}

export const ProfileService = new CoreProfileService();
