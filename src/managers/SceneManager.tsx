import React from 'react';
import { useStore } from '../store/useStore';
import { WorldScene } from '../features/worldExploration/3d/WorldScene';
import { RoomScene } from '../features/roomBuilder/3d/RoomScene';
import { EditorScene } from '../features/characterCustomization/3d/EditorScene';
import { WorldOverlay } from '../features/worldExploration/ui/WorldOverlay';
import { RoomOverlay } from '../features/roomBuilder/RoomOverlay';
import { RoomEditorOverlay } from '../features/roomBuilder/RoomEditorOverlay';
import { ArcMenu } from '../components/ui/ArcMenu';
import { AnimationMenu } from '../features/characterCustomization/ui/AnimationMenu';

// SceneManager handles 3D Content Routing
export const SceneManager: React.FC = () => {
  const appMode = useStore(state => state.appMode);
  
  switch (appMode) {
    case 'world':
      return <WorldScene />;
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
    <>
      {appMode === 'world' && <WorldOverlay />}
      {appMode === 'room' && <RoomOverlay />}
      {appMode === 'roomEditor' && <RoomEditorOverlay />}
      {appMode === 'editor' && (
        <>
          <AnimationMenu />
          {!isAnimationMenuOpen && <ArcMenu />}
        </>
      )}
    </>
  );
};
