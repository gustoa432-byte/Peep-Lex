import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats, OrbitControls } from '@react-three/drei';
import { PeepCharacter } from './PeepCharacter';
import { AnimationPlayer } from '../../features/characterCustomization/3d/AnimationPlayer';
import { useStore } from '../../store/useStore';
import { MultiplayerCharacters } from './MultiplayerCharacters';
import { MultiplayerPhysicsObjects } from './MultiplayerPhysicsObjects';
import { SceneManager } from '../../managers/SceneManager';

export const SceneViewer: React.FC = () => {
  const appMode = useStore(state => state.appMode);
  const showStats = useStore(state => state.showStats);

  return (
    <div className="w-full h-full bg-[#111216]">
      <Canvas 
        camera={{ fov: 75, near: 0.1, far: 30000 }}
        dpr={[1, 2]} 
        gl={{ antialias: true, powerPreference: 'default' }}
        shadows
      >
        {showStats && <Stats className="!absolute !top-0 !left-0 !bottom-auto !z-[100]" />}
        {appMode === 'editor' && (
          <OrbitControls 
            enableZoom={true} 
            enablePan={true} 
            minDistance={2} 
            maxDistance={100} 
            maxPolarAngle={Math.PI / 2 + 0.1} 
            makeDefault 
          />
        )}
        <AnimationPlayer />

        <Suspense fallback={null}>
          <PeepCharacter />
          <MultiplayerCharacters />
          {(appMode === 'room' || appMode === 'roomEditor') && (
             <MultiplayerPhysicsObjects />
          )}
          <SceneManager />
        </Suspense>
      </Canvas>
    </div>
  );
};
