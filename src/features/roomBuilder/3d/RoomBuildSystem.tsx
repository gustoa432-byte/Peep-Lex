import React, { useCallback, useState, useRef } from 'react';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../../store/useStore';
import { ChunkedRoomBlocks } from './ChunkedRoomBlocks';
import { PlasticMaterial } from '../../../components/3d/materials/PlasticMaterial';
import { BackgroundVideoProjector } from '../../../components/3d/BackgroundVideoProjector';

const generateId = () => Math.random().toString(36).substring(2, 9);

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
    const hash = Math.sin(x*12.9898 + y*78.233 + z*37.719) * 43758.5453;
    const rand = hash - Math.floor(hash);
    const c = new THREE.Color(baseColorStr);
    const hsl = { h: 0, s: 0, l: 0 };
    c.getHSL(hsl);
    hsl.l += (rand - 0.5) * 0.16;
    hsl.l = Math.max(0, Math.min(1, hsl.l));
    c.setHSL(hsl.h, hsl.s, hsl.l);
    return '#' + c.getHexString();
};

export const RoomBuildSystem: React.FC<{ onPodiumDragStart?: (e: ThreeEvent<PointerEvent>) => void }> = ({ onPodiumDragStart }) => {
  const { camera, scene } = useThree();
  const appMode = useStore(state => state.appMode);
  const roomEditorMode = useStore(state => state.roomEditorMode);
  const roomSelectedTool = useStore(state => state.roomSelectedTool);
  const roomSelectedStamp = useStore(state => state.roomSelectedStamp);
  const roomBlockSize = useStore(state => state.roomBlockSize);
  const buildLayer = useStore(state => state.buildLayer);
  const setPodiumPosition = useStore(state => state.setPodiumPosition);
  const podiumPosition = useStore(state => state.podiumPosition);
  const setRoomBlockSize = useStore(state => state.setRoomBlockSize);
  const setRoomSelectedStamp = useStore(state => state.setRoomSelectedStamp);
  
  const brushShape = useStore(state => state.brushShape);
  const brushHeight = useStore(state => state.brushHeight);

  React.useEffect(() => {
    const objects = useStore.getState().roomObjects;
    let needsMigration = false;
    const migratedObjects = objects.map(o => {
      // Migrate old cubes which were built centered on even Y integers (-2, 0, 2) 
      // instead of the new grid centered on odd Y integers (-1, 1, 3) relative to the -2.0 floor.
      if (Math.abs(o.position[1] % 2) < 0.1 || Math.abs(o.position[1] % 2) > 1.9) {
        needsMigration = true;
        return { 
          ...o, 
          position: [o.position[0], o.position[1] + 1, o.position[2]] as [number, number, number] 
        };
      }
      return o;
    });

    if (needsMigration) {
      useStore.getState().setRoomObjects(migratedObjects);
      useStore.getState().commitRoomEditorHistory();
    }
  }, []);

  React.useEffect(() => {
    const handlePointerUp = () => {
      // Always commit history on any pointer up just to be safe with continuous erasing
      if (useStore.getState().roomSelectedTool === 'eraser' && useStore.getState().roomEditorMode === 'build') {
        if (useStore.getState().isErasing) {
          useStore.getState().commitRoomEditorHistory();
          useStore.getState().setIsErasing(false);
          useStore.getState().setIsBuildingActive(false);
        }
      }
      if (useStore.getState().isBuildingActive) {
          useStore.getState().setIsBuildingActive(false);
      }
    };
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, []);

  React.useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const state = useStore.getState();
      if (state.appMode !== 'roomEditor') return;
      if (state.roomEditorMode !== 'build' && state.roomEditorMode !== 'voxel') return;
      
      const sizes = [1, 2, 4];
      const currentSize = state.roomBlockSize;
      const currentIndex = sizes.indexOf(currentSize);
      
      if (e.deltaY < 0) {
        // Scroll up -> bigger
        const nextIndex = Math.min(sizes.length - 1, currentIndex + 1);
        if (nextIndex !== currentIndex) state.setRoomBlockSize(sizes[nextIndex]);
      } else if (e.deltaY > 0) {
        // Scroll down -> smaller
        const nextIndex = Math.max(0, currentIndex - 1);
        if (nextIndex !== currentIndex) state.setRoomBlockSize(sizes[nextIndex]);
      }
    };
    
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  const [dragState, setDragState] = useState<{ target: string, offset: THREE.Vector3 } | null>(null);
  const [grabPreviewPos, setGrabPreviewPos] = useState<THREE.Vector3 | null>(null);
  const grabbedBlock = useStore(state => state.grabbedBlock);
  
  const [buildPreview, setBuildPreview] = useState<{
    start: THREE.Vector3;
    end: THREE.Vector3;
    size: number;
    points: [number, number, number][];
  } | null>(null);

  const textGroupRef = useRef<THREE.Mesh>(null);
  const [isHoveredPodium, setIsHoveredPodium] = useState(false);

  const backgroundVideoUrl = useStore(state => state.backgroundVideoUrl);
  const isPlayingLoops = useStore(state => state.isPlayingLoops);
  const showVideo = !!backgroundVideoUrl && isPlayingLoops;

  useFrame((state, delta) => {
    if (document.pointerLockElement) {
      state.pointer.set(0, 0);
    }
    if (textGroupRef.current) {
      textGroupRef.current.rotation.y += delta * 0.2;
    }
  });

  const buildY = -2.0 + buildLayer * 2;

  useCursor(roomEditorMode === 'move' && isHoveredPodium, 'grab', 'auto');
  useCursor(!!dragState, 'grabbing', 'auto');

  const getSnappedPos = (point: THREE.Vector3, normal: THREE.Vector3, size: number) => {
    const exactPos = point.clone().add(normal.clone().multiplyScalar(size / 2));
    
    const exactMin = new THREE.Vector3(
      exactPos.x - size / 2,
      exactPos.y - size / 2,
      exactPos.z - size / 2
    );

    const snappedMin = new THREE.Vector3(
      Math.round(exactMin.x / size) * size,
      Math.round(exactMin.y / size) * size,
      Math.round(exactMin.z / size) * size
    );

    return {
      x: snappedMin.x + size / 2,
      y: snappedMin.y + size / 2,
      z: snappedMin.z + size / 2
    };
  };

  const snapToGridCenter = (val: number, size: number) => {
    const min = val - size / 2;
    const snappedMin = Math.round(min);
    return snappedMin + size / 2;
  };

  const isIntersecting = (x: number, y: number, z: number, size: number) => {
    const hS = size / 2;
    return useStore.getState().roomObjects.some(o => {
      const eS = o.scale[0] / 2;
      return Math.abs(x - o.position[0]) < hS + eS - 0.01 &&
             Math.abs(y - o.position[1]) < hS + eS - 0.01 &&
             Math.abs(z - o.position[2]) < hS + eS - 0.01;
    });
  };

  const computePreviewBlocks = useCallback((start: THREE.Vector3, end: THREE.Vector3, size: number) => {
    const pts: [number, number, number][] = [];
    
    if (brushShape === 'point') {
      const x = snapToGridCenter(end.x, size);
      const z = snapToGridCenter(end.z, size);
      for (let currentY = 0; currentY < brushHeight; currentY++) {
        const y = start.y + currentY * size;
        pts.push([x, y, z]);
      }
      return pts;
    }

    if (brushShape === 'rect') {
      const minStart = new THREE.Vector3(snapToGridCenter(start.x, size), start.y, snapToGridCenter(start.z, size));
      const minEnd = new THREE.Vector3(snapToGridCenter(end.x, size), start.y, snapToGridCenter(end.z, size));
      
      const minX = Math.min(minStart.x, minEnd.x);
      const maxX = Math.max(minStart.x, minEnd.x);
      const minZ = Math.min(minStart.z, minEnd.z);
      const maxZ = Math.max(minStart.z, minEnd.z);

      for (let currentY = 0; currentY < brushHeight; currentY++) {
        const y = start.y + currentY * size;
        for (let x = minX; x <= maxX + 0.1; x += size) {
          for (let z = minZ; z <= maxZ + 0.1; z += size) {
            pts.push([x, y, z]);
          }
        }
      }
      return pts;
    }

    if (brushShape === 'box') {
      const minStart = new THREE.Vector3(snapToGridCenter(start.x, size), start.y, snapToGridCenter(start.z, size));
      const minEnd = new THREE.Vector3(snapToGridCenter(end.x, size), start.y, snapToGridCenter(end.z, size));
      
      const minX = Math.min(minStart.x, minEnd.x);
      const maxX = Math.max(minStart.x, minEnd.x);
      const minZ = Math.min(minStart.z, minEnd.z);
      const maxZ = Math.max(minStart.z, minEnd.z);

      for (let currentY = 0; currentY < brushHeight; currentY++) {
        const y = start.y + currentY * size;
        for (let x = minX; x <= maxX + 0.1; x += size) {
          for (let z = minZ; z <= maxZ + 0.1; z += size) {
            // Only add if it's on the edge
            if (Math.abs(x - minX) < 0.1 || Math.abs(x - maxX) < 0.1 || Math.abs(z - minZ) < 0.1 || Math.abs(z - maxZ) < 0.1) {
              pts.push([x, y, z]);
            }
          }
        }
      }
      return pts;
    }

    if (brushShape === 'line') {
      const minStart = new THREE.Vector3(snapToGridCenter(start.x, size), start.y, snapToGridCenter(start.z, size));
      const minEnd = new THREE.Vector3(snapToGridCenter(end.x, size), start.y, snapToGridCenter(end.z, size));
      
      const dx = minEnd.x - minStart.x;
      const dz = minEnd.z - minStart.z;
      const stepCount = Math.max(Math.abs(dx / size), Math.abs(dz / size));
      
      if (stepCount === 0) {
        for (let currentY = 0; currentY < brushHeight; currentY++) {
          const y = start.y + currentY * size;
          pts.push([minStart.x, y, minStart.z]);
        }
      } else {
        const xInc = dx / stepCount;
        const zInc = dz / stepCount;
        for (let currentY = 0; currentY < brushHeight; currentY++) {
          const y = start.y + currentY * size;
          let lx = minStart.x;
          let lz = minStart.z;
          for (let i = 0; i <= stepCount; i++) {
            const snappedX = snapToGridCenter(lx, size);
            const snappedZ = snapToGridCenter(lz, size);
            if (!pts.find(p => p[0] === snappedX && p[1] === y && p[2] === snappedZ)) {
              pts.push([snappedX, y, snappedZ]);
            }
            lx += xInc;
            lz += zInc;
          }
        }
      }
      return pts;
    }

    if (brushShape === 'stairs') {
      const minStart = new THREE.Vector3(snapToGridCenter(start.x, size), start.y, snapToGridCenter(start.z, size));
      const minEnd = new THREE.Vector3(snapToGridCenter(end.x, size), start.y, snapToGridCenter(end.z, size));
      
      const dx = minEnd.x - minStart.x;
      const dz = minEnd.z - minStart.z;
      const stepCount = Math.max(Math.abs(dx / size), Math.abs(dz / size));
      
      if (stepCount === 0) {
        for (let currentY = 0; currentY < brushHeight; currentY++) {
          const y = start.y + currentY * size;
          pts.push([minStart.x, y, minStart.z]);
        }
      } else {
        const xInc = dx / stepCount;
        const zInc = dz / stepCount;
        for (let currentY = 0; currentY < brushHeight; currentY++) {
          const baseStepY = currentY * size;
          let lx = minStart.x;
          let lz = minStart.z;
          for (let i = 0; i <= stepCount; i++) {
            const snappedX = snapToGridCenter(lx, size);
            const snappedZ = snapToGridCenter(lz, size);
            const y = start.y + baseStepY + i * size;
            if (!pts.find(p => p[0] === snappedX && p[1] === y && p[2] === snappedZ)) {
              pts.push([snappedX, y, snappedZ]);
            }
            lx += xInc;
            lz += zInc;
          }
        }
      }
      return pts;
    }

    if (brushShape === 'roof') {
      const minStart = new THREE.Vector3(snapToGridCenter(start.x, size), start.y, snapToGridCenter(start.z, size));
      const minEnd = new THREE.Vector3(snapToGridCenter(end.x, size), start.y, snapToGridCenter(end.z, size));
      
      const minX = Math.min(minStart.x, minEnd.x);
      const maxX = Math.max(minStart.x, minEnd.x);
      const minZ = Math.min(minStart.z, minEnd.z);
      const maxZ = Math.max(minStart.z, minEnd.z);

      const stepsX = Math.round((maxX - minX) / size);
      const stepsZ = Math.round((maxZ - minZ) / size);

      for (let currentY = 0; currentY < brushHeight; currentY++) {
        const baseLayerY = start.y + currentY * size;
        for (let x = minX; x <= maxX + 0.1; x += size) {
          for (let z = minZ; z <= maxZ + 0.1; z += size) {
            const stepX = Math.round((x - minX) / size);
            const stepZ = Math.round((z - minZ) / size);
            
            const distToEdgeX = Math.min(stepX, stepsX - stepX);
            const distToEdgeZ = Math.min(stepZ, stepsZ - stepZ);
            
            const peakHeight = Math.min(distToEdgeX, distToEdgeZ);
            const y = baseLayerY + peakHeight * size;

            pts.push([x, y, z]);
          }
        }
      }
      return pts;
    }

    return pts;
  }, [brushShape, brushHeight]);

  const handleGenericPointerDown = (e: ThreeEvent<PointerEvent>, objectId?: string) => {
    // Treat podium as a play/pause button if not editing/moving it
    if (appMode !== 'roomEditor' || (appMode === 'roomEditor' && roomEditorMode === 'view')) {
      if (objectId === 'podium') {
        e.stopPropagation();
        const state = useStore.getState();
        const shortsPacks = state.flexPacks.filter(p => !p.isHidden);
        if (state.isPlayingLoops) {
          state.setIsPlayingLoops(false);
        } else {
          if (shortsPacks.length > 0) {
            const randomPack = shortsPacks[Math.floor(Math.random() * shortsPacks.length)];
            state.loadFlexPack(randomPack.id);
            state.setIsPlayingLoopsOnce(true);
            state.setIsPlayingLoops(true);
          } else {
            state.setIsPlayingLoopsOnce(false);
            state.setIsPlayingLoops(true);
          }
        }
        return;
      }
    }

    // Pointer lock for desktop mouse look
    if (e.pointerType === 'mouse' && !document.pointerLockElement) {
       if (appMode === 'world' || appMode === 'room' || appMode === 'parkour' || (appMode === 'roomEditor' && roomEditorMode === 'voxel')) {
           try { document.body.requestPointerLock?.(); } catch(err){}
       }
    }

    if (appMode !== 'roomEditor') return;
    
    // Ignore multi-touch to allow OrbitControls camera rotation
    if (e.pointerType === 'touch' && e.nativeEvent) {
       const native = e.nativeEvent as any;
       // Some browsers use touches on the nativeEvent
       if (native.touches && native.touches.length > 1) return;
       if (!native.isPrimary) return;
    }
    
    if (roomEditorMode === 'move') {
      if (objectId === 'podium') {
        useStore.getState().setIsBuildingActive(true);
        handlePodiumExternalDragStart(e);
        return;
      }
      if (objectId && objectId !== 'floor' && objectId !== 'grid') {
        e.stopPropagation();
        useStore.getState().setIsBuildingActive(true);
        const obj = useStore.getState().roomObjects.find(o => o.id === objectId);
        if (obj) {
          const currentPos = new THREE.Vector3(obj.position[0], obj.position[1], obj.position[2]);
          const offset = currentPos.sub(e.point);
          offset.y = 0;
          setDragState({ target: 'block_' + objectId, offset });
        }
      }
      return;
    }

    if (roomEditorMode !== 'build' && roomEditorMode !== 'voxel') return;
    
    const isDesktopBuilder = document.pointerLockElement !== null || e.pointerType === 'mouse';

    // Desktop shortcuts override selected tool
    if (isDesktopBuilder) {
      if (e.altKey) {
        useStore.getState().setIsBuildingActive(true);
        useStore.getState().setIsErasing(true); // Start continuous erasing
        if (objectId && objectId !== 'floor' && objectId !== 'grid' && objectId !== 'podium') {
          e.stopPropagation();
          useStore.getState().setRoomObjects(useStore.getState().roomObjects.filter((o) => o.id !== objectId));
        }
        return;
      } else if (e.button === 2) {
          if (roomEditorMode === 'voxel') {
              e.stopPropagation();
              try { document.exitPointerLock?.(); } catch(err){}
              const state = useStore.getState();
              state.setIsVoxelMenuOpen(!state.isVoxelMenuOpen);
          }
          return;
      }
    }
    
    // Tools logic (desktop left click falls through to here)
    if (roomSelectedTool === 'grab') {
      if (e.button !== 0 && isDesktopBuilder) return; // Only allow left click for tools
      e.stopPropagation();
      const state = useStore.getState();
      if (state.grabbedBlock) {
          // Place the block
          const normal = (objectId && objectId !== 'floor' && objectId !== 'grid' && e.face) ? e.face.normal : new THREE.Vector3(0, 1, 0);
          const { x, y, z } = getSnappedPos(e.point, normal, state.grabbedBlock.scale[0]);
          const newBlock = { ...state.grabbedBlock, position: [x, y, z] as [number, number, number] };
          state.setRoomObjects([...state.roomObjects, newBlock]);
          state.setGrabbedBlock(null);
          setGrabPreviewPos(null);
          state.commitRoomEditorHistory();
      } else {
          // Pick up block
          if (objectId && objectId !== 'floor' && objectId !== 'grid' && objectId !== 'podium') {
             const block = state.roomObjects.find(o => o.id === objectId);
             if (block) {
                state.setRoomObjects(state.roomObjects.filter(o => o.id !== objectId));
                state.setGrabbedBlock(block);
                
                const normal = e.face ? e.face.normal : new THREE.Vector3(0, 1, 0);
                const { x, y, z } = getSnappedPos(e.point, normal, block.scale[0]);
                setGrabPreviewPos(new THREE.Vector3(x, y, z));
             }
          }
      }
      return;
    }

    if (roomSelectedTool === 'eraser') {
      if (e.button !== 0 && isDesktopBuilder) return;
      useStore.getState().setIsBuildingActive(true);
      useStore.getState().setIsErasing(true); // Start continuous erasing
      if (objectId && objectId !== 'floor' && objectId !== 'grid' && objectId !== 'podium') {
        e.stopPropagation();
        useStore.getState().setRoomObjects(useStore.getState().roomObjects.filter((o) => o.id !== objectId));
      }
      return;
    }
    
    if (roomSelectedTool === 'stamp') {
      if (e.button !== 0 && isDesktopBuilder) return;
      if (objectId === 'podium') return; // Ignore clicking podium when building
      e.stopPropagation();
      useStore.getState().setIsBuildingActive(true);
      const normal = (objectId && objectId !== 'floor' && objectId !== 'grid' && e.face) ? e.face.normal : new THREE.Vector3(0, 1, 0); 
      
      const { x, y, z } = getSnappedPos(e.point, normal, roomBlockSize);
      
      setBuildPreview({
        start: new THREE.Vector3(x, y, z),
        end: new THREE.Vector3(x, y, z),
        size: roomBlockSize,
        points: []
      });
    }
  };

  const handleGenericPointerMove = (e: ThreeEvent<PointerEvent>, objectId?: string) => {
    if (appMode !== 'roomEditor') return;
    
    if (roomSelectedTool === 'grab' && grabbedBlock) {
       e.stopPropagation();
       const normal = (objectId && objectId !== 'floor' && objectId !== 'grid' && e.face) ? e.face.normal : new THREE.Vector3(0, 1, 0);
       const { x, y, z } = getSnappedPos(e.point, normal, grabbedBlock.scale[0]);
       setGrabPreviewPos(new THREE.Vector3(x, y, z));
       return;
    }

    if (roomEditorMode === 'build' && roomSelectedTool === 'eraser' && useStore.getState().isErasing) {
      if (objectId && objectId !== 'floor' && objectId !== 'grid' && objectId !== 'podium') {
        const currentObjects = useStore.getState().roomObjects;
        if (currentObjects.some(o => o.id === objectId)) {
          e.stopPropagation();
          useStore.getState().setRoomObjects(currentObjects.filter((o) => o.id !== objectId));
        }
      }
    }
  };

  // Keep exposing dragging state if parent needs it
  React.useEffect(() => {
    if (dragState && dragState.target === 'podium') {
      // Handled outside but we may need to reset it globally if needed.
    }
  }, [dragState]);

  // If parent wants to initiate drag on podium:
  const handlePodiumExternalDragStart = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const currentPos = new THREE.Vector3(useStore.getState().podiumPosition[0], useStore.getState().podiumPosition[1], useStore.getState().podiumPosition[2]);
    const offset = currentPos.sub(e.point);
    offset.y = 0;
    setDragState({ target: 'podium', offset });
  };
  
  // Actually we need to export it via context or imperatively, or just pass handlePodiumPointerDown
  // BUT: The easiest way is for RoomBuildSystem to just wrap the whole room objects and grid
  
  return (
    <>
      {appMode === 'roomEditor' ? (
        <>
          {(roomEditorMode === 'build' || roomEditorMode === 'voxel') && (
            <mesh 
               position={[0, buildY, 0]} 
               rotation={[-Math.PI / 2, 0, 0]} 
               onPointerDown={(e) => handleGenericPointerDown(e, 'grid')}
               visible={true}
            >
              <planeGeometry args={[100000, 100000]} />
              <meshBasicMaterial transparent opacity={0.0} depthWrite={false} color="#ffffff" side={THREE.DoubleSide} />
            </mesh>
          )}
        </>
      ) : null}

      {/* Grabbed Block Preview */}
      {grabbedBlock && grabPreviewPos && (
        <group pointerEvents="none">
          <mesh position={grabPreviewPos}>
            <boxGeometry args={[grabbedBlock.scale[0], grabbedBlock.scale[1], grabbedBlock.scale[2]]} />
            <meshBasicMaterial color={getStampColor(grabbedBlock.type)} transparent opacity={0.5} depthWrite={false} />
          </mesh>
        </group>
      )}

      {/* Preview Interaction Plane */}
      {buildPreview && (
        <group>
          <mesh
            position={[0, buildPreview.start.y, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            visible={true}
            onPointerMove={(e) => {
              e.stopPropagation();
              setBuildPreview(prev => prev ? { ...prev, end: e.point.clone() } : null);
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              if (!buildPreview) return;
              
              const pts = computePreviewBlocks(buildPreview.start, e.point.clone(), buildPreview.size);
              const currentObjects = useStore.getState().roomObjects;
              const newBlocks = [];
              for (const pt of pts) {
                if (!isIntersecting(pt[0], pt[1], pt[2], buildPreview.size)) {
                  newBlocks.push({
                    id: generateId(),
                    type: useStore.getState().roomSelectedStamp,
                    position: [pt[0], pt[1], pt[2]] as [number, number, number],
                    rotation: [0, 0, 0] as [number, number, number],
                    scale: [buildPreview.size, buildPreview.size, buildPreview.size] as [number, number, number],
                  });
                }
              }

              if (newBlocks.length > 0) {
                useStore.getState().setRoomObjects([...currentObjects, ...newBlocks]);
                useStore.getState().commitRoomEditorHistory();
              }
              setBuildPreview(null);
            }}
          >
            <planeGeometry args={[10000, 10000]} />
            <meshBasicMaterial transparent opacity={0.0} depthWrite={false} color="#ff0000" side={THREE.DoubleSide} />
          </mesh>
          {/* Render Preview Blocks */}
          {(() => {
            const pts = computePreviewBlocks(buildPreview.start, buildPreview.end, buildPreview.size);
            const stampType = useStore.getState().roomSelectedStamp;
            return pts.map((pt, i) => (
              <mesh key={`preview_${i}`} position={pt}>
                <boxGeometry args={[buildPreview.size * 0.99, buildPreview.size * 0.99, buildPreview.size * 0.99]} />
                <PlasticMaterial color={getStampColor(stampType, pt[0], pt[1], pt[2])} transparent opacity={0.6} hasBlockOutline={false} />
              </mesh>
            ));
          })()}
        </group>
      )}

      {dragState && (
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0, 0]} 
          onPointerMove={(e) => {
            e.stopPropagation();
            const newPos = e.point.clone().add(dragState.offset);
            
            if (dragState.target === 'podium') {
              const x = Math.round(newPos.x);
              const z = Math.round(newPos.z);
              setPodiumPosition([x, 0, z]);
            } else if (dragState.target.startsWith('block_')) {
              const id = dragState.target.split('_')[1];
              const currentRoomObjects = useStore.getState().roomObjects;
              const activeBlock = currentRoomObjects.find(o => o.id === id);
              if (activeBlock) {
                const size = activeBlock.scale[0];
                const minX = newPos.x - size / 2;
                const minZ = newPos.z - size / 2;
                const x = Math.round(minX) + size / 2;
                const z = Math.round(minZ) + size / 2;
                
                const newObjects = currentRoomObjects.map(obj => 
                  obj.id === id ? { ...obj, position: [x, obj.position[1], z] as [number, number, number] } : obj
                );
                // Do not spam history, just update state directly for smooth drag
                useStore.getState().setRoomObjects(newObjects);
              }
            }
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            useStore.getState().commitRoomEditorHistory();
            setDragState(null);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            useStore.getState().commitRoomEditorHistory();
            setDragState(null);
          }}
        >
          <planeGeometry args={[10000, 10000]} />
          <meshBasicMaterial transparent opacity={0.0} color="#ff0000" depthWrite={false} />
        </mesh>
      )}

      {/* Render Room Objects via Chunked System */}
      <ChunkedRoomBlocks onBlockPointerDown={handleGenericPointerDown} onBlockPointerMove={handleGenericPointerMove} />
      <BlockLights />

      {/* NEW ROOM PODIUM */}
      <group 
        name="podium"
        position={podiumPosition}
        onPointerOver={(e) => { e.stopPropagation(); setIsHoveredPodium(true); }}
        onPointerOut={(e) => { setIsHoveredPodium(false); }}
      >
        {showVideo && (
          <React.Suspense fallback={null}>
            <BackgroundVideoProjector url={backgroundVideoUrl} />
          </React.Suspense>
        )}
        {/* Base Layer */}
        <mesh 
          ref={textGroupRef} 
          position={[0, -1.1, 0]} 
          receiveShadow 
          castShadow
          onPointerDown={(e) => handleGenericPointerDown(e, 'podium')}
        >
          <cylinderGeometry args={[8, 8.5, 1.8, 64]} />
          <PlasticMaterial attach="material-0" color="flex-ring" /> {/* Side */}
          <PlasticMaterial attach="material-1" color="#1e293b" /> {/* Top */}
          <PlasticMaterial attach="material-2" color="#1e293b" /> {/* Bottom */}
        </mesh>
        
        {/* Middle Layer */}
        <mesh position={[0, 0.31, 0]} receiveShadow castShadow onPointerDown={(e) => handleGenericPointerDown(e, 'podium')}>
          <cylinderGeometry args={[6, 6.5, 0.9, 64]} />
          <PlasticMaterial color="#1e293b" />
        </mesh>

        {/* Top Layer */}
        <mesh position={[0, 0.91, 0]} receiveShadow castShadow onPointerDown={(e) => handleGenericPointerDown(e, 'podium')}>
          <cylinderGeometry args={[4, 4.5, 0.18, 64]} />
          <PlasticMaterial color="#ffffff" />
        </mesh>
      </group>
    </>
  );
};

export const BlockLights = React.memo(() => {
  const roomObjects = useStore(state => state.roomObjects);
  const lights = React.useMemo(() => roomObjects.filter(b => b.type === 'block_light'), [roomObjects]);
  
  if (lights.length === 0) return null;

  return (
    <group>
      {lights.slice(0, 16).map(l => (
        <pointLight 
          key={`pl_${l.id}`}
          position={[l.position[0], l.position[1] + 1.0, l.position[2]]}
          color="#fef08a"
          intensity={20}
          distance={50}
          decay={1.5}
        />
      ))}
    </group>
  );
});
