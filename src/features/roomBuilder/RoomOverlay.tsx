import React, { useState, useRef, useEffect, memo } from 'react';
import { inputState } from '../../store/inputState';
import { useStore } from '../../store/useStore';
import { ChevronLeft, Hammer, Eye, EyeOff, Flame, Mountain } from 'lucide-react';
import { RoomSettings } from './RoomSettings';
import { EnvironmentSettings } from './EnvironmentSettings';
import { vibrate } from '../../lib/haptics';
import * as THREE from 'three';
import { VoxelJoysticks } from './ui/VoxelJoysticks';
import { shootSlingshot } from '../../lib/multiplayer';

const FlexPickerOverlay = memo(({ 
  show, 
  onClose, 
  onPlay 
}: { 
  show: boolean; 
  onClose: () => void; 
  onPlay: (id: string) => void; 
}) => {
  if (!show) return null;
  const packs = useStore.getState().flexPacks || [];

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50 pointer-events-auto">
      <div className="bg-[#111] border-[3px] border-white/20 p-6 rounded-[24px] max-w-sm w-full flex flex-col items-center shadow-[0_10px_0_0_rgba(0,0,0,1)]">
        <h3 className="text-white font-black text-xl mb-4 tracking-wider uppercase">Выбрать Флекс</h3>
        <div className="flex flex-col gap-3 w-full max-h-[50vh] overflow-y-auto">
          {packs.map(pack => (
            <button
              key={pack.id}
              onClick={() => onPlay(pack.id)}
              className="bg-black/80 hover:bg-black/80 border-2 border-white/20 rounded-xl p-3 text-left transition-colors flex justify-between items-center"
            >
              <div>
                <div className="text-white font-black uppercase text-sm">{pack.name}</div>
                <div className="text-white/50 text-xs">{pack.loops?.length || 0} лупов</div>
              </div>
            </button>
          ))}
        </div>
        <button 
          onClick={onClose}
          className="mt-6 font-black uppercase tracking-wider text-white/50 hover:text-white"
        >
          Отмена
        </button>
      </div>
    </div>
  );
});

