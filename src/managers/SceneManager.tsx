import React, { Suspense } from 'react';
import { useStore } from '../store/useStore';
import { WorldScene } from '../features/worldExploration/3d/WorldScene';
import { RoomScene } from '../features/roomBuilder/3d/RoomScene';
import { EditorScene } from '../features/characterCustomization/3d/EditorScene';
import { AnimationMenu } from '../features/characterCustomization/ui/AnimationMenu';

const WorldOverlay = React.lazy(() => import('../features/worldExploration/ui/WorldOverlay').then(m => ({ default: m.WorldOverlay })));
const RoomOverlay = React.lazy(() => import('../features/roomBuilder/RoomOverlay').then(m => ({ default: m.RoomOverlay })));
const RoomEditorOverlay = React.lazy(() => import('../features/roomBuilder/RoomEditorOverlay').then(m => ({ default: m.RoomEditorOverlay })));
const ArcMenu = React.lazy(() => import('../components/ui/ArcMenu').then(m => ({ default: m.ArcMenu })));

// SceneManager handles 3D Content Routing
export const SceneManager: React.FC = () => {
  const appMode = useStore(state => state.appMode);
  
  switch (appMode) {
    case 'world':
      return null; // World is under development (technical break)
    case 'room':
    case 'roomEditor':
      return <RoomScene />;
    case 'editor':
    default:
      return <EditorScene />;
  }
};

// UIManager handles 2D Overlay Routing
export const UIManager: React.FC = () => {
  const appMode = useStore(state => state.appMode);
  const isAnimationMenuOpen = useStore(state => state.isAnimationMenuOpen);
  
  return (
    <Suspense fallback={null}>
      {appMode === 'world' && <WorldOverlay />}
      {appMode === 'room' && <RoomOverlay />}
      {appMode === 'roomEditor' && <RoomEditorOverlay />}
      {appMode === 'editor' && (
        <>
          <AnimationMenu />
          {!isAnimationMenuOpen && <ArcMenu />}
        </>
      )}
    </Suspense>
  );
};
