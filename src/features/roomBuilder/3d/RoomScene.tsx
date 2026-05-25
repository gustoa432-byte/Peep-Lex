import React, { useRef } from 'react';
import { PerspectiveCamera, Sky, Stars } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PlasticMaterial } from '../../../components/3d/materials/PlasticMaterial';
import { useStore } from '../../../store/useStore';
import { getGlobalAudioContext, getGlobalAudioPannerNode } from '../../../components/audio/GlobalAudioPlayer';
import { RoomCameraManager } from './RoomCameraManager';
import { RoomBuildSystem } from './RoomBuildSystem';

const DynamicShadowLight = ({ color, intensity }: { color: string, intensity: number }) => {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const { gl } = useThree();
  
  React.useEffect(() => {
    gl.shadowMap.autoUpdate = true;
    gl.shadowMap.needsUpdate = true;
  }, [gl]);

  useFrame(({ camera }) => {
    if (lightRef.current) {
      const frustumSize = 50;
      const mapSize = 512;
      
      const texelSize = (frustumSize * 2) / mapSize;
      
      const snappedX = Math.round(camera.position.x / texelSize) * texelSize;
      const snappedZ = Math.round(camera.position.z / texelSize) * texelSize;
      
      lightRef.current.position.set(snappedX + 20, 100, snappedZ + 20);
      lightRef.current.target.position.set(snappedX, 0, snappedZ);
      lightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <directionalLight 
      ref={lightRef}
      color={color} 
      intensity={intensity} 
      castShadow
      shadow-mapSize={[512, 512]}
      shadow-bias={-0.0005}
      shadow-normalBias={0.05}
    >
      <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50, 0.5, 300]} />
    </directionalLight>
  );
};

export const RoomScene: React.FC = () => {
  const podiumPosition = useStore(state => state.podiumPosition);
  const envTime = useStore(state => state.environmentTime);
  const envTerrain = useStore(state => state.environmentTerrain);

  // Sync Audio listener and Panner
  useFrame(({ camera }) => {
    const panner = getGlobalAudioPannerNode();
    if (panner) {
      if (panner.positionX) {
        panner.positionX.value = podiumPosition[0];
        panner.positionY.value = podiumPosition[1];
        panner.positionZ.value = podiumPosition[2];
      }

      const ctx = getGlobalAudioContext();
      if (ctx && ctx.listener && ctx.listener.positionX) {
        ctx.listener.positionX.value = camera.position.x;
        ctx.listener.positionY.value = camera.position.y;
        ctx.listener.positionZ.value = camera.position.z;
        ctx.listener.forwardX.value = -camera.matrixWorld.elements[8];
        ctx.listener.forwardY.value = -camera.matrixWorld.elements[9];
        ctx.listener.forwardZ.value = -camera.matrixWorld.elements[10];
        ctx.listener.upX.value = camera.up.x;
        ctx.listener.upY.value = camera.up.y;
        ctx.listener.upZ.value = camera.up.z;
      }
    }
  });

  const appMode = useStore(state => state.appMode);
  const roomEditorMode = useStore(state => state.roomEditorMode);

  // Time of Day settings
  const timeSettings = {
    day: {
      bg: '#87CEEB',
      sunPos: [100, 20, 100] as [number, number, number],
      turbidity: 0.1, rayleigh: 0.5,
      sunColor: '#ffffff', sunIntensity: 1.8,
      ambIntensity: 1.2,
      hemiColor: '#ffffff', hemiIntensity: 0.6
    },
    dusk: {
      bg: '#ff7b54',
      sunPos: [100, 2, 100] as [number, number, number],
      turbidity: 5, rayleigh: 2,
      sunColor: '#ffb088', sunIntensity: 0.8,
      ambIntensity: 0.5,
      hemiColor: '#ff7b54', hemiIntensity: 0.4
    },
    night: {
      bg: '#051024',
      sunPos: [100, 1, 100] as [number, number, number],
      turbidity: 0.1, rayleigh: 0.01,
      sunColor: '#aaccff', sunIntensity: 0.4, // Moonlight
      ambIntensity: 0.25,
      hemiColor: '#5577bb', hemiIntensity: 0.35
    }
  };

  const t = timeSettings[envTime || 'day'];

  // Terrain colors
  const terrainColors = {
    concrete: 't-concrete',
    grass: 't-grass',
    dirt: 't-dirt'
  };
  const groundColor = terrainColors[envTerrain || 'concrete'];

  return (
    <group onPointerUp={() => useStore.getState().commitRoomEditorHistory()}>
      <RoomCameraManager />
      <PerspectiveCamera makeDefault position={[0, 80, 80]} far={20000} fov={appMode === 'roomEditor' && roomEditorMode === 'voxel' ? 60 : 45} />
      <color attach="background" args={[t.bg]} />
      <fog attach="fog" args={[t.bg, 500, 2500]} />
      {envTime !== 'night' ? (
        <Sky sunPosition={t.sunPos} turbidity={t.turbidity} rayleigh={t.rayleigh} inclination={0.49} distance={15000} />
      ) : (
        <React.Suspense fallback={null}>
          <Sky sunPosition={[100, -2, 100]} turbidity={2} rayleigh={0.1} mieCoefficient={0.005} mieDirectionalG={0.8} distance={15000} />
          <Stars radius={3500} depth={500} count={5000} factor={20} saturation={0} fade speed={1} />
        </React.Suspense>
      )}
      
      <ambientLight color="#ffffff" intensity={t.ambIntensity} />
      <hemisphereLight color={t.hemiColor} groundColor={groundColor} intensity={t.hemiIntensity} />
      
      {/* Natural daylight lighting via Dynamic shadow light */}
      <DynamicShadowLight color={t.sunColor} intensity={t.sunIntensity} />

      {/* Solid Ground Floor */}
      <mesh name="ground-floor" position={[0, -2.5, 0]} frustumCulled={false} receiveShadow>
        <boxGeometry args={[3000, 1.0, 3000]} />
        <PlasticMaterial color={groundColor} />
      </mesh>

      {/* Expanded Room Container */}
      <group position={[0, 0, 0]}>
        <RoomBuildSystem />
      </group>
    </group>
  );
};