export const RoomOverlay = () => {
  const setAppMode = useStore(state => state.setAppMode);
  const triggerJump = useStore(state => state.triggerJump);
  const toggleCrouch = useStore(state => state.toggleCrouch);
  const showStats = useStore(state => state.showStats);
  const setShowStats = useStore(state => state.setShowStats);
  const isDevUiOpen = useStore(state => state.isDevUiOpen);
  const setIsDevUiOpen = useStore(state => state.setIsDevUiOpen);
  const isFirstPerson = useStore(state => state.isFirstPerson);
  const setIsFirstPerson = useStore(state => state.setIsFirstPerson);
  const hasSlingshot = useStore(state => state.hasSlingshot);
  const setHasSlingshot = useStore(state => state.setHasSlingshot);
  const isNearSlingshot = useStore(state => state.isNearSlingshot);
  const isOnPodium = useStore(state => state.isOnPodium);
  
  const [isBuildMenuOpen, setIsBuildMenuOpen] = useState(false);
  const [isEnvSettingsOpen, setIsEnvSettingsOpen] = useState(false);
  const isPlayingLoops = useStore(state => state.isPlayingLoops);
  const wasPlayingLoopsRef = useRef(isPlayingLoops);

  const flexStartTimeRef = useRef(0);

  useEffect(() => {
    if (!wasPlayingLoopsRef.current && isPlayingLoops) {
      flexStartTimeRef.current = Date.now();
    }
    if (wasPlayingLoopsRef.current && !isPlayingLoops) {
      // Flex finished! Set a 10 seconds cooldown
      const newCd = Date.now() + 10 * 1000;
      setFlexCooldown(newCd);
      localStorage.setItem('flexCooldown', newCd.toString());
    }
    wasPlayingLoopsRef.current = isPlayingLoops;
  }, [isPlayingLoops]);

  const [flexCooldown, setFlexCooldown] = useState(() => {
    return parseInt(localStorage.getItem('flexCooldown') || '0', 10);
  });
  const [flexTimeLeft, setFlexTimeLeft] = useState(0);

  useEffect(() => {
     let interval: NodeJS.Timeout;
     if (flexCooldown > Date.now()) {
        interval = setInterval(() => {
           const left = Math.max(0, flexCooldown - Date.now());
           setFlexTimeLeft(left);
           if (left === 0) clearInterval(interval);
        }, 1000);
        setFlexTimeLeft(Math.max(0, flexCooldown - Date.now()));
     } else {
        setFlexTimeLeft(0);
     }
     return () => clearInterval(interval);
  }, [flexCooldown]);

  const formatTime = (ms: number) => {
     const totalSec = Math.floor(ms / 1000);
     const m = Math.floor(totalSec / 60);
     const s = totalSec % 60;
     return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const [showFlexPicker, setShowFlexPicker] = useState(false);

  const handleFlexButton = () => {
    if (flexCooldown > Date.now()) return;
    const state = useStore.getState();
    const flexPacks = state.flexPacks || [];
    if (flexPacks.length > 0) {
        setShowFlexPicker(true);
    } else {
        alert('Сначала создайте пак с флексом в студии!');
    }
  };

  const playSelectedFlex = (packId: string) => {
    const state = useStore.getState();
    setShowFlexPicker(false);
    
    const pack = (state.flexPacks || []).find(p => p.id === packId);
    if (pack) {
      const isShortPack = pack.loops.length === 1 && pack.loops[0].frames?.length === 4 && !pack.backgroundVideoUrl && !pack.globalTrackUrl;
      state.loadFlexPack(packId);
      state.setIsPlayingLoopsOnce(isShortPack);
      state.setIsPlayingLoops(true);
      import('../../lib/multiplayer').then(({ broadcastFlex }) => {
         broadcastFlex(packId);
      });
    }
  };

  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [lastCenterTapTime, setLastCenterTapTime] = useState(0);

  const handleCenterTap = (e: React.PointerEvent) => {
    e.preventDefault();
    const state = useStore.getState();
    const now = Date.now();

    // Prevent any accidental double taps from overriding the current flex or triggering actions
    if (state.isPlayingLoops) {
      return;
    }

    if (now - lastCenterTapTime < 300) {
      // Double tap!
      if (hasSlingshot && isFirstPerson) {
        // Shoot
        const camera = new THREE.PerspectiveCamera(); // Dummy, we really need the actual camera rotation.
        // Wait, how do we get the camera rotation?
        // Let's use inputState or a global ref, OR the character's facing direction.
        // If we are in first person, the camera's fwd is the character's fwd roughly.
        // We'll shoot it using the event dispatch. Let's fire a 'slingshot_shoot' custom event, and let the Kinematics handle it since it has access to the exact camera/position.
        window.dispatchEvent(new Event('slingshot_shoot'));
        vibrate(20);
      } else {
        const flexPacks = state.flexPacks || [];
        const isShortPack = (p: any) => p.loops.length === 1 && p.loops[0].frames?.length === 4 && !p.backgroundVideoUrl && !p.globalTrackUrl;
        const shortsPacks = flexPacks.filter(isShortPack);
        
        if (shortsPacks.length > 0) {
          const randomPack = shortsPacks[Math.floor(Math.random() * shortsPacks.length)];
          state.loadFlexPack(randomPack.id);
          state.setIsPlayingLoopsOnce(true);
          state.setIsPlayingLoops(true);
          import('../../lib/multiplayer').then(({ broadcastFlex }) => {
            broadcastFlex(randomPack.id);
          });
        } else {
          alert("Сначала создайте шортс! (4 позы в одном лупе, без видео и фона)");
        }
      }
    }
    setLastCenterTapTime(now);
  };

  const handleITap = (e: React.PointerEvent) => {
    e.preventDefault();
    if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
        setIsDevUiOpen(!isDevUiOpen);
    } else {
        tapTimeoutRef.current = setTimeout(() => {
            setShowStats(!showStats);
            tapTimeoutRef.current = null;
        }, 250);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Top Bar for Room Mode */}
      <div className="absolute top-8 left-4 right-4 pointer-events-auto flex justify-between items-start">
        {/* Left Side: Exit */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              inputState.move.x = 0;
              inputState.move.y = 0;
              setAppMode('editor');
            }}
            className="flex items-center justify-center w-12 h-12 bg-[#111] rounded-[16px] text-white border-[3px] border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:bg-[#222] active:translate-y-1 active:shadow-none transition-all"
          >
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
          
          <button 
            onPointerDown={handleITap}
            className="flex items-center justify-center w-12 h-12 bg-[#111] rounded-[16px] text-white border-[3px] border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:bg-[#222] active:translate-y-1 active:shadow-none transition-all font-black text-xl select-none"
          >
            i
          </button>

          <button 
            onClick={() => setIsFirstPerson(!isFirstPerson)}
            className={`flex items-center justify-center w-12 h-12 rounded-[16px] text-white border-[3px] border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all ${isFirstPerson ? 'bg-[#ff6b00]' : 'bg-[#111] hover:bg-[#222]'}`}
          >
            {isFirstPerson ? <Eye size={24} /> : <EyeOff size={24} />}
          </button>

          <button 
            onClick={() => setIsEnvSettingsOpen(true)}
            className="flex items-center justify-center w-12 h-12 bg-[#111] rounded-[16px] text-white border-[3px] border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:bg-[#222] active:translate-y-1 active:shadow-none transition-all"
          >
            <Mountain size={24} />
          </button>
        </div>
      </div>
      
      {/* Center Top/Middle Area for double tap (Shorts playback) */}
      <div 
         className="absolute inset-x-24 top-24 bottom-48 pointer-events-auto"
         onPointerDown={handleCenterTap}
      />

      {/* Build Menu toggle at middle right layout */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-auto flex flex-row-reverse items-center justify-end gap-4">
        <button 
          onClick={() => {
            setAppMode('roomEditor');
            useStore.getState().setRoomEditorMode('build');
          }}
          className="w-16 h-16 flex items-center justify-center rounded-[20px] border-[3px] border-black transition-all active:translate-y-1 active:shadow-none shrink-0 bg-white text-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:bg-gray-100"
        >
          <Hammer size={32} strokeWidth={2.5} />
        </button>
      </div>

      <VoxelJoysticks 
         onJump={triggerJump}
         onCrouch={toggleCrouch}
      />

      {/* Crosshair */}
      {isFirstPerson && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
           <div className="w-1.5 h-1.5 bg-white rounded-full opacity-80 shadow-[0_0_2px_rgba(0,0,0,1)] mix-blend-difference" />
        </div>
      )}

      {/* Podum Flex Button */}
      {isOnPodium && !isPlayingLoops && (
        <div className="absolute top-[50%] left-1/2 -translate-x-1/2 pointer-events-auto z-50">
          <button 
            onClick={flexTimeLeft === 0 ? handleFlexButton : undefined}
            className={`px-8 py-4 rounded-full font-black tracking-widest uppercase border-[3px] border-black shadow-[0_4px_0_0_#000] transition-all text-lg ${
               flexTimeLeft === 0 
               ? 'bg-[#c084fc] text-white active:translate-y-1 active:shadow-none hover:bg-purple-400 animate-bounce' 
               : 'bg-gray-500 text-white/50 cursor-not-allowed opacity-80'
            }`}
          >
            {flexTimeLeft > 0 ? formatTime(flexTimeLeft) : 'Флексить'}
          </button>
        </div>
      )}

      {/* Slingshot Pickup Button */}
      {isNearSlingshot && !hasSlingshot && (
        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 pointer-events-auto z-50">
          <button 
            onClick={() => setHasSlingshot(true)}
            className="bg-black/90 text-white px-6 py-3 rounded-full font-black tracking-widest uppercase border-[3px] border-orange-500 shadow-[0_4px_0_0_rgba(249,115,22,1)] active:translate-y-1 active:shadow-none hover:bg-orange-500 transition-all text-sm"
          >
            Взять Рогатку
          </button>
        </div>
      )}

      <FlexPickerOverlay 
         show={showFlexPicker} 
         onClose={() => setShowFlexPicker(false)} 
         onPlay={playSelectedFlex} 
      />

      {isEnvSettingsOpen && <EnvironmentSettings onClose={() => setIsEnvSettingsOpen(false)} />}
    </div>
  );
};

