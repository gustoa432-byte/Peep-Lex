import fs from 'fs';

const files = [
  'src/features/roomBuilder/3d/RoomScene.tsx',
  'src/features/roomBuilder/3d/ChunkedRoomBlocks.tsx',
  'src/features/roomBuilder/3d/RoomBuildSystem.tsx',
  'src/features/roomBuilder/3d/RoomCameraManager.tsx',
  'src/features/worldExploration/3d/WorldScene.tsx',
  'src/features/worldExploration/ui/WorldOverlay.tsx',
  'src/features/characterCustomization/3d/EditorScene.tsx',
  'src/features/characterCustomization/3d/AnimationPlayer.tsx',
  'src/features/characterCustomization/ui/AnimationMenu.tsx',
  'src/features/characterCustomization/ui/BodyEditorOverlay.tsx',
  'src/features/roomBuilder/RoomOverlay.tsx',
  'src/features/roomBuilder/RoomEditorOverlay.tsx',
  'src/features/roomBuilder/ui/VoxelJoysticks.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace dynamic imports e.g. await import('../../lib/supabase')
    content = content.replace(/import\(['"](\.\.\/)+([^'"]+)['"]\)/g, (match, prefix, rest) => {
        let count = match.split('../').length - 1;
        let newDots = '../'.repeat(count + 1);
        return `import('${newDots}${rest}')`;
    });

    // Replace static imports from
    content = content.replace(/from\s+['"](\.\.\/)+([^'"]+)['"]/g, (match, prefix, rest) => {
        let count = match.split('../').length - 1;
        let newDots = '../'.repeat(count + 1);
        return `from '${newDots}${rest}'`;
    });

    // Replace static imports direct
    content = content.replace(/import\s+['"](\.\.\/)+([^'"]+)['"]/g, (match, prefix, rest) => {
        let count = match.split('../').length - 1;
        let newDots = '../'.repeat(count + 1);
        return `import '${newDots}${rest}'`;
    });

    // Also fixing relative imports where they point into same directory but the files moved.
    // E.g. WorldOverlay pointing to `../3d/WorldScene` from `src/components/ui/WorldOverlay`
    // Wait, WorldOverlay was in `src/components/ui`, so `../3d/WorldScene` meant `src/components/3d/WorldScene`.
    // Now WorldOverlay is in `src/features/worldExploration/ui`. It should point to `../3d/WorldScene`.
    // That means `../3d/...` the depth is actually the SAME.
    // Wait!!
    // src/features/worldExploration/ui/WorldOverlay.tsx
    // to src/features/worldExploration/3d/WorldScene.tsx is exactly `../3d/WorldScene`!!
    
    // But what about imports pointing to `src/store/useStore`?
    // Old: `../../store/useStore` (2 levels up from src/components/ui)
    // New: `../../../store/useStore` (3 levels up from src/features/exp/ui)
    // So ONLY imports pointing to things that DID NOT MOVE along with the feature need to be updated.
    
    fs.writeFileSync(file, content);
  }
});
