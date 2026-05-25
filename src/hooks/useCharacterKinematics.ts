import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import { CharacterRefs, applyBones, applyCrouching, safeNum } from '../kinematics/shared';
import { CharacterController } from '../managers/CharacterController';
import { activePoseRef } from '../features/characterCustomization/3d/AnimationPlayer';
import { defaultDevSettings } from '../store/defaults';
import { InputManager } from '../managers/InputManager';
import { shootSlingshot } from '../lib/multiplayer';

export { safeNum };
export type { CharacterRefs };

// Set up globals
if (typeof window !== 'undefined') {
  InputManager.init();
}

export const useCharacterKinematics = () => {
  const refs: CharacterRefs = {
    characterGroupRef: useRef<THREE.Group>(null),
    visualGroupRef: useRef<THREE.Group>(null),
    crouchGroupRef: useRef<THREE.Group>(null),
    spineRef: useRef<THREE.Group>(null),
    neckRef: useRef<THREE.Group>(null),
    leftShoulderRef: useRef<THREE.Group>(null),
    rightShoulderRef: useRef<THREE.Group>(null),
    leftElbowRef: useRef<THREE.Group>(null),
    rightElbowRef: useRef<THREE.Group>(null),
    leftWristRef: useRef<THREE.Group>(null),
    rightWristRef: useRef<THREE.Group>(null),
    leftHipRef: useRef<THREE.Group>(null),
    rightHipRef: useRef<THREE.Group>(null),
    leftKneeRef: useRef<THREE.Group>(null),
    rightKneeRef: useRef<THREE.Group>(null),
    crouchFactorRef: useRef(0)
  };

  const { camera } = useThree();
  const didInit = useRef(false);

  const appMode = useStore(state => state.appMode);

  useEffect(() => {
    CharacterController.start();
    return () => {
      // Do not stop for now, it's global.
    };
  }, []);

  useEffect(() => {
    if (appMode !== 'world' && appMode !== 'room') return;
    const onShoot = () => {
      const pos = camera.position.clone();
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
      pos.add(dir.clone().multiplyScalar(2));
      shootSlingshot({ x: pos.x, y: pos.y, z: pos.z }, { x: dir.x, y: dir.y, z: dir.z });
    };
    window.addEventListener('slingshot_shoot', onShoot);
    return () => window.removeEventListener('slingshot_shoot', onShoot);
  }, [appMode, camera]);

  useFrame((state, delta) => {
    if (!refs.characterGroupRef.current || !refs.visualGroupRef.current) return;

    if (!didInit.current) {
        // First frame initialization if needed
        didInit.current = true;
    }

    const { position, visualQuaternion, cameraPosition, cameraQuaternion, animation } = CharacterController.getSnapshot();

    // 1. Sync Base Position & Rotation
    refs.characterGroupRef.current.position.copy(position);
    refs.visualGroupRef.current.quaternion.copy(visualQuaternion);

    // 2. Sync Camera
    const store = useStore.getState();
    const { appMode: currentAppMode } = store;

    if (state.controls && currentAppMode !== 'editor') {
      (state.controls as any).enabled = false; 
    }

    if (currentAppMode === 'editor') {
        const targetHeight = 5.3;
        const targetPos = position.clone().add(new THREE.Vector3(0, targetHeight, 0));
        if (state.controls) {
            const controls = state.controls as any;
            controls.enabled = true;
            controls.target.lerp(targetPos, 0.1);
            controls.minDistance = 19.5;
            controls.maxDistance = 19.5;
            controls.maxPolarAngle = Math.PI / 2 - 0.05;
            controls.minPolarAngle = 0;
            controls.update();
        }
    } else {
        camera.position.copy(cameraPosition);
        camera.quaternion.copy(cameraQuaternion);
    }

    // 3. Apply DevSettings (Bones)
    const { isPlayingAnimation, isPlayingLoops, isAnimationMenuOpen, editingLoopId, devSettings, podiumPosition } = store;
    const isMainHub = !isAnimationMenuOpen && !isPlayingLoops && editingLoopId === null;
    const activeSettings = (isPlayingAnimation || isPlayingLoops) ? activePoseRef.current : devSettings;
    const currentDevSettings = (currentAppMode === 'editor' && isMainHub) ? defaultDevSettings : activeSettings;

    // Apply procedural overrides if moving
    const overrides = (animation.isMoving || animation.leftHipX !== 0) ? {
        leftHipX: animation.leftHipX,
        leftKneeX: animation.leftKneeX,
        rightHipX: animation.rightHipX,
        rightKneeX: animation.rightKneeX,
        leftShoulderX: animation.leftShoulderX,
        leftElbowX: animation.leftElbowX,
        rightShoulderX: animation.rightShoulderX,
        rightElbowX: animation.rightElbowX,
    } : {};

    applyBones(refs, currentDevSettings, overrides);

    // Apply crouching
    const safeDelta = isNaN(delta) ? 0 : Math.max(0, delta);
    const dt = Math.min(safeDelta, 0.1);
    refs.crouchFactorRef.current = THREE.MathUtils.lerp(refs.crouchFactorRef.current, animation.isCrouching ? 1 : 0, 15 * dt);
    applyCrouching(refs, currentDevSettings, refs.crouchFactorRef.current);

    // Audio fading in room
    if (currentAppMode === 'room') {
        const gainNode = (window as any).__GLOBAL_AUDIO_GAIN_NODE__;
        if (gainNode) {
            const px = position.x - podiumPosition[0];
            const pz = position.z - podiumPosition[2];
            const distSq = px * px + pz * pz;

            if (isPlayingLoops) {
                const distance = Math.sqrt(distSq);
                let targetVol = 1.0;
                if (distance > 10) {
                    const progress = Math.min(1, (distance - 10) / 140);
                    targetVol = Math.max(0, Math.pow(1 - progress, 2));
                }
                const audioCtx = (window as any).__GLOBAL_AUDIO_CONTEXT__;
                if (audioCtx) {
                    gainNode.gain.setTargetAtTime(targetVol, audioCtx.currentTime, 0.1);
                } else {
                    gainNode.gain.value = targetVol;
                }
            } else {
                gainNode.gain.value = 1.0;
            }
        }
    }
  });

  return refs;
};

