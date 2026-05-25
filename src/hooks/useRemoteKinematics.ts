import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CharacterRefs, applyBones, applyCrouching } from '../kinematics/shared';
import { remoteState } from '../lib/multiplayerState';
import { defaultDevSettings } from '../store/defaults';

const INTERPOLATION_DELAY = 100; // ms

export const useRemoteKinematics = (playerId: string) => {
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

  useFrame((state, delta) => {
    if (!refs.characterGroupRef.current || !refs.visualGroupRef.current) return;
    
    const buffer = remoteState.playerBuffers.get(playerId);
    let position = new THREE.Vector3();
    let rotation = 0;
    let animation = { isMoving: false, leftHipX: 0, leftKneeX: 0, rightHipX: 0, rightKneeX: 0, leftShoulderX: 0, leftElbowX: 0, rightShoulderX: 0, rightElbowX: 0, isCrouching: false };
    let currentDevSettings = { ...defaultDevSettings };

    if (!buffer || buffer.length === 0) {
      // Fallback
      const p = remoteState.players.get(playerId);
      if (p) {
        position.set(p.position.x, p.position.y, p.position.z);
        rotation = p.rotation;
        if (p.animation) animation = p.animation;
      }
    } else {
      const renderTime = performance.now() - INTERPOLATION_DELAY;
      
      let snap0 = buffer[0];
      let snap1 = buffer[0];

      for (let i = buffer.length - 1; i >= 0; i--) {
        if (buffer[i].t <= renderTime) {
          snap0 = buffer[i];
          snap1 = buffer[i + 1] || snap0;
          break;
        }
      }

      if (renderTime < buffer[0].t) {
        snap0 = buffer[0];
        snap1 = buffer[0];
      }
      
      if (renderTime > buffer[buffer.length - 1].t) {
        snap0 = buffer[buffer.length - 1];
        snap1 = buffer[buffer.length - 1];
      }

      let alpha = 0;
      if (snap1.t !== snap0.t) {
        alpha = (renderTime - snap0.t) / (snap1.t - snap0.t);
      }
      
      position.set(
        THREE.MathUtils.lerp(snap0.position.x, snap1.position.x, alpha),
        THREE.MathUtils.lerp(snap0.position.y, snap1.position.y, alpha),
        THREE.MathUtils.lerp(snap0.position.z, snap1.position.z, alpha)
      );

      const r0 = snap0.rotation;
      let r1 = snap1.rotation;
      let diff = r1 - r0;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      r1 = r0 + diff;
      
      rotation = THREE.MathUtils.lerp(r0, r1, alpha);
      
      // Animations are generally snapshot-based or we could interpolate them too. 
      // Lerping animation angles for ultra-smooth rendering.
      const anim0 = snap0.animation || animation;
      const anim1 = snap1.animation || animation;
      
      const lerpAnim = (key: keyof typeof animation) => {
        if (typeof anim0[key] === 'number' && typeof anim1[key] === 'number') {
            return THREE.MathUtils.lerp(anim0[key] as number, anim1[key] as number, alpha);
        }
        return alpha < 0.5 ? anim0[key] : anim1[key]; // boolean or fallback
      };
      
      animation = {
          isMoving: alpha < 0.5 ? anim0.isMoving : anim1.isMoving,
          isCrouching: alpha < 0.5 ? anim0.isCrouching : anim1.isCrouching,
          leftHipX: lerpAnim('leftHipX') as number,
          leftKneeX: lerpAnim('leftKneeX') as number,
          rightHipX: lerpAnim('rightHipX') as number,
          rightKneeX: lerpAnim('rightKneeX') as number,
          leftShoulderX: lerpAnim('leftShoulderX') as number,
          leftElbowX: lerpAnim('leftElbowX') as number,
          rightShoulderX: lerpAnim('rightShoulderX') as number,
          rightElbowX: lerpAnim('rightElbowX') as number,
      };
      
      // Interpolate DevSettings for ultra smooth dances
      const dev0 = snap0.devSettings || defaultDevSettings;
      const dev1 = snap1.devSettings || defaultDevSettings;
      
      const lerpDev = (key: keyof typeof defaultDevSettings) => {
         if (typeof dev0[key] === 'number' && typeof dev1[key] === 'number') {
            return THREE.MathUtils.lerp(dev0[key] as number, dev1[key] as number, alpha);
         }
         return alpha < 0.5 ? dev0[key] : dev1[key];
      };
      
      // Assume all props are numbers for bones
      currentDevSettings = {} as any;
      for (const key in defaultDevSettings) {
         currentDevSettings[key as keyof typeof defaultDevSettings] = lerpDev(key as any) as never;
      }
    }

    refs.characterGroupRef.current.position.copy(position);
    refs.visualGroupRef.current.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotation);

    const safeDelta = isNaN(delta) ? 0 : Math.max(0, delta);
    const dt = Math.min(safeDelta, 0.1);

    // Apply generic procedural overrides (walking)
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

    refs.crouchFactorRef.current = THREE.MathUtils.lerp(refs.crouchFactorRef.current, animation.isCrouching ? 1 : 0, 15 * dt);
    applyCrouching(refs, currentDevSettings, refs.crouchFactorRef.current);
  });

  return refs;
};
