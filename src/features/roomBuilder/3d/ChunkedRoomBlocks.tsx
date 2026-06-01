import React, { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useStore } from '../../../store/useStore';
import { PlasticMaterial } from '../../../components/3d/materials/PlasticMaterial';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const CHUNK_SIZE = 16;

const getStampColor = (type: string, x: number = 0, y: number = 0, z: number = 0) => {
  let baseColorStr = '#ffffff';
  switch(type) {
    case 'block_grass': baseColorStr = '#4ade80'; break;
    case 'block_dirt': baseColorStr = '#78350f'; break;
    case 'block_stone': baseColorStr = '#94a3b8'; break;
    case 'block_wood': baseColorStr = '#b45309'; break;
    case 'block_brick': baseColorStr = '#dc2626'; break;
    case 'trigger_jump': baseColorStr = '#facc15'; break;
    case 'trigger_speed': baseColorStr = '#0ea5e9'; break;
    case 'trigger_checkpoint': baseColorStr = '#ec4899'; break;
    case 'trigger_kill': baseColorStr = '#ef4444'; break;
    case 'block_light': baseColorStr = '#fef08a'; break;
  }
  
  // Simple spatial noise for variation
  const hash = Math.sin(x*12.9898 + y*78.233 + z*37.719) * 43758.5453;
  const rand = hash - Math.floor(hash);
  
  // Convert hex to HSL, tweak L, back to hex
  const c = new THREE.Color(baseColorStr);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  
  // Tweak lightness by +/- 8%
  hsl.l += (rand - 0.5) * 0.16;
  hsl.l = Math.max(0, Math.min(1, hsl.l));
  
  c.setHSL(hsl.h, hsl.s, hsl.l);
  return '#' + c.getHexString();
};

const Chunk = React.memo(({ chunkId, blocks, onPointerDown, onPointerMove }: { chunkId: string, blocks: any[], onPointerDown: (e: ThreeEvent<PointerEvent>, objectId: string) => void, onPointerMove?: (e: ThreeEvent<PointerEvent>, objectId: string) => void }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorObj = useMemo(() => new THREE.Color(), []);
  
  const instancesCount = 16384; // Maximum allowed blocks per chunk
  const args = useMemo(() => [undefined, undefined, instancesCount] as any, []);

  const [lod, setLod] = useState<'near'|'far'>('near');
  const [mergedGeometry, setMergedGeometry] = useState<THREE.BufferGeometry | null>(null);

  // Compute center of chunk for LOD distance check
  const chunkCenter = useMemo(() => {
    const [cx, cz] = chunkId.split('_').map(Number);
    return new THREE.Vector3(cx * CHUNK_SIZE + CHUNK_SIZE/2, 0, cz * CHUNK_SIZE + CHUNK_SIZE/2);
  }, [chunkId]);

  const isNearRef = useRef(true);
  const lastCheckTime = useRef(0);

  useFrame(({ camera, clock }) => {
    if (clock.elapsedTime - lastCheckTime.current > 0.5) {
      lastCheckTime.current = clock.elapsedTime;
      // Determine near (interactive) vs far (decorative)
      const dist = camera.position.distanceTo(chunkCenter);
      const shouldBeNear = dist < 200; // 200 units threshold
      if (shouldBeNear !== isNearRef.current) {
        isNearRef.current = shouldBeNear;
        setLod(shouldBeNear ? 'near' : 'far');
      }
    }
  });

  const prevBlocksRef = useRef<any[]>(blocks);

  useEffect(() => {
    // 1. Асинхронно билдим InstancedMesh для ближней зоны
    const buildChunk = () => {
      if (!meshRef.current) return;
      
      const prevBlocks = prevBlocksRef.current;
      const prevCount = prevBlocks.length;
      const count = Math.min(blocks.length, instancesCount);

      let incremental = false;
      if (count > prevCount && count - prevCount <= 20) {
        let same = true;
        for (let i = 0; i < prevCount; i++) {
            if (prevBlocks[i].id !== blocks[i].id) {
                same = false; break;
            }
        }
        if (same) incremental = true;
      }

      const startIndex = incremental ? prevCount : 0;

      for (let i = startIndex; i < count; i++) {
        const obj = blocks[i];
        dummy.position.set(obj.position[0], obj.position[1], obj.position[2]);
        dummy.rotation.set(obj.rotation[0], obj.rotation[1], obj.rotation[2]);
        dummy.scale.set(obj.scale[0], obj.scale[1], obj.scale[2]);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);

        colorObj.set(getStampColor(obj.type, obj.position[0], obj.position[1], obj.position[2]));
        meshRef.current!.setColorAt(i, colorObj);
      }
      
      if (count !== prevCount || !incremental) {
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) {
          meshRef.current.instanceColor.needsUpdate = true;
        }
        meshRef.current.computeBoundingSphere();
      }
      
      prevBlocksRef.current = blocks;
    };

    if ('requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(buildChunk, { timeout: 200 });
      return () => (window as any).cancelIdleCallback(handle);
    } else {
      const handle = setTimeout(buildChunk, 0);
      return () => clearTimeout(handle);
    }
  }, [blocks, dummy, colorObj]);

  useEffect(() => {
    // 2. Асинхронно склеиваем BufferGeometry для LOD "far", если перешли в дальнюю зону
    if (lod === 'far' && !mergedGeometry && blocks.length > 0) {
      let cancelled = false;

      const buildMergedGeometryFast = () => {
        let index = 0;
        const geometries: THREE.BufferGeometry[] = [];
        const baseBox = new THREE.BoxGeometry(1,1,1);
        const matrix = new THREE.Matrix4();
        const c = new THREE.Color();
        const pos = new THREE.Vector3();
        const scale = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        const euler = new THREE.Euler();

        // Мы разбиваем цикл на порции (batching), чтобы не лочить главный поток игры (асинхронная сборка)
        const processBatch = () => {
          if (cancelled) return;
          const endTime = performance.now() + 5; // 5ms per frame budget

          while(index < blocks.length && performance.now() < endTime) {
            const obj = blocks[index];
            const geo = baseBox.clone();
            
            pos.set(obj.position[0], obj.position[1], obj.position[2]);
            euler.set(obj.rotation[0], obj.rotation[1], obj.rotation[2]);
            quat.setFromEuler(euler);
            scale.set(obj.scale[0], obj.scale[1], obj.scale[2]);
            
            matrix.compose(pos, quat, scale);
            geo.applyMatrix4(matrix);
            
            c.set(getStampColor(obj.type, obj.position[0], obj.position[1], obj.position[2]));
            const colorArray = new Float32Array(geo.attributes.position.count * 3);
            for (let i = 0; i < colorArray.length; i+=3) {
              colorArray[i] = c.r; colorArray[i+1] = c.g; colorArray[i+2] = c.b;
            }
            geo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
            
            geometries.push(geo);
            index++;
          }
          
          if (index < blocks.length) {
            requestAnimationFrame(processBatch);
          } else {
            if (geometries.length > 0) {
              // Склеиваем всё в один "смержившийся" кусок, как в трушных движках!
              const merged = BufferGeometryUtils.mergeGeometries(geometries, false);
              setMergedGeometry(merged);
            }
          }
        };
        
        requestAnimationFrame(processBatch);
      };

      buildMergedGeometryFast();

      return () => { cancelled = true; };
    }
  }, [lod, blocks, mergedGeometry]);

  return (
    <group name="chunked-blocks">
      <instancedMesh
        ref={meshRef}
        args={args}
        count={Math.min(blocks.length, instancesCount)}
        castShadow
        receiveShadow
        visible={lod === 'near'}
        onPointerDown={(e) => {
          if (lod === 'near' && e.instanceId !== undefined) {
            const obj = blocks[e.instanceId];
            if (obj) {
              onPointerDown(e, obj.id);
            }
          }
        }}
        onPointerMove={(e) => {
          if (lod === 'near' && e.instanceId !== undefined && onPointerMove) {
            const obj = blocks[e.instanceId];
            if (obj) {
              onPointerMove(e, obj.id);
            }
          }
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <PlasticMaterial color="#ffffff" hasBlockOutline={true} outlineThickness={0} />
      </instancedMesh>

      {/* Дальняя зона LOD */}
      {lod === 'far' && mergedGeometry && (
        <mesh geometry={mergedGeometry} castShadow receiveShadow>
          <PlasticMaterial color="#ffffff" hasBlockOutline={false} outlineThickness={0} vertexColors={true} />
        </mesh>
      )}
    </group>
  );
});

