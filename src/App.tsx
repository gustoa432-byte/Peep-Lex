// UI DESIGN DIRECTIVE: 
// СТРОГО ЗАПРЕЩЕНО использовать когда-либо в UI размытое стекло (, bg-black/80 и подобные эффекты glassmorphism). 
// Все UI элементы должны использовать солидные фоны, такие как bg-black/95 (черный цвет с 5% прозрачности), 
// чтобы избежать проблем с производительностью на мобильных устройствах и поддержания консистентного дизайна.

import React, { Component, ReactNode, useEffect, useRef, useState } from 'react';
import { SceneViewer } from './components/3d/SceneViewer';
import { ModeTransitionOverlay } from './components/ui/ModeTransitionOverlay';
import { Diamond, Flame } from 'lucide-react';
import { useStore } from './store/useStore';
import { BodyEditorOverlay } from './features/characterCustomization/ui/BodyEditorOverlay';
import { ArcMenu } from './components/ui/ArcMenu';
import { DevUI } from './components/ui/DevUI';
import { GlobalAudioPlayer } from './components/audio/GlobalAudioPlayer';
import { BroadcastListener } from './components/BroadcastListener';
import { ProfileMenuOverlay } from './components/ui/ProfileMenuOverlay';
import { UIManager } from './managers/SceneManager';
import { initKeepAlive } from './lib/keepAlive';
import { MultiplayerService } from './services/MultiplayerService';
import { LoadingScreen } from './components/ui/LoadingScreen';

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { 
    console.error(error, errorInfo);
    fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: error.message, stack: error.stack, info: errorInfo.componentStack })
    }).catch(console.error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', zIndex: 9999, position: 'absolute', background: 'black', padding: 20 }}>
          <h1>Something went wrong.</h1>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '10px' }}>{this.state.error && (this.state.error as Error).stack}</pre>
        </div>
      );
    }
    return this.props.children; 
  }
}

function App() {

  const isBodyEditorOpen = useStore(state => state.isBodyEditorOpen);
  const isAnimationMenuOpen = useStore(state => state.isAnimationMenuOpen);
  const isPlayingAnimation = useStore(state => state.isPlayingAnimation);
  const isPlayingLoops = useStore(state => state.isPlayingLoops);
  const isProfileMenuOpen = useStore(state => state.isProfileMenuOpen);
  const appMode = useStore(state => state.appMode);
  
  const prs = useStore(state => state.profile?.prs || 0);
  const ponts = useStore(state => state.profile?.ponts || 0);

  const [isAssetsLoaded, setIsAssetsLoaded] = useState(false);

  useEffect(() => {
    initKeepAlive();
    MultiplayerService.init();
  }, []);

  useEffect(() => {
    if (isAssetsLoaded) {
      MultiplayerService.joinRoom(appMode);
    }
  }, [appMode, isAssetsLoaded]);

  if (!isAssetsLoaded) {
    return <LoadingScreen onComplete={() => setIsAssetsLoaded(true)} />;
  }

  return (
    <div className="w-full h-[100dvh] flex flex-col bg-[#111216] text-white overflow-hidden relative">
      
      {/* Holographic SVG Gradient Definition */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="holographic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff9a9e" />
            <stop offset="25%" stopColor="#fecfef" />
            <stop offset="50%" stopColor="#a1c4fd" />
            <stop offset="75%" stopColor="#c2e9fb" />
            <stop offset="100%" stopColor="#e0c3fc" />
          </linearGradient>
          <linearGradient id="diamond-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d8b4fe" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
          <linearGradient id="flame-grad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>
          <filter id="glass-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(255,255,255,0.3)" />
            <feDropShadow dx="0" dy="-2" stdDeviation="2" floodColor="rgba(255,150,255,0.2)" />
          </filter>
        </defs>
      </svg>

      <ErrorBoundary><BroadcastListener /></ErrorBoundary>
      <ErrorBoundary><GlobalAudioPlayer /></ErrorBoundary>

      {/* Main Content */}
      <main className="flex-1 relative">
        <ErrorBoundary><SceneViewer /></ErrorBoundary>
      </main>

      <ModeTransitionOverlay />

      {/* Top Bar: Currencies (Hidden when customizing, animating or in world mode) */}
      <div className={`absolute top-8 left-0 right-0 px-6 flex justify-between items-start z-40 pointer-events-auto transition-opacity duration-300 ${(isBodyEditorOpen || isPlayingAnimation || isPlayingLoops || isAnimationMenuOpen || isProfileMenuOpen || appMode === 'world' || appMode === 'parkour' || appMode === 'room' || appMode === 'roomEditor') ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Left: Пиары (Purple-Turquoise Diamond) */}
        <div className="flex items-center gap-2 bg-black/95 px-4 py-2 rounded-full border border-white/10 shadow-lg transition-colors">
          <Diamond size={22} fill="url(#diamond-grad)" stroke="rgba(255,255,255,0.8)" strokeWidth={1.5} />
          <span className="font-bold text-white tracking-wide">{prs}</span>
        </div>

        {/* Right: Понты (Bright Yellow Flame) */}
        <div className="flex items-center gap-2 bg-black/95 px-4 py-2 rounded-full border border-white/10 shadow-lg transition-colors">
          <span className="font-bold text-white tracking-wide">{ponts}</span>
          <Flame size={22} fill="url(#flame-grad)" stroke="rgba(255,255,255,0.8)" strokeWidth={1.5} />
        </div>
      </div>

      {/* Main UI Router */}
      <ErrorBoundary><UIManager /></ErrorBoundary>
      
      <ErrorBoundary><ProfileMenuOverlay /></ErrorBoundary>

      {/* Persistent global Dev settings panel */}
      <ErrorBoundary><DevUI /></ErrorBoundary>

      <div className={`absolute inset-0 pointer-events-none z-50 transition-all duration-300 ${isBodyEditorOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-4 opacity-0'}`}>
        <ErrorBoundary><BodyEditorOverlay /></ErrorBoundary>
      </div>
    </div>
  );
}

export default App;
