import React, { memo } from 'react';
import { Home, Smile, Users, Play, Globe, Star, DoorOpen } from 'lucide-react';
import { useStore } from '../../store/useStore';

const MetallicButton = memo(({ icon: Icon, size = 'md', onClick, x, y, iconScale = 1 }: any) => {
  const isLg = size === 'lg';
  const sizeClass = isLg ? 'w-[84px] h-[84px]' : 'w-[60px] h-[60px]';
  const baseIconSize = isLg ? 36 : 26;
  const iconSize = baseIconSize * iconScale;
  const paddingClass = isLg ? 'p-[4px]' : 'p-[3px]';

  return (
    <div 
      className={`absolute left-1/2 bottom-2 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer z-50 pointer-events-auto`}
      style={{ transform: `translate(calc(-50% + ${x}px), ${-y}px)` }}
      onClick={onClick}
    >
      {/* Outer Holographic Rim */}
      <div className={`${paddingClass} rounded-full border-[3px] border-black shadow-[0_3px_0_0_#000] ${sizeClass} bg-[conic-gradient(from_180deg_at_50%_50%,#a855f7_0deg,#06b6d4_90deg,#a855f7_180deg,#ec4899_270deg,#a855f7_360deg)]`}>
        
        {/* Inner Core with Vinyl Texture */}
        <div 
          className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden border-[3px] border-black shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)]"
          style={{
            background: `
              repeating-radial-gradient(
                circle at 50% 50%,
                transparent 0,
                transparent 1px,
                rgba(0, 0, 0, 0.25) 1px,
                rgba(0, 0, 0, 0.25) 2px
              ),
              conic-gradient(
                from 150deg at 50% 50%,
                rgba(255,255,255,0.3) 0deg,
                transparent 40deg,
                transparent 140deg,
                rgba(255,255,255,0.3) 180deg,
                transparent 220deg,
                transparent 320deg,
                rgba(255,255,255,0.3) 360deg
              ),
              radial-gradient(circle at 50% 50%, #4a4060 0%, #1d182b 80%, #0f0c16 100%)
            `
          }}
        >
          {/* Glowing Icon */}
          <div className="relative z-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]">
            <Icon size={iconSize} strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </div>
  );
});

export const ArcMenu = memo(() => {
  const isBodyEditorOpen = useStore(state => state.isBodyEditorOpen);
  const setIsBodyEditorOpen = useStore(state => state.setIsBodyEditorOpen);
  const isAnimationMenuOpen = useStore(state => state.isAnimationMenuOpen);
  const setIsAnimationMenuOpen = useStore(state => state.setIsAnimationMenuOpen);
  const isProfileMenuOpen = useStore(state => state.isProfileMenuOpen);
  const setIsProfileMenuOpen = useStore(state => state.setIsProfileMenuOpen);
  const isPlayingAnimation = useStore(state => state.isPlayingAnimation);
  const isPlayingLoops = useStore(state => state.isPlayingLoops);
  const appMode = useStore(state => state.appMode);
  const setAppMode = useStore(state => state.setAppMode);

  if (isBodyEditorOpen || isPlayingAnimation || isPlayingLoops || appMode === 'parkour' || isProfileMenuOpen) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none z-40">
      <div className="relative w-full h-full">
        {/* Left Side */}
        <MetallicButton icon={Play} x={-80} y={60} onClick={() => setIsAnimationMenuOpen(!isAnimationMenuOpen)} />
        <MetallicButton icon={DoorOpen} x={-140} y={10} onClick={() => setAppMode('room')} />
        
        {/* Center */}
        <MetallicButton icon={Smile} size="lg" x={0} y={0} onClick={() => {
            setIsBodyEditorOpen(true);
            useStore.getState().setActiveTab('body');
        }} />
        
        {/* Right Side */}
        <MetallicButton icon={Star} x={80} y={60} iconScale={0.85} onClick={() => setIsProfileMenuOpen(true)} />
        
        <MetallicButton icon={Globe} x={140} y={10} onClick={() => setAppMode('world')} />
      </div>
    </div>
  );
});
