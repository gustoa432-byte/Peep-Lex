import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../../store/useStore';
import * as THREE from 'three';

export const SlingshotItem = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Group>(null);
  const { hasSlingshot, setHasSlingshot, isFirstPerson, setIsNearSlingshot } = useStore(useShallow(state => ({
    hasSlingshot: state.hasSlingshot,
    setHasSlingshot: state.setHasSlingshot,
    isFirstPerson: state.isFirstPerson,
    setIsNearSlingshot: state.setIsNearSlingshot
  })));
  const [wasClose, setWasClose] = useState(false);

  // Clear state when unmounted or picked up
  useEffect(() => {
    if (hasSlingshot) {
        setIsNearSlingshot(false);
    }
    return () => setIsNearSlingshot(false);
  }, [hasSlingshot, setIsNearSlingshot]);

  useFrame((state) => {
    if (!meshRef.current || hasSlingshot) return;
    
    // Levitate animation
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(t * 3) * 0.2;
    meshRef.current.rotation.y = t * 1;

    // Check distance to character using global position
    const charPos = (window as any).__CHARACTER_POSITION__;
    let close = false;
    if (charPos) {
      const worldPos = new THREE.Vector3();
      meshRef.current.getWorldPosition(worldPos);
      worldPos.y = position[1]; // Ignore levitation height for distance check
      const dist = charPos.distanceTo(worldPos);
      close = dist < 2.5; // Only trigger when very close
    }

    if (close !== wasClose) {
      setWasClose(close);
      setIsNearSlingshot(close);
    }
  });

  if (hasSlingshot) return null; // Don't render once picked up

  return (
    <group ref={meshRef} position={position}>
      {/* 3D Slingshot Representation */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[-0.2, 1.2, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.2, 1.2, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
};
