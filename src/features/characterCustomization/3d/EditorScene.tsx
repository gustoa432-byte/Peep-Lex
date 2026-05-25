import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Environment, Grid, Text, useVideoTexture, PerspectiveCamera, useTexture } from '@react-three/drei';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../../../store/useStore';
import { defaultDevSettings } from '../../../store/defaults';
import * as THREE from 'three';
import { getMediaDB } from '../../../lib/db';
import { activePoseRef } from './AnimationPlayer';
import { useFrame } from '@react-three/fiber';
import { PlasticMaterial } from '../../../components/3d/materials/PlasticMaterial';
import { ApiService } from '../../../services/ApiService';
import { BackgroundVideoProjector } from '../../../components/3d/BackgroundVideoProjector';
import { getGlobalAudioContext, getGlobalAudioPannerNode } from '../../../components/audio/GlobalAudioPlayer';

const SceneBackground = ({ bgUrl, bgSphereY, bgSphereRotY }: { bgUrl: string, bgSphereY: number, bgSphereRotY: number }) => {
  const bgTexture = useTexture(bgUrl);
  const envMap = React.useMemo(() => {
    if (!bgTexture) return null;
    const tex = bgTexture.clone();
    tex.mapping = THREE.EquirectangularReflectionMapping;
    return tex;
  }, [bgTexture]);

  return (
    <>
      {envMap && <Environment map={envMap} />}
      <mesh position={[0, bgSphereY, 0]} scale={[-1, 0.6, 1]} rotation={[0, (Math.PI / -2) + bgSphereRotY, 0]}>
        <sphereGeometry args={[15, 64, 40]} />
        <meshBasicMaterial map={bgTexture} side={THREE.BackSide} />
      </mesh>
    </>
  );
};

