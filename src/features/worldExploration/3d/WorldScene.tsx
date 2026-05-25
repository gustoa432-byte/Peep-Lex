import React, { useState } from 'react';
import * as THREE from 'three';
import { Sky, Grid, PerspectiveCamera } from '@react-three/drei';
import { PlasticMaterial } from '../../../components/3d/materials/PlasticMaterial';
import { SlingshotItem } from '../../../components/3d/SlingshotItem';

type Voxel = {
  pos: [number, number, number];
  color: string;
};

const colors = ['#3b82f6', '#eab308', '#ef4444', '#a855f7', '#10b981', '#f97316', '#ffffff'];

const initialVoxels: Voxel[] = [
  { pos: [2, 0.5, -2], color: '#3b82f6' }, // blue
  { pos: [-3, 0.5, -4], color: '#eab308' }, // yellow
  { pos: [4, 0.5, 3], color: '#ef4444' }, // red
  { pos: [-2, 0.5, 2], color: '#a855f7' }, // purple
];

export const WorldScene: React.FC = () => {
  return (
    <group>
      <PerspectiveCamera makeDefault position={[0, 5, 20]} fov={45} />
      <ambientLight color="#ffffff" intensity={1} />
      <color attach="background" args={['#0f172a']} />
      
      {/* Empty World Placeholder */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>
    </group>
  );
};
