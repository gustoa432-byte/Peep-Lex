import React, { useRef, useMemo, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { remoteState } from '../../lib/multiplayerState';
import { AssetManager } from '../../managers/AssetManager';

const _tPos = new THREE.Vector3();
const _tQuat = new THREE.Quaternion();
const dummy = new THREE.Object3D();
const tempColor = new THREE.Color();
const PLASTIC_COLORS = ['#3b82f6', '#eab308', '#ef4444', '#a855f7', '#10b981', '#f97316', '#ffffff'];

export const MultiplayerPhysicsObjects = () => {
  const allObjects = useStore(state => state.physicsObjects);
  const appMode = useStore(state => state.appMode);
  const physicsObjects = useMemo(() => allObjects.filter(o => o.type !== 'projectile'), [allObjects]);
  const projectiles = useMemo(() => allObjects.filter(o => o.type === 'projectile'), [allObjects]);

  const splatTex = useMemo(() => AssetManager.getTexture('t-splat'), []);

  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const outlineMeshRef = useRef<THREE.InstancedMesh>(null);
  const projMeshRef = useRef<THREE.InstancedMesh>(null);
  const splatMeshRef = useRef<THREE.InstancedMesh>(null);
  
  const prevData = useRef<{ [id: string]: { pos: THREE.Vector3, quat: THREE.Quaternion, settled: boolean } }>({});

  // Generate colors deterministically
  const colorArray = useMemo(() => {
    if (physicsObjects.length === 0) return null;
    const array = new Float32Array(physicsObjects.length * 3);
    for (let i = 0; i < physicsObjects.length; i++) {
        tempColor.set(PLASTIC_COLORS[i % PLASTIC_COLORS.length]);
        array[i * 3] = tempColor.r;
        array[i * 3 + 1] = tempColor.g;
        array[i * 3 + 2] = tempColor.b;
    }
    return array;
  }, [physicsObjects.length]);

  const projColorArray = useMemo(() => {
    if (projectiles.length === 0) return null;
    const array = new Float32Array(projectiles.length * 3);
    for (let i = 0; i < projectiles.length; i++) {
        const obj = projectiles[i];
        const numId = parseInt(obj.id.split('_')[1] || "0");
        const hash = Math.abs(Math.sin(numId) * 10000);
        const hue = (hash - Math.floor(hash));
        tempColor.setHSL(hue, 0.9, 0.5);
        array[i * 3] = tempColor.r;
        array[i * 3 + 1] = tempColor.g;
        array[i * 3 + 2] = tempColor.b;
    }
    return array;
  }, [projectiles]);

  useEffect(() => {
    if (instancedMeshRef.current && colorArray) {
        instancedMeshRef.current.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colorArray, 3));
    }
  }, [colorArray]);

  useEffect(() => {
    if (projMeshRef.current && projColorArray) {
        projMeshRef.current.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(projColorArray, 3));
    }
    if (splatMeshRef.current && projColorArray) {
        splatMeshRef.current.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(projColorArray, 3));
    }
  }, [projColorArray]);

  useFrame(() => {
    let needsUpdateBoxes = false;
    let needsUpdateProj = false;

    // Update Boxes
    if (instancedMeshRef.current && outlineMeshRef.current && physicsObjects.length > 0) {
      for (let i = 0; i < physicsObjects.length; i++) {
          const obj = physicsObjects[i];
          const state = remoteState.physics.get(obj.id);
          
          let prev = prevData.current[obj.id];
          if (!prev) {
              prev = { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), settled: false };
              if (state) {
                  prev.pos.set(state.position.x, state.position.y, state.position.z);
                  prev.quat.set(state.rotation.x, state.rotation.y, state.rotation.z, state.rotation.w);
              }
              prevData.current[obj.id] = prev;
          }

          if (state) {
              _tPos.set(state.position.x, state.position.y, state.position.z);
              _tQuat.set(state.rotation.x, state.rotation.y, state.rotation.z, state.rotation.w);

              const distSq = prev.pos.distanceToSquared(_tPos);
              const angle = prev.quat.angleTo(_tQuat);
              
              if (distSq > 0.00001 || angle > 0.005) {
                  prev.pos.lerp(_tPos, 0.3);
                  prev.quat.slerp(_tQuat, 0.3);
              } else {
                  prev.pos.copy(_tPos);
                  prev.quat.copy(_tQuat);
              }
              
              dummy.position.copy(prev.pos);
              dummy.quaternion.copy(prev.quat);
              dummy.scale.set(1, 1, 1);
              dummy.updateMatrix();
              instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
              outlineMeshRef.current.setMatrixAt(i, dummy.matrix);
              needsUpdateBoxes = true;
          }
      }
      instancedMeshRef.current.count = physicsObjects.length;
      outlineMeshRef.current.count = physicsObjects.length;
      if (needsUpdateBoxes) {
          instancedMeshRef.current.instanceMatrix.needsUpdate = true;
          outlineMeshRef.current.instanceMatrix.needsUpdate = true;
      }
    }

    // Update Projectiles
    if (projMeshRef.current && projectiles.length > 0) {
      let needsUpdateProj = false;
      for (let i = 0; i < projectiles.length; i++) {
          const obj = projectiles[i];
          const state = remoteState.physics.get(obj.id);
          
          let prev = prevData.current[obj.id];
          if (!prev) {
              prev = { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), settled: false };
              if (state) {
                  prev.pos.set(state.position.x, state.position.y, state.position.z);
                  prev.quat.set(state.rotation.x, state.rotation.y, state.rotation.z, state.rotation.w);
              }
              prevData.current[obj.id] = prev;
          }

          if (state) {
              _tPos.set(state.position.x, state.position.y, state.position.z);
              _tQuat.set(state.rotation.x, state.rotation.y, state.rotation.z, state.rotation.w);

              const distSq = prev.pos.distanceToSquared(_tPos);
              const angle = prev.quat.angleTo(_tQuat);
              
              const isSplattered = state.splattered === true;
              
              if (distSq > 0.00001 || angle > 0.005) {
                  prev.pos.lerp(_tPos, 0.3);
                  prev.quat.slerp(_tQuat, 0.3);
              } else {
                  prev.pos.copy(_tPos);
                  prev.quat.copy(_tQuat);
              }
              
              // Update projectile mesh
              dummy.position.copy(prev.pos);
              dummy.quaternion.copy(prev.quat);
              dummy.scale.setScalar(isSplattered ? 0.0001 : 1);
              dummy.updateMatrix();
              projMeshRef.current.setMatrixAt(i, dummy.matrix);
              
              // Update splat mesh
              if (splatMeshRef.current) {
                  dummy.position.copy(prev.pos);
                  // server aligns +Y with normal. PlaneGeometry points +Z.
                  // Fix: rotate local -90x so +Z aligns with +Y
                  const planeFix = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), -Math.PI/2);
                  const roll = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1), (parseInt(obj.id.split('_')[1] || "0") * 2.34));
                  dummy.quaternion.copy(prev.quat).multiply(planeFix).multiply(roll);
                  dummy.scale.setScalar(isSplattered ? 2.5 : 0.0001);
                  dummy.updateMatrix();
                  splatMeshRef.current.setMatrixAt(i, dummy.matrix);
              }
              needsUpdateProj = true;
          }
      }
      projMeshRef.current.count = projectiles.length;
      if (splatMeshRef.current) splatMeshRef.current.count = projectiles.length;
      if (needsUpdateProj) {
          projMeshRef.current.instanceMatrix.needsUpdate = true;
          if (splatMeshRef.current) splatMeshRef.current.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <>
      <instancedMesh
        ref={outlineMeshRef}
        args={[null as any, null as any, 1000]}
        frustumCulled={false}
        count={physicsObjects.length}
      >
        <boxGeometry args={[10.0, 10.0, 10.0]} />
        <meshBasicMaterial color="#000000" side={THREE.BackSide} />
      </instancedMesh>

      <instancedMesh 
        ref={instancedMeshRef} 
        args={[null as any, null as any, 1000]} 
        count={physicsObjects.length}
        castShadow 
        receiveShadow
        frustumCulled={false}
      >
        <boxGeometry args={[9.4, 9.4, 9.4]} />
        <meshStandardMaterial vertexColors roughness={0.4} metalness={0.1} />
      </instancedMesh>

      <instancedMesh 
        ref={projMeshRef}
        args={[null as any, null as any, 500]} 
        count={projectiles.length}
        castShadow 
        receiveShadow
        frustumCulled={false}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial vertexColors roughness={0.7} metalness={0} color="#FFFFFF" />
      </instancedMesh>
      
      <instancedMesh
        ref={splatMeshRef}
        args={[null as any, null as any, 500]}
        count={projectiles.length}
        frustumCulled={false}
        receiveShadow
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial 
          map={splatTex} 
          transparent 
          depthWrite={false}
          vertexColors
          roughness={0.9} 
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </instancedMesh>
    </>
  );
};

