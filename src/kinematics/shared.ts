import * as THREE from 'three';
import { useStore } from '../store/useStore';

export const safeNum = (val: any, fallback: number = 0) => {
  const num = Number(val);
  return isNaN(num) ? fallback : num;
};

export interface CharacterRefs {
  characterGroupRef: React.MutableRefObject<THREE.Group | null>;
  visualGroupRef: React.MutableRefObject<THREE.Group | null>;
  crouchGroupRef: React.MutableRefObject<THREE.Group | null>;
  spineRef: React.MutableRefObject<THREE.Group | null>;
  neckRef: React.MutableRefObject<THREE.Group | null>;
  leftShoulderRef: React.MutableRefObject<THREE.Group | null>;
  rightShoulderRef: React.MutableRefObject<THREE.Group | null>;
  leftElbowRef: React.MutableRefObject<THREE.Group | null>;
  rightElbowRef: React.MutableRefObject<THREE.Group | null>;
  leftWristRef: React.MutableRefObject<THREE.Group | null>;
  rightWristRef: React.MutableRefObject<THREE.Group | null>;
  leftHipRef: React.MutableRefObject<THREE.Group | null>;
  rightHipRef: React.MutableRefObject<THREE.Group | null>;
  leftKneeRef: React.MutableRefObject<THREE.Group | null>;
  rightKneeRef: React.MutableRefObject<THREE.Group | null>;
  crouchFactorRef: React.MutableRefObject<number>;
}

export const applyBones = (refs: CharacterRefs, devSettings: any, overrides: any = {}) => {
  if (refs.spineRef.current) refs.spineRef.current.rotation.set(safeNum(devSettings.spineAngleX) + (overrides.spineX || 0), safeNum(devSettings.spineAngleY), safeNum(devSettings.spineAngleZ));
  if (refs.neckRef.current) refs.neckRef.current.rotation.set(safeNum(devSettings.neckAngleX) + (overrides.neckX || 0), safeNum(devSettings.neckAngleY), safeNum(devSettings.neckAngleZ));
  
  if (refs.leftShoulderRef.current) refs.leftShoulderRef.current.rotation.set(safeNum(devSettings.leftShoulderAngleX) + (overrides.leftShoulderX || 0), safeNum(devSettings.leftShoulderAngleY), safeNum(devSettings.leftShoulderAngleZ));
  if (refs.rightShoulderRef.current) refs.rightShoulderRef.current.rotation.set(safeNum(devSettings.rightShoulderAngleX) + (overrides.rightShoulderX || 0), safeNum(devSettings.rightShoulderAngleY), safeNum(devSettings.rightShoulderAngleZ));
  
  if (refs.leftElbowRef.current) refs.leftElbowRef.current.rotation.set(safeNum(devSettings.leftElbowAngleX) + (overrides.leftElbowX || 0), safeNum(devSettings.leftElbowAngleY), safeNum(devSettings.leftElbowAngleZ));
  if (refs.rightElbowRef.current) refs.rightElbowRef.current.rotation.set(safeNum(devSettings.rightElbowAngleX) + (overrides.rightElbowX || 0), safeNum(devSettings.rightElbowAngleY), safeNum(devSettings.rightElbowAngleZ));
  
  if (refs.leftWristRef.current) refs.leftWristRef.current.rotation.set(safeNum(devSettings.leftWristAngleX), safeNum(devSettings.leftWristAngleY), safeNum(devSettings.leftWristAngleZ));
  if (refs.rightWristRef.current) refs.rightWristRef.current.rotation.set(safeNum(devSettings.rightWristAngleX), safeNum(devSettings.rightWristAngleY), safeNum(devSettings.rightWristAngleZ));
  
  if (refs.leftHipRef.current) refs.leftHipRef.current.rotation.set(safeNum(devSettings.leftHipAngleX) + (overrides.leftHipX || 0), safeNum(devSettings.leftHipAngleY), safeNum(devSettings.leftHipAngleZ));
  if (refs.rightHipRef.current) refs.rightHipRef.current.rotation.set(safeNum(devSettings.rightHipAngleX) + (overrides.rightHipX || 0), safeNum(devSettings.rightHipAngleY), safeNum(devSettings.rightHipAngleZ));
  
  if (refs.leftKneeRef.current) refs.leftKneeRef.current.rotation.set(safeNum(devSettings.leftKneeAngleX) + (overrides.leftKneeX || 0), safeNum(devSettings.leftKneeAngleY), safeNum(devSettings.leftKneeAngleZ));
  if (refs.rightKneeRef.current) refs.rightKneeRef.current.rotation.set(safeNum(devSettings.rightKneeAngleX) + (overrides.rightKneeX || 0), safeNum(devSettings.rightKneeAngleY), safeNum(devSettings.rightKneeAngleZ));
};