const StageLights = () => {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  const pinkRimRef = useRef<THREE.DirectionalLight>(null);
  const cyanRimRef = useRef<THREE.DirectionalLight>(null);
  const backFillRef = useRef<THREE.DirectionalLight>(null);

  const animSpotRef = useRef<THREE.SpotLight>(null);

  useFrame((state) => {
    const { isPlayingAnimation, isPlayingLoops, editingLoopId, devSettings: globalDevSettings, isAnimationMenuOpen, appMode } = useStore.getState();
    const isPlaying = isPlayingAnimation || isPlayingLoops;
    const isMainHub = appMode === 'editor' && !isAnimationMenuOpen && !isPlayingLoops && editingLoopId === null;
    
    // In Main Hub, it must be the standard default light!
    const activeSettings = isPlaying ? activePoseRef.current : globalDevSettings;
    const devSettings = activeSettings;
    const time = state.clock.elapsedTime;

    // "Свет с туалета не должен освещать Хол"
    // Lights only flash when we are in the Loop Editor (Micro mode) or actively playing a timeline loop sequence.
    const isLoopEditor = editingLoopId !== null;
    const allowEffects = isPlaying || isLoopEditor;

    const getModeIntensity = (mode: number | undefined, base: number) => {
      if (!allowEffects) return base; // Force steady light in the macro/studio mode if not playing loops
      if (mode === 1) return base * (0.5 + 0.5 * Math.sin(time * 3));
      if (mode === 2) return Math.sin(time * 10) > 0 ? base : 0;
      if (mode === 3) return 0;
      return base;
    };

    if (ambientRef.current) ambientRef.current.intensity = getModeIntensity(devSettings?.ambientMode, devSettings?.ambientIntensity ?? 0.6);
    if (spotRef.current) {
      if (isAnimationMenuOpen) spotRef.current.intensity = 0;
      else {
        spotRef.current.intensity = getModeIntensity(devSettings?.spotMode, devSettings?.spotLightIntensity ?? 2.5);
        spotRef.current.position.set(devSettings?.spotLightPosX ?? 0, devSettings?.spotLightPosY ?? 6, devSettings?.spotLightPosZ ?? 4);
        spotRef.current.target.position.set(0, 0, 0);
        spotRef.current.target.updateMatrixWorld();
        spotRef.current.angle = devSettings?.spotLightAngle ?? 0.6;
        spotRef.current.penumbra = devSettings?.spotLightPenumbra ?? 0.5;
      }
    }
    if (pinkRimRef.current) {
      pinkRimRef.current.intensity = getModeIntensity(devSettings?.rimPinkMode, devSettings?.rimPinkIntensity ?? 1.5);
      pinkRimRef.current.position.set(devSettings?.rimPinkPosX ?? -3, devSettings?.rimPinkPosY ?? 3, devSettings?.rimPinkPosZ ?? -3);
      if (pinkRimRef.current.target) {
        pinkRimRef.current.target.position.set(0, 0, 0);
        pinkRimRef.current.target.updateMatrixWorld();
      }
    }
    if (cyanRimRef.current) {
      cyanRimRef.current.intensity = getModeIntensity(devSettings?.rimCyanMode, devSettings?.rimCyanIntensity ?? 1.5);
      cyanRimRef.current.position.set(devSettings?.rimCyanPosX ?? 3, devSettings?.rimCyanPosY ?? 3, devSettings?.rimCyanPosZ ?? -3);
      if (cyanRimRef.current.target) {
        cyanRimRef.current.target.position.set(0, 0, 0);
        cyanRimRef.current.target.updateMatrixWorld();
      }
    }
    if (backFillRef.current) {
      // It doesn't have a mode yet, so just steady light.
      backFillRef.current.intensity = devSettings?.backFillIntensity ?? 0.4;
      backFillRef.current.position.set(devSettings?.backFillPosX ?? 0, devSettings?.backFillPosY ?? 4, devSettings?.backFillPosZ ?? -4);
      if (backFillRef.current.target) {
        backFillRef.current.target.position.set(0, 0, 0);
        backFillRef.current.target.updateMatrixWorld();
      }
    }
    if (animSpotRef.current) {
      animSpotRef.current.intensity = isAnimationMenuOpen ? 2.5 : 0;
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} color="#ffffff" />
      <spotLight ref={spotRef} color="#ffffff" decay={0} castShadow shadow-mapSize={[512, 512]} shadow-bias={-0.0001} />
      <directionalLight ref={pinkRimRef} color="#ec4899" />
      <directionalLight ref={cyanRimRef} color="#06b6d4" />
      
      {/* Дешевый заполняющий свет сзади сверху */}
      <directionalLight ref={backFillRef} color="#ffffff" intensity={0.4} position={[0, 4, -4]} />

      {/* Animation Editor basic lighting */}
      <spotLight 
         ref={animSpotRef}
         color="#ffffff" 
         intensity={0} 
         position={[0, 6, 5]} 
         decay={0} 
         castShadow 
      />
    </>
  );
};

export const EditorScene: React.FC = () => {
  const { backgroundVideoUrl, isAnimationMenuOpen, isPlayingLoops, isUiHidden, bgSphereY, bgSphereRotY } = useStore(useShallow(state => ({
    backgroundVideoUrl: state.backgroundVideoUrl,
    isAnimationMenuOpen: state.isAnimationMenuOpen,
    isPlayingLoops: state.isPlayingLoops,
    isUiHidden: state.isUiHidden,
    bgSphereY: state.bgSphereY,
    bgSphereRotY: state.bgSphereRotY
  })));
  const showVideo = backgroundVideoUrl && (isAnimationMenuOpen || isPlayingLoops);

  const [bgUrl, setBgUrl] = useState<string | null>(null);

  useEffect(() => {
    ApiService.getMediaPublicUrl('bg_img', '8992.webp').then(url => {
        if (url) setBgUrl(url);
    });
  }, []);

  useFrame(({ camera }) => {
    const panner = getGlobalAudioPannerNode();
    if (panner) {
      if (panner.positionX) {
        panner.positionX.value = 0;
        panner.positionY.value = 0;
        panner.positionZ.value = 0;
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

  return (
    <group>
      <PerspectiveCamera makeDefault position={[0, 2.5, 5.5]} fov={45} />

      {bgUrl && <SceneBackground bgUrl={bgUrl} bgSphereY={bgSphereY} bgSphereRotY={bgSphereRotY} />}
      
      <StageLights />

      {showVideo && (
        <React.Suspense fallback={null}>
          <BackgroundVideoProjector url={backgroundVideoUrl} />
        </React.Suspense>
      )}

      {/* BACKYARD DIORAMA */}
      <group position={[0, -0.05, 0]}>
        <mesh position={[0, -1.2, 0]} receiveShadow>
          <cylinderGeometry args={[5.2, 5.5, 2.4, 32]} />
          <PlasticMaterial color="#2a2d35" />
        </mesh>
        <mesh position={[0, 0.0, 0]} receiveShadow>
          <cylinderGeometry args={[5, 5, 0.05, 32]} />
          <PlasticMaterial color="#ffffff" />
        </mesh>

        <group position={[0, 0.025, 0]}>
          {/* Fake junk */}
          <mesh position={[-1.5, 0.19, -1.5]} castShadow receiveShadow>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <PlasticMaterial color="#3b82f6" />
          </mesh>
          <mesh position={[-0.8, 0.14, -1.8]} castShadow receiveShadow>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <PlasticMaterial color="#eab308" />
          </mesh>
          <mesh position={[1.5, 0.19, -1.5]} castShadow receiveShadow>
            <coneGeometry args={[0.2, 0.3, 5]} />
            <PlasticMaterial color="#cbd5e1" />
          </mesh>
          <mesh position={[1.2, 0.14, -2.0]} castShadow receiveShadow>
            <coneGeometry args={[0.15, 0.2, 5]} />
            <PlasticMaterial color="#cbd5e1" />
          </mesh>
          <mesh position={[2.2, 0.09, -0.5]} castShadow receiveShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
            <PlasticMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[2.2, 0.24, -0.5]} castShadow receiveShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.2, 16]} />
            <PlasticMaterial color="#94a3b8" />
          </mesh>

          {/* FAKE STAGE LANTERNS */}
          <group position={[-3.5, 0.19, -3.5]} rotation={[0.2, Math.PI / 4, 0]}>
            <mesh position={[0, -0.1, 0]} castShadow><boxGeometry args={[0.4, 0.2, 0.4]} /><PlasticMaterial color="#222" /></mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.3, 0.3, 0.4, 16]} /><PlasticMaterial color="#111" /></mesh>
            <mesh position={[0, 0, 0.21]}><circleGeometry args={[0.25, 16]} /><meshBasicMaterial color="#ec4899" /></mesh>
          </group>

          <group position={[3.5, 0.19, -3.5]} rotation={[0.2, -Math.PI / 4, 0]}>
            <mesh position={[0, -0.1, 0]} castShadow><boxGeometry args={[0.4, 0.2, 0.4]} /><PlasticMaterial color="#222" /></mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.3, 0.3, 0.4, 16]} /><PlasticMaterial color="#111" /></mesh>
            <mesh position={[0, 0, 0.21]}><circleGeometry args={[0.25, 16]} /><meshBasicMaterial color="#06b6d4" /></mesh>
          </group>
        </group>
      </group>

      <Grid visible={!isUiHidden} infiniteGrid fadeDistance={15} sectionColor="#5eead4" cellColor="#14b8a6" position={[0, -0.8, 0]} />
    </group>
  );
};
