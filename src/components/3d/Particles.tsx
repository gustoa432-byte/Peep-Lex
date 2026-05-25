import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Particles = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const count = 600; // More particles for better depth
  const lightY = 16.0; // Raised twice as high (was 8.0)
  const maxPhi = 1.2; // Widened by 50% (was 0.8)

  // Store particle logical state
  const particleData = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        theta: Math.random() * Math.PI * 2,
        phi: Math.sqrt(Math.random()) * maxPhi, // sqrt for uniform area distribution in cone
        dist: 1.0 + Math.random() * 15.0, // Adjusted for new height
        speed: Math.random() * 0.015 + 0.005,
        phase: Math.random() * Math.PI * 2,
        size: Math.random() * 0.2 + 0.05
      });
    }
    return data;
  }, [count]);

  const [positions, sizes, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const pha = new Float32Array(count);

    particleData.forEach((p, i) => {
      pos[i * 3] = p.dist * Math.sin(p.phi) * Math.cos(p.theta);
      pos[i * 3 + 1] = lightY - p.dist * Math.cos(p.phi);
      pos[i * 3 + 2] = p.dist * Math.sin(p.phi) * Math.sin(p.theta);
      siz[i] = p.size;
      pha[i] = p.phase;
    });

    return [pos, siz, pha];
  }, [particleData, count]);

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    color: { value: new THREE.Color('#fef08a') } // Warm glitter color
  }), []);

  useFrame((state) => {
    if (pointsRef.current) {
      const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        const p = particleData[i];
        
        // Fall down (increase distance from light)
        p.dist += p.speed;
        
        if (p.dist > 16.0) { // Reset at new floor distance
          p.dist = 1.0; // Reset to top
          p.phi = Math.sqrt(Math.random()) * maxPhi;
          p.theta = Math.random() * Math.PI * 2;
        }

        // Gentle sway (wind effect)
        const currentTheta = p.theta + Math.sin(state.clock.elapsedTime * 0.5 + p.phase) * 0.1;
        const currentPhi = p.phi + Math.cos(state.clock.elapsedTime * 0.3 + p.phase) * 0.02;

        // Convert spherical to Cartesian
        posArray[i * 3] = p.dist * Math.sin(currentPhi) * Math.cos(currentTheta);
        posArray[i * 3 + 1] = lightY - p.dist * Math.cos(currentPhi);
        posArray[i * 3 + 2] = p.dist * Math.sin(currentPhi) * Math.sin(currentTheta);
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-phase" count={count} array={phases} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          attribute float size;
          attribute float phase;
          varying float vAlpha;
          uniform float time;

          void main() {
            // Twinkle effect
            float twinkle = (sin(time * 4.0 + phase) + 1.0) * 0.5;
            
            // Vertical fades (raised twice as high from floor)
            float fadeOut = smoothstep(0.2, 3.0, position.y);
            float fadeIn = 1.0 - smoothstep(14.0, 16.0, position.y);

            // Radial fade (soft edges for the spotlight cone)
            float lightY = 16.0;
            float maxPhi = 1.2;
            float dy = lightY - position.y;
            float radius = length(position.xz);
            float currentPhi = atan(radius, dy);
            
            // Fade out softly as it approaches the edge of the cone (from 40% to 100% of the radius)
            float radialFade = 1.0 - smoothstep(maxPhi * 0.4, maxPhi, currentPhi);

            vAlpha = twinkle * fadeOut * fadeIn * radialFade;

            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            
            // Perspective size attenuation (gives depth)
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying float vAlpha;
          uniform vec3 color;

          void main() {
            // Circular particle
            float r = distance(gl_PointCoord, vec2(0.5));
            if (r > 0.5) discard;
            
            // Soft glow core
            float strength = 1.0 - (r * 2.0);
            strength = pow(strength, 1.5);

            gl_FragColor = vec4(color, vAlpha * strength * 0.9);
          }
        `}
      />
    </points>
  );
};