export const ChunkedRoomBlocks = ({ onBlockPointerDown, onBlockPointerMove }: { onBlockPointerDown: (e: ThreeEvent<PointerEvent>, objectId: string) => void, onBlockPointerMove?: (e: ThreeEvent<PointerEvent>, objectId: string) => void }) => {
  const roomChunks = useStore(state => state.roomChunks);
  
  // Keep previous chunks and block references to prevent full re-render on Chunk
  const prevChunksRef = useRef(new Map<string, any[]>());

  const chunks = useMemo(() => {
    const prevMap = prevChunksRef.current;
    const finalMap = new Map<string, any[]>();
    
    Object.entries(roomChunks || {}).forEach(([chunkId, newBlocks]) => {
      const oldBlocks = prevMap.get(chunkId);
      let isSame = false;
      if (oldBlocks && oldBlocks.length === newBlocks.length) {
        isSame = true;
        for (let j = 0; j < newBlocks.length; j++) {
           if (oldBlocks[j].id !== newBlocks[j].id || 
               oldBlocks[j].position[0] !== newBlocks[j].position[0] ||
               oldBlocks[j].position[1] !== newBlocks[j].position[1] ||
               oldBlocks[j].position[2] !== newBlocks[j].position[2]) {
               isSame = false;
               break;
           }
        }
      }
      finalMap.set(chunkId, isSame ? oldBlocks! : newBlocks);
    });

    prevChunksRef.current = finalMap;
    return finalMap;
  }, [roomChunks]);
  
  const chunkEntries = Array.from(chunks.entries());

  return (
    <group name="room-blocks">
      {chunkEntries.map(([chunkId, blocks]) => (
        <Chunk key={chunkId} chunkId={chunkId} blocks={blocks} onPointerDown={onBlockPointerDown} onPointerMove={onBlockPointerMove} />
      ))}
    </group>
  );
};
