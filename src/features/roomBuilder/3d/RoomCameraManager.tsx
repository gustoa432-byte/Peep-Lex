import React from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../../store/useStore';

export const RoomCameraManager = () => {
    const { camera } = useThree();
    const appMode = useStore((state) => state.appMode);
    const roomEditorMode = useStore((state) => state.roomEditorMode);

    const controlsRef = React.useRef<any>(null);
    const savedBuildState = React.useRef<{ position: THREE.Vector3, target: THREE.Vector3 } | null>(null);
    const wasMacroRef = React.useRef<boolean>(false);

    const isBuildingActive = useStore((state) => state.isBuildingActive);

    const isMacro = appMode === 'roomEditor' && roomEditorMode !== 'voxel';
    const isBuildMode = roomEditorMode === 'build';
    // Camera is fully usable by default in view/move/build
    const shouldEnableControls = appMode === 'roomEditor' && (roomEditorMode === 'view' || roomEditorMode === 'move' || roomEditorMode === 'build');
    const isEnabled = shouldEnableControls && !isBuildingActive;

    React.useEffect(() => {
        const controls = controlsRef.current;
        if (!controls) return;

        if (isMacro) {
             // Restore or set default builder camera ONLY when entering macro mode from another mode
             if (!wasMacroRef.current) {
                 if (savedBuildState.current) {
                     camera.position.copy(savedBuildState.current.position);
                     controls.target.copy(savedBuildState.current.target);
                 } else {
                     camera.position.set(0, 80, 80);
                     controls.target.set(0, 0, 0);
                 }
             }
             controls.enabled = isEnabled;
             controls.update();
        } else {
             // We are leaving macro mode for room or voxel.
             // Save current builder camera position so we can restore it later.
             if (wasMacroRef.current) {
                 savedBuildState.current = {
                     position: camera.position.clone(),
                     target: controls.target.clone()
                 };
             }
             controls.enabled = false;
        }
        
        wasMacroRef.current = isMacro;
    }, [appMode, roomEditorMode, camera, isBuildingActive, isEnabled, isMacro]);

    return (
        <OrbitControls 
            ref={controlsRef}
            makeDefault 
            maxPolarAngle={Math.PI / 2 - 0.1}
            minDistance={5}
            maxDistance={150}
            enabled={isEnabled}
        />
    );
};
