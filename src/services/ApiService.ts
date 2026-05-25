import { UserProfile } from '../store/types';

/**
 * ApiService
 * Abstracts backend HTTP requests.
 * In the future, this will connect to the real backend.
 */
class CoreApiService {
  // Mock implementations for now
  async updateProfile(id: string, data: Partial<UserProfile>): Promise<void> {
    try {
      const { supabase } = await import('../lib/supabase').catch(() => ({ supabase: null }));
      if (supabase) {
        let mappedData: any = { ...data };
        if (data.unlockedGradients) mappedData.unlocked_gradients = data.unlockedGradients;
        if (data.unlockedPrints) mappedData.unlocked_prints = data.unlockedPrints;
        
        delete mappedData.unlockedGradients;
        delete mappedData.unlockedPrints;

        await supabase.from('profiles').update(mappedData).eq('id', id);
      } else {
         console.log('[API Mock] Updated profile:', id, data);
      }
    } catch (e) {
      console.warn('API updateProfile failed:', e);
    }
  }

  async authOrCreateProfile(deviceId: string, fallbackProfile: any): Promise<any> {
    try {
      const { supabase } = await import('../lib/supabase').catch(() => ({ supabase: null }));
      if (supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', deviceId)
          .single();

        if (error && error.code === 'PGRST116') {
          await supabase
            .from('profiles')
            .insert({
              id: fallbackProfile.id,
              username: fallbackProfile.username,
              ponts: fallbackProfile.ponts,
              prs: fallbackProfile.prs,
              last_claim_time: fallbackProfile.last_claim_time,
            });
          return fallbackProfile;
        } else if (data) {
          return {
            id: data.id,
            username: data.username,
            ponts: data.ponts,
            prs: data.prs,
            last_claim_time: data.last_claim_time,
            unlockedGradients: data.unlocked_gradients || [],
            unlockedPrints: data.unlocked_prints || [],
            free_name_changes_used: data.free_name_changes_used || 0,
            nickname: data.nickname || '',
          };
        }
      }
    } catch (e) {
      console.warn('API authOrCreateProfile failed:', e);
    }
    return fallbackProfile;
  }

  async transferPonts(senderId: string, receiverId: string, amount: number, senderCurrentPonts: number): Promise<boolean> {
    try {
      const { supabase } = await import('../lib/supabase').catch(() => ({ supabase: null }));
      if (supabase) {
        // In a real backend, we'd use an RPC approach. For now we just deduct from sender locally.
        await supabase.from('profiles').update({ ponts: senderCurrentPonts - amount }).eq('id', senderId);
        return true;
      }
      console.log('[API Mock] Transferred ponts', { senderId, receiverId, amount });
      return true;
    } catch (e) {
      console.error('API transferPonts failed:', e);
      return false;
    }
  }

  async downloadMedia(path: string): Promise<Blob | null> {
    try {
      const { supabase } = await import('../lib/supabase').catch(() => ({ supabase: null }));
      if (supabase) {
        const { data, error } = await supabase.storage.from('peep_media').download(path);
        if (!error && data) {
          return data;
        }
      }
    } catch (e) {
      console.error('API downloadMedia failed:', e);
    }
    return null;
  }

  async getMediaPublicUrl(bucket: string, path: string): Promise<string | null> {
    try {
      const { supabase } = await import('../lib/supabase').catch(() => ({ supabase: null }));
      if (supabase) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        if (data && data.publicUrl) {
          return data.publicUrl;
        }
      }
    } catch (e) {
      console.error('API getMediaPublicUrl failed:', e);
    }
    return null;
  }

  async listMedia(type: 'audio' | 'video'): Promise<any[]> {
    try {
      const { supabase } = await import('../lib/supabase').catch(() => ({ supabase: null }));
      if (supabase) {
        const { data, error } = await supabase.storage.from('peep_media').list(type);
        if (!error && data) {
           return data.filter((f: any) => f.name && f.name !== '.emptyFolderPlaceholder');
        }
      }
    } catch (e) {
      console.error('API listMedia failed:', e);
    }
    return [];
  }
  async uploadMedia(bucket: string, path: string, file: Blob, options?: any): Promise<boolean> {
    try {
      const { supabase } = await import('../lib/supabase').catch(() => ({ supabase: null }));
      if (supabase) {
        const { error } = await supabase.storage.from(bucket).upload(path, file, options);
        if (!error) return true;
        console.error('API uploadMedia storage error:', error);
      }
    } catch (e) {
      console.error('API uploadMedia failed:', e);
    }
    return false;
  }
}

export const ApiService = new CoreApiService();
