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
    const wasMacroRef = React.useRef<boolean>(false);

    const isBuildingActive = useStore((state) => state.isBuildingActive);

    const isMacro = appMode === 'roomEditor' && roomEditorMode !== 'voxel';
    const isBuildMode = roomEditorMode === 'build';
    // Camera is fully usable by default in view/move/build
    const shouldEnableControls = appMode === 'roomEditor' && (roomEditorMode === 'view' || roomEditorMode === 'move' || roomEditorMode === 'build');
    const isEnabled = shouldEnableControls && !isBuildingActive;

    const isMacroRef = React.useRef<boolean>(isMacro);
    isMacroRef.current = isMacro;
    const roomCameraResetTrigger = useStore(state => state.roomCameraResetTrigger);

    React.useEffect(() => {
        const controls = controlsRef.current;
        if (!controls) return;
        const onChange = () => {
             if (isMacroRef.current && controls.enabled) {
                 // Update the global store directly without triggering re-renders here if we use getState
                 useStore.getState().setMacroCameraState({
                     position: [camera.position.x, camera.position.y, camera.position.z],
                     target: [controls.target.x, controls.target.y, controls.target.z]
                 });
             }
        };
        controls.addEventListener('change', onChange);
        return () => controls.removeEventListener('change', onChange);
    }, [camera]);

    React.useEffect(() => {
        const controls = controlsRef.current;
        if (!controls || !isMacro) return;

        if (roomCameraResetTrigger > 0) {
            camera.position.set(0, 80, 80);
            controls.target.set(0, 0, 0);
            useStore.getState().setMacroCameraState({
                position: [0, 80, 80],
                target: [0, 0, 0]
            });
            controls.update();
        }
    }, [roomCameraResetTrigger, isMacro, camera]);

    React.useEffect(() => {
        const controls = controlsRef.current;
        if (!controls) return;

        if (isMacro) {
             // Restore builder camera ONLY when entering macro mode from another mode
             if (!wasMacroRef.current) {
                 const storedState = useStore.getState().macroCameraState;
                 if (storedState) {
                     camera.position.set(...storedState.position);
                     controls.target.set(...storedState.target);
                 } else {
                     camera.position.set(0, 80, 80);
                     controls.target.set(0, 0, 0);
                 }
             }
             controls.enabled = isEnabled;
             controls.update();
        } else {
             // We are leaving macro mode for room or voxel.
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