export const applyCrouching = (refs: CharacterRefs, devSettings: any, crouchFactor: number) => {
  if (!refs.crouchGroupRef.current) return;
  const { characterConfig } = useStore.getState();
  const legLength = characterConfig.legLength ?? 1.3;
  const legThickness = characterConfig.legThickness ?? 0.28;
  const hipSpread = characterConfig.hipSpread ?? 0.35;
  const torsoLength = characterConfig.torsoLength ?? 1.4;
  const torsoRadius = characterConfig.torsoRadius ?? 0.75;
  const hipY = -torsoLength / 2 - torsoRadius * 0.5;

  const getLegLowestPoint = (kneeX: number, kneeY: number, kneeZ: number, hipX: number, hipYRot: number, hipZ: number, isLeft: boolean) => {
    const shoeCenter = new THREE.Vector3(0, -legLength - legThickness * 0.8, 0);
    shoeCenter.applyEuler(new THREE.Euler(kneeX, kneeY, kneeZ));
    shoeCenter.add(new THREE.Vector3(0, -legLength, 0));
    shoeCenter.applyEuler(new THREE.Euler(hipX, hipYRot, hipZ));
    shoeCenter.add(new THREE.Vector3(isLeft ? -hipSpread : hipSpread, hipY, 0));
    // The shoe is a vertical cylinder of height legThickness * 0.6.
    // So its bottom is at y - (legThickness * 0.3) roughly (ignoring rotation tilt)
    return shoeCenter.y - (legThickness * 0.3);
  };

  const leftKneeX = safeNum(devSettings.leftKneeAngleX);
  const leftKneeY = safeNum(devSettings.leftKneeAngleY);
  const leftKneeZ = safeNum(devSettings.leftKneeAngleZ);
  const leftHipX = safeNum(devSettings.leftHipAngleX);
  const leftHipY = safeNum(devSettings.leftHipAngleY);
  const leftHipZ = safeNum(devSettings.leftHipAngleZ);

  const rightKneeX = safeNum(devSettings.rightKneeAngleX);
  const rightKneeY = safeNum(devSettings.rightKneeAngleY);
  const rightKneeZ = safeNum(devSettings.rightKneeAngleZ);
  const rightHipX = safeNum(devSettings.rightHipAngleX);
  const rightHipY = safeNum(devSettings.rightHipAngleY);
  const rightHipZ = safeNum(devSettings.rightHipAngleZ);

  let leftLowest = getLegLowestPoint(leftKneeX, leftKneeY, leftKneeZ, leftHipX, leftHipY, leftHipZ, true);
  let rightLowest = getLegLowestPoint(rightKneeX, rightKneeY, rightKneeZ, rightHipX, rightHipY, rightHipZ, false);
  
  if (isNaN(leftLowest)) leftLowest = -legLength * 2;
  if (isNaN(rightLowest)) rightLowest = -legLength * 2;

  const lowestPoint = Math.min(leftLowest, rightLowest);
  const legOffset = Math.abs(lowestPoint);

  const currentScaleY = 1 - crouchFactor * 0.4;
  const squashX = 1 + crouchFactor * 0.2;
  const squashZ = 1 + crouchFactor * 0.2;
  const crouchYOffset = legOffset * currentScaleY;

  refs.crouchGroupRef.current.position.y = crouchYOffset;
  refs.crouchGroupRef.current.scale.set(squashX, currentScaleY, squashZ);
};

