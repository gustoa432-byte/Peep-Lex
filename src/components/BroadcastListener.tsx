import React, { useEffect, useState } from 'react';
import { subscribeToFlexBroadcasts } from '../lib/multiplayer';
import { useStore } from '../store/useStore';
import { FlexPack } from '../store/types';
import { getMediaDB, saveMediaDB } from '../lib/db';
import { ApiService } from '../services/ApiService';
import { vibrate } from '../lib/haptics';

export const BroadcastListener: React.FC = () => {
  const [incomingFlex, setIncomingFlex] = useState<{ pack: FlexPack, sender: any } | null>(null);
  const profile = useStore(state => state.profile);

  useEffect(() => {
    const unsub = subscribeToFlexBroadcasts(async (flex_json, sender) => {
      // Ignore if it's our own flex
      if (profile && sender.id === profile.id) return;
      
      try {
         const parsedPack = JSON.parse(flex_json);
         setIncomingFlex({ pack: parsedPack, sender });
         vibrate([50, 100, 50]);
      } catch (e) {
         console.error("Failed to parse incoming flex", e);
      }
    });

    return () => unsub();
  }, [profile]);

  const acceptFlex = async () => {
    if (!incomingFlex) return;
    const { pack } = incomingFlex;
    
    // Close prompt immediately
    setIncomingFlex(null);

    // Load pack temporarily. We don't save to our library, just play it.
    // Let's implement dynamic media download
    const fetchMediaOrUseLocal = async (mediaId: string) => {
        const localBlob = await getMediaDB(mediaId);
        if (localBlob) return localBlob;
        
        // Fetch from Supabase Storage
        const data = await ApiService.downloadMedia(mediaId);
        if (!data) {
           console.error("Failed to download media");
           return null;
        }
        await saveMediaDB(mediaId, data as any);
        return data; // blob
    };

    if (pack.globalTrackUrl && pack.globalTrackUrl.startsWith('local_')) {
        // Technically it might be a supabase storage ID now, but keeping naming simple
        const fileBlob = await fetchMediaOrUseLocal(pack.globalTrackUrl);
        if (fileBlob) {
            useStore.getState().setGlobalTrackFile(fileBlob as File);
        }
    }

    if (pack.backgroundVideoUrl && pack.backgroundVideoUrl.startsWith('local_')) {
        const fileBlob = await fetchMediaOrUseLocal(pack.backgroundVideoUrl);
        if (fileBlob) {
            useStore.getState().setBackgroundVideoFile(fileBlob as File);
        }
    }

    // Set playing state
    useStore.getState().setAppMode('editor');
    
    // Check if it's a short pack
    const isShortPack = pack.loops.length === 1 && pack.loops[0].frames?.length === 4 && !pack.backgroundVideoUrl && !pack.globalTrackUrl;

    // We hack the state to inject the flex loops temporarily representing the "stage"
    useStore.setState({
       loops: pack.loops,
       globalTrackUrl: pack.globalTrackUrl,
       backgroundVideoUrl: pack.backgroundVideoUrl,
       isPlayingLoops: true,
       isPlayingLoopsOnce: isShortPack,
       isAnimationMenuOpen: false
    });
  };

  const tipPonts = async (amount: number) => {
     if (!incomingFlex || !profile) return;
     if (profile.ponts < amount) {
         window.alert("Недостаточно Понтов!");
         return;
     }

     const targetId = incomingFlex.sender.id;
     
     // Deduct locally immediately
     useStore.getState().updateLocalPonts(-amount);

     try {
       // Ideally this is a secure Postgres RPC to transfer. We're doing client-side for MVP
       // 1. Deduct from us
       await ApiService.transferPonts(profile.id, targetId, amount, profile.ponts);
       // 2. Add to them (In MVP, we just let them have it, ignoring race conditions if they are offline)
       window.alert(`Вы закинули ${amount} Понтов ${incomingFlex.sender.username}!`);
     } catch (e) {
       console.error(e);
     }
  };

  if (!incomingFlex) return null;

    // Check if it's a short pack
    const isShortPack = incomingFlex.pack.loops.length === 1 && incomingFlex.pack.loops[0].frames?.length === 4 && !incomingFlex.pack.backgroundVideoUrl && !incomingFlex.pack.globalTrackUrl;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] max-w-sm w-full p-4 pointer-events-auto">
      <div className={`bg-black/90 border-2 rounded-2xl p-4 flex flex-col gap-3 ${isShortPack ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]'}`}>
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className={`font-bold text-lg ${isShortPack ? 'text-orange-400' : 'text-purple-400'}`}>
              {isShortPack ? 'SHORTS TIME!' : 'STAGE TIME!'}
            </span>
            <span className="text-white">Пип <strong className="text-orange-400">{incomingFlex.sender.username}</strong> {isShortPack ? 'показывает шортс!' : 'хочет зафлексить!'}</span>
          </div>
        </div>
        
        <div className="flex gap-2 w-full mt-2">
          <button 
             onClick={acceptFlex}
             className={`flex-1 text-white font-bold py-2 rounded-xl ${isShortPack ? 'bg-orange-500 hover:bg-orange-400' : 'bg-purple-500 hover:bg-purple-400'}`}
          >
             Смотреть
          </button>

          <button 
             onClick={() => setIncomingFlex(null)}
             className="flex-1 bg-black/80 text-white/70 font-bold py-2 rounded-xl hover:bg-black/80 hover:text-white"
          >
             Скип
          </button>
        </div>

        <div className="border-t border-white/10 mt-2 pt-3">
          <span className="text-white/50 text-xs text-center block mb-2">Кинуть Понтов за смелость:</span>
          <div className="flex justify-center gap-3">
            {[1, 5, 10].map(amt => (
              <button 
                key={amt}
                onClick={() => tipPonts(amt)}
                className="w-12 h-10 rounded-full bg-orange-500/20 border border-orange-500/50 text-orange-400 font-bold hover:bg-orange-500 hover:text-white transition-all shadow-[0_0_10px_rgba(249,115,22,0.2)]"
              >
                +{amt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
