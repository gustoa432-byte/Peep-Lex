import React, { useRef, useState, useEffect } from 'react';
import { inputState } from '../../../store/inputState';
import { useStore } from '../../../store/useStore';
import { ProfileService } from '../../../services/ProfileService';
import { LogOut, ArrowUp, ArrowDown, Eye, EyeOff, Settings2 } from 'lucide-react';
import { vibrate } from '../../../lib/haptics';

export const WorldOverlay: React.FC = () => {
  const setAppMode = useStore(state => state.setAppMode);
  const triggerJump = useStore(state => state.triggerJump);
  const toggleCrouch = useStore(state => state.toggleCrouch);
  const isCrouching = useStore(state => state.isCrouching);
  const setCameraSpeed = useStore(state => state.setCameraSpeed);
  const cameraSpeed = useStore(state => state.cameraSpeed);
  const isFirstPerson = useStore(state => state.isFirstPerson);
  const setIsFirstPerson = useStore(state => state.setIsFirstPerson);
  const hasSlingshot = useStore(state => state.hasSlingshot);
  const setHasSlingshot = useStore(state => state.setHasSlingshot);
  const isNearSlingshot = useStore(state => state.isNearSlingshot);
  
  
  const profile = useStore(state => state.profile);
  const [claimableAmount, setClaimableAmount] = useState(0);
  const [showCamSettings, setShowCamSettings] = useState(false);

  const [lastCenterTapTime, setLastCenterTapTime] = useState(0);

  const handleCenterTap = (e: React.PointerEvent) => {
    e.preventDefault();
    const state = useStore.getState();
    const now = Date.now();
    
    // Stop playing if single tapped while already playing
    if (state.isPlayingLoops) {
      state.setIsPlayingLoops(false);
      return; 
    }

    if (now - lastCenterTapTime < 300) {
      // Double tap!
      if (hasSlingshot && isFirstPerson) {
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
          import('../../../lib/multiplayer').then(({ broadcastFlex }) => {
            broadcastFlex(randomPack.id);
          });
        }
      }
    }
    setLastCenterTapTime(now);
  };

  useEffect(() => {
    if (!profile) return;
    const interval = setInterval(() => {
       const now = Date.now();
       const maxTimeMs = 3 * 60 * 60 * 1000;
       const diffMs = Math.min(now - profile.last_claim_time, maxTimeMs);
       if (diffMs > 0) {
          const ponts = Math.floor(diffMs * (100 / (60 * 60 * 1000)));
          setClaimableAmount(ponts);
       } else {
          setClaimableAmount(0);
       }
    }, 10000); // Check every 10 sec
    
    // Initial check
    const diffMs = Math.min(Date.now() - profile.last_claim_time, 3 * 60 * 60 * 1000);
    if (diffMs > 0) {
      setClaimableAmount(Math.floor(diffMs * (100 / (60 * 60 * 1000))));
    }
    
    return () => clearInterval(interval);
  }, [profile]);
  
  // Left Joystick Logic
  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickKnobRef = useRef<HTMLDivElement>(null);
  const [isMoveActive, setIsMoveActive] = useState(false);
  const moveStartRef = useRef<{ x: number, y: number } | null>(null);
  const maxRadius = 50;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault(); // Prevent scrolling on mobile
    e.stopPropagation();
    
    if (!joystickRef.current) return;
    joystickRef.current.setPointerCapture(e.pointerId);
    
    const clientX = e.clientX ?? (e as any).touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? (e as any).touches?.[0]?.clientY ?? 0;
    
    moveStartRef.current = { x: clientX, y: clientY };
    setIsMoveActive(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!joystickRef.current || !joystickRef.current.hasPointerCapture(e.pointerId) || !moveStartRef.current) return;
    
    const clientX = e.clientX ?? (e as any).touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? (e as any).touches?.[0]?.clientY ?? 0;

    let dx = clientX - moveStartRef.current.x;
    let dy = clientY - moveStartRef.current.y;
    
    if (isNaN(dx)) dx = 0;
    if (isNaN(dy)) dy = 0;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }
    
    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    inputState.move.x = dx / maxRadius;
    inputState.move.y = dy / maxRadius;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!joystickRef.current) return;
    joystickRef.current.releasePointerCapture(e.pointerId);
    moveStartRef.current = null;
    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transform = `translate(0px, 0px)`;
    }
    inputState.move.x = 0;
    inputState.move.y = 0;
    setIsMoveActive(false);
  };

  // Right Joystick Logic (Camera & Gestures)
  const lookJoystickRef = useRef<HTMLDivElement>(null);
  const lookKnobRef = useRef<HTMLDivElement>(null);
  const [isLookActive, setIsLookActive] = useState(false);
  const lookStartRef = useRef<{ x: number, y: number, time: number } | null>(null);

  const handleLookPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!lookJoystickRef.current) return;
    lookJoystickRef.current.setPointerCapture(e.pointerId);
    
    const clientX = e.clientX ?? (e as any).touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? (e as any).touches?.[0]?.clientY ?? 0;

    lookStartRef.current = { x: clientX, y: clientY, time: Date.now() };
    setIsLookActive(true);
  };

  const handleLookPointerMove = (e: React.PointerEvent) => {
    if (!lookJoystickRef.current || !lookJoystickRef.current.hasPointerCapture(e.pointerId) || !lookStartRef.current) return;
    
    const clientX = e.clientX ?? (e as any).touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? (e as any).touches?.[0]?.clientY ?? 0;

    let dx = clientX - lookStartRef.current.x;
    let dy = clientY - lookStartRef.current.y;

    if (isNaN(dx)) dx = 0;
    if (isNaN(dy)) dy = 0;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }
    
    if (lookKnobRef.current) {
      lookKnobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    inputState.look.x = dx / maxRadius;
    inputState.look.y = dy / maxRadius;
  };

  const handleLookPointerUp = (e: React.PointerEvent) => {
    if (!lookJoystickRef.current) return;
    lookJoystickRef.current.releasePointerCapture(e.pointerId);
    
    // Check for swipe gesture
    if (lookStartRef.current) {
      const deltaY = e.clientY - lookStartRef.current.y;
      const deltaTime = Date.now() - lookStartRef.current.time;
      const state = useStore.getState();
      
      // Fast vertical swipe
      if (deltaTime < 300 && !state.isPlayingLoops) {
        if (deltaY < -40) {
          vibrate([10, 30, 10]);
          triggerJump();
        } else if (deltaY > 40) {
          vibrate(10);
          toggleCrouch();
        }
      }
    }
    
    lookStartRef.current = null;
    if (lookKnobRef.current) {
      lookKnobRef.current.style.transform = `translate(0px, 0px)`;
    }
    inputState.look.x = 0;
    inputState.look.y = 0;
    setIsLookActive(false);
  };

  useEffect(() => {
    return () => {
      inputState.move.x = 0;
      inputState.move.y = 0;
      inputState.look.x = 0;
      inputState.look.y = 0;
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Top Bar Navigation */}
      <div className="absolute top-4 left-4 pointer-events-auto flex flex-col items-start gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              vibrate(10);
              setAppMode('editor');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-black/95 rounded-full text-white border border-white/20 hover:bg-black shadow-lg"
          >
            <LogOut size={16} />
            <span>Выход</span>
          </button>

          <button 
            onClick={() => setIsFirstPerson(!isFirstPerson)}
            className={`flex items-center justify-center w-[40px] h-[40px] rounded-full text-white border border-white/20 shadow-lg transition-all ${isFirstPerson ? 'bg-[#ff6b00]' : 'bg-black/95 hover:bg-black'}`}
          >
            {isFirstPerson ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowCamSettings(!showCamSettings)}
              className={`flex items-center justify-center w-[40px] h-[40px] rounded-full text-white border border-white/20 shadow-lg transition-all ${showCamSettings ? 'bg-[#ff6b00]' : 'bg-black/95 hover:bg-black'}`}
            >
              <Settings2 size={20} />
            </button>
            {showCamSettings && (
              <div className="absolute top-full left-0 mt-2 bg-black/95 rounded-2xl p-4 text-white border border-white/20 shadow-lg flex flex-col items-start gap-4 min-w-[200px] z-50">
                <span className="text-white/60 font-bold uppercase text-xs tracking-widest">Камера</span>
                <div className="w-full">
                  <label className="text-xs opacity-70 mb-2 block">Чувствительность: {cameraSpeed.toFixed(1)}</label>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="5.0" 
                    step="0.1"
                    className="w-full accent-orange-500" 
                    value={cameraSpeed} 
                    onChange={(e) => setCameraSpeed(Number(e.target.value))} 
                  />
                </div>
              </div>
            )}
          </div>
          
          <span className="text-white/60 font-bold tracking-widest text-sm uppercase flex items-center gap-2">
            Режим Мира
          </span>
        </div>

        <div className="flex gap-2">
          {claimableAmount > 0 && (
            <button
              onClick={() => {
                 const claimed = ProfileService.claimAFKPonts();
                 setClaimableAmount(0);
                 if (claimed > 0) window.alert(`Вы получили +${claimed} Понтов!`);
                 vibrate([10, 30, 50, 30, 10]);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 rounded-full font-bold text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] animate-pulse"
            >
               Забрать Понты (+{claimableAmount})
            </button>
          )}
        </div>
      </div>

      <div 
         className="absolute inset-x-24 top-24 bottom-48 pointer-events-auto"
         onPointerDown={handleCenterTap}
      />

      {/* Camera Speed control removed - moved to settings menu */}

      {/* Left Joystick - Movement */}
      <div 
        className={`absolute bottom-12 left-12 w-32 h-32 bg-black/80 border-2 border-white/30 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] pointer-events-auto touch-none flex items-center justify-center p-0 m-0 transition-opacity duration-300 ${isMoveActive ? 'opacity-5' : 'opacity-100'}`}
        ref={joystickRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div 
          ref={joystickKnobRef}
          className="w-12 h-12 bg-black/80 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-transform duration-75 pointer-events-none"
          style={{ transform: `translate(0px, 0px)` }}
        />
      </div>

      {/* Right Joystick - Camera & Gestures */}
      <div 
        className={`absolute bottom-12 right-12 w-32 h-32 bg-black/80 border-2 border-white/30 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] pointer-events-auto touch-none flex items-center justify-center p-0 m-0 transition-opacity duration-300 ${isLookActive ? 'opacity-5' : 'opacity-100'}`}
        ref={lookJoystickRef}
        onPointerDown={handleLookPointerDown}
        onPointerMove={handleLookPointerMove}
        onPointerUp={handleLookPointerUp}
        onPointerCancel={handleLookPointerUp}
      >
        {/* Transparent background to capture gestures, with indicators for jump/crouch limits */}
        <div className="absolute top-2 w-8 h-1 bg-black/80 rounded-full" />
        <div className="absolute bottom-2 w-8 h-1 bg-black/80 rounded-full" />
        
        <div 
          ref={lookKnobRef}
          className="w-12 h-12 bg-black/80 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-transform duration-75 pointer-events-none"
          style={{ transform: `translate(0px, 0px)` }}
        />
      </div>

      {/* Crosshair */}
      {isFirstPerson && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
           <div className="w-1.5 h-1.5 bg-white rounded-full opacity-80 shadow-[0_0_2px_rgba(0,0,0,1)] mix-blend-difference" />
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
    </div>
  );
};
