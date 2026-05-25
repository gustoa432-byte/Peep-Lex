import fs from 'fs';

function r(file, search, replace) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replaceAll(search, replace);
    fs.writeFileSync(file, content);
  }
}

// 1. In characterCustomization/3d/EditorScene.tsx
let f = 'src/features/characterCustomization/3d/EditorScene.tsx';
r(f, `'./materials/PlasticMaterial'`, `'../../../components/3d/materials/PlasticMaterial'`);
r(f, `'./BackgroundVideoProjector'`, `'../../../components/3d/BackgroundVideoProjector'`);
r(f, `'../../audio/GlobalAudioPlayer'`, `'../../../components/audio/GlobalAudioPlayer'`);

// 2. In characterCustomization/ui/AnimationMenu.tsx
f = 'src/features/characterCustomization/ui/AnimationMenu.tsx';
r(f, `'./common/Slider'`, `'../../../components/ui/common/Slider'`);
r(f, `'./VirtualJoystick'`, `'../../../components/ui/VirtualJoystick'`);
r(f, `'../../audio/GlobalAudioPlayer'`, `'../../../components/audio/GlobalAudioPlayer'`);
r(f, `'./MediaLibraryModal'`, `'../../../components/ui/MediaLibraryModal'`);

// 3. In characterCustomization/ui/BodyEditorOverlay.tsx
f = 'src/features/characterCustomization/ui/BodyEditorOverlay.tsx';
r(f, `'./common/Slider'`, `'../../../components/ui/common/Slider'`);

// 4. In roomBuilder/3d/ChunkedRoomBlocks.tsx
f = 'src/features/roomBuilder/3d/ChunkedRoomBlocks.tsx';
r(f, `'./materials/PlasticMaterial'`, `'../../../components/3d/materials/PlasticMaterial'`);

// 5. In roomBuilder/3d/RoomBuildSystem.tsx
f = 'src/features/roomBuilder/3d/RoomBuildSystem.tsx';
r(f, `'./materials/PlasticMaterial'`, `'../../../components/3d/materials/PlasticMaterial'`);
r(f, `'./BackgroundVideoProjector'`, `'../../../components/3d/BackgroundVideoProjector'`);

// 6. In roomBuilder/3d/RoomScene.tsx
f = 'src/features/roomBuilder/3d/RoomScene.tsx';
r(f, `'./materials/PlasticMaterial'`, `'../../../components/3d/materials/PlasticMaterial'`);
r(f, `'../../audio/GlobalAudioPlayer'`, `'../../../components/audio/GlobalAudioPlayer'`);

// 7. In worldExploration/3d/WorldScene.tsx
f = 'src/features/worldExploration/3d/WorldScene.tsx';
r(f, `'./materials/PlasticMaterial'`, `'../../../components/3d/materials/PlasticMaterial'`);
r(f, `'./SlingshotItem'`, `'../../../components/3d/SlingshotItem'`);

// 8. In useCharacterKinematics.ts
f = 'src/hooks/useCharacterKinematics.ts';
r(f, `'../components/3d/AnimationPlayer'`, `'../features/characterCustomization/3d/AnimationPlayer'`);

// 9. In CharacterController.ts
f = 'src/managers/CharacterController.ts';
r(f, `'../components/3d/AnimationPlayer'`, `'../features/characterCustomization/3d/AnimationPlayer'`);

