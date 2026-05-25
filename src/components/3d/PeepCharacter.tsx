import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Decal, Sparkles, Text } from '@react-three/drei';
import { useStore } from '../../store/useStore';
import { PlasticMaterial } from './materials/PlasticMaterial';
import { useCharacterKinematics, safeNum } from '../../hooks/useCharacterKinematics';
import { AssetManager } from '../../managers/AssetManager';
import { useFrame } from '@react-three/fiber';

const TVScreenMaterial: React.FC = () => {
  const shaderRef = React.useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  const shaderArgs = React.useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      float rand(vec2 co){
          return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
      }
      void main() {
        float n = rand(vUv * (uTime * 10.0 + 1.0));
        float fade = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x) * smoothstep(0.0, 0.05, vUv.y) * smoothstep(1.0, 0.95, vUv.y);
        gl_FragColor = vec4(vec3(n * 0.6 + 0.2) * fade, 1.0);
      }
    `
  }), []);

  return <shaderMaterial ref={shaderRef} args={[shaderArgs]} />;
};

export const BlobShadow: React.FC<{ parentRef: React.RefObject<THREE.Group> }> = ({ parentRef }) => {
  const shadowRef = React.useRef<THREE.Mesh>(null);
  const frameSkipRef = React.useRef(0);
  
  const shadowTexture = useMemo(() => {
    return AssetManager.getOrCreateTexture('blob-shadow', () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
          grad.addColorStop(0, 'rgba(0,0,0,0.6)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 128, 128);
        }
        return new THREE.CanvasTexture(canvas);
    });
  }, []);

  useFrame((state) => {
    if (shadowRef.current && parentRef.current) {
        frameSkipRef.current++;
        if (frameSkipRef.current % 3 !== 0) return;
        
        const raycaster = new THREE.Raycaster();
        const origin = parentRef.current.position.clone();
        origin.y += 2.0; // Raycast from slightly above the character
        
        raycaster.set(origin, new THREE.Vector3(0, -1, 0));

        const collidableObjects = [
            state.scene.getObjectByName('room-blocks'),
            state.scene.getObjectByName('ground-floor'),
            state.scene.getObjectByName('podium'),
            state.scene.getObjectByName('ground-collision')
        ].filter(Boolean) as THREE.Object3D[];
        
        const intersects = raycaster.intersectObjects(collidableObjects, true);

        // Find the first valid ground hit
        const hit = intersects.find(hit => 
            hit.object.name !== 'Grid' && 
            hit.object.name !== 'Sky' && 
            hit.object.type !== 'GridHelper' && 
            !((hit.object as THREE.Mesh).material as any)?.transparent
        );

        if (hit) {
            const charY = parentRef.current.position.y;
            const floorY = hit.point.y;
            const dist = charY - floorY;
            
            // set position locally (relative to parent)
            shadowRef.current.position.y = -dist + 0.05;
            
            // Scale based on distance to ground
            const distFloor = Math.max(0, dist);
            const scale = Math.max(0.01, 1 - distFloor * 0.15);
            shadowRef.current.scale.set(scale, scale, scale);
            
            // Fade out completely if too high
            (shadowRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - distFloor * 0.2);
        } else {
             // Fallback
             shadowRef.current.position.y = -parentRef.current.position.y + 0.05;
        }
    }
  });

  return (
    <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={false} castShadow={false}>
      <planeGeometry args={[2.5, 2.5]} />
      <meshBasicMaterial map={shadowTexture} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-4} polygonOffsetUnits={-4} />
    </mesh>
  );
};

export const PeepCharacter: React.FC = () => {
  const {
    characterGroupRef,
    visualGroupRef,
    crouchGroupRef,
    spineRef,
    neckRef,
    leftShoulderRef,
    rightShoulderRef,
    leftElbowRef,
    rightElbowRef,
    leftWristRef,
    rightWristRef,
    leftHipRef,
    rightHipRef,
    leftKneeRef,
    rightKneeRef,
    crouchFactorRef
  } = useCharacterKinematics();

  const characterConfig = useStore(state => state.characterConfig);
  
  const {
    mainColor = '#F4C430', legColor = '#E34234', headSize = 0.65, 
    headColor, torsoColor, 
    leftShoulderColor, leftElbowColor, leftHandColor,
    rightShoulderColor, rightElbowColor, rightHandColor,
    leftHipColor, leftKneeColor, leftShoeColor,
    rightHipColor, rightKneeColor, rightShoeColor,
    torsoRadius = 0.75, torsoLength = 1.4, armLength = 1.1, armThickness = 0.18,
    legLength = 1.3, legThickness = 0.28,
  } = characterConfig;

  // Resolved colors
  const cHead = headColor || mainColor;
  const cTorso = torsoColor || mainColor;
  const cLShoulder = leftShoulderColor || mainColor;
  const cLElbow = leftElbowColor || mainColor;
  const cLHand = leftHandColor || mainColor;
  const cRShoulder = rightShoulderColor || mainColor;
  const cRElbow = rightElbowColor || mainColor;
  const cRHand = rightHandColor || mainColor;
  const cLHip = leftHipColor || legColor;
  const cLKnee = leftKneeColor || legColor;
  const cLShoe = leftShoeColor || legColor;
  const cRHip = rightHipColor || legColor;
  const cRKnee = rightKneeColor || legColor;
  const cRShoe = rightShoeColor || legColor;

  // Auto-calculated spreads
  const bottomRadius = torsoRadius; // The waist/belly is the main reference for thickness
  const topRadius = Math.max(0.2, 0.75 + (torsoRadius - 0.75) * 0.25); // Shoulders don't get as fat

  const shoulderSpread = topRadius + armThickness * 0.95;
  const hipSpread = Math.max(bottomRadius * 0.45, legThickness * 0.98);
  const bellyAvoidAngle = Math.max(0, bottomRadius - shoulderSpread + armThickness * 0.95) * 1.2;

  const neckLength = 0.2;
  const neckThickness = 0.15;

  const shoeRadius = Math.min(legThickness * 1.15, hipSpread * 0.95);

  const devSettings = useStore(state => state.devSettings);
  const activeBoneName = useStore(state => state.activeBoneName);
  const activePoseSection = useStore(state => state.activePoseSection);
  const editingLoopId = useStore(state => state.editingLoopId);
  const isPulse = (bone: string) => (editingLoopId !== null) && (activePoseSection !== null) && activeBoneName === bone;
  const hasSlingshot = useStore(state => state.hasSlingshot);

  const shoulderY = torsoLength / 2;
  const hipY = -torsoLength / 2 - bottomRadius * 0.5;
  const neckY = torsoLength / 2 + topRadius * 0.8;
  
  // Generate smooth torso geometry (Lathed C1-continuous Capsule/Pear)
  const torsoGeometry = useMemo(() => {
    const L = torsoLength;
    const R1 = bottomRadius;
    const R2 = topRadius;
    const C1y = -L / 2;
    const C2y = L / 2;
    
    // alpha is the angle of the tangent to the horizontal
    const sinAlpha = Math.max(-1, Math.min(1, (R1 - R2) / L));
    const alpha = Math.asin(sinAlpha);
    
    const points = [];
    const capSegments = 24;
    
    // Bottom cap
    for (let i = 0; i <= capSegments; i++) {
        const t = i / capSegments;
        const theta = -Math.PI / 2 + t * (alpha + Math.PI / 2);
        points.push(new THREE.Vector2(R1 * Math.cos(theta), C1y + R1 * Math.sin(theta)));
    }
    
    // Top cap
    for (let i = 1; i <= capSegments; i++) {
        const t = i / capSegments;
        const theta = alpha + t * (Math.PI / 2 - alpha);
        points.push(new THREE.Vector2(R2 * Math.cos(theta), C2y + R2 * Math.sin(theta)));
    }
    
    points[0].x = 0;
    points[points.length - 1].x = 0;
    
    const geo = new THREE.LatheGeometry(points, 64);
    geo.computeVertexNormals();
    return geo;
  }, [topRadius, bottomRadius, torsoLength]);
  
  const decalAngle = Math.asin(Math.max(-1, Math.min(1, (bottomRadius - topRadius) / torsoLength)));

  const decalText = characterConfig.decalText ?? "Пееп\nPeepoff";
  const decalColor = characterConfig.decalColor ?? "#111827";
  const decalScaleMultiplier = characterConfig.decalScale ?? 1;
  const decalYFrontOffset = characterConfig.decalYFront ?? 0;
  const decalYBackOffset = characterConfig.decalYBack ?? 0;

  // Generate the "Peep" logo texture
  const peepTexture = useMemo(() => {
    return AssetManager.getOrCreateTexture(`peep-${decalText}-${decalColor}`, () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 300;
        const context = canvas.getContext('2d');
        if (context) {
        context.clearRect(0, 0, 512, 300);
        
        let fillShape = decalColor;
        if (decalColor.startsWith('linear-gradient')) {
            const matches = decalColor.match(/linear-gradient\([^,]+,\s*(#[a-fA-F0-9]+),\s*(#[a-fA-F0-9]+)\)/i);
            if (matches) {
            const grad = context.createLinearGradient(0, 0, 512, 300); // Top-left to bottom-right
            grad.addColorStop(0, matches[1]);
            grad.addColorStop(1, matches[2]);
            fillShape = grad as unknown as string;
            } else {
            fillShape = '#111827';
            }
        } else if (decalColor.startsWith('p')) {
            const fallbacks: Record<string, string> = {
            'p1': '#00ff00', 'p2': '#ffff00', 'p3': '#ff4500', 'p4': '#00ffff', 'p5': '#ff00ff',
            'p6': '#ff0000', 'p7': '#ff00ff', 'p8': '#555555', 'p9': '#aa8855', 'p10': '#333333'
            };
            fillShape = fallbacks[decalColor] || '#111827';
        }

        context.fillStyle = fillShape; // customizable text color
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const lines = decalText.split('\n');
        if (lines.length > 0) {
            context.font = '900 110px Inter, system-ui, sans-serif';
            context.fillText(lines[0], 256, 100);
        }
        if (lines.length > 1) {
            context.font = '800 50px Inter, system-ui, sans-serif';
            context.fillText(lines[1], 256, 190);
        }
        if (lines.length > 2) {
            context.font = '800 35px Inter, system-ui, sans-serif';
            context.fillText(lines[2], 256, 250);
        }
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.anisotropy = 16;
        return tex;
    });
  }, [decalText, decalColor]);

  // Generate the face texture based on emotion
  const faceTexture = useMemo(() => {
    return AssetManager.getOrCreateTexture(`face-${devSettings.emotion || 'smile'}`, () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        if (context) {
        context.clearRect(0, 0, 512, 512);
        
        const drawEye = (x: number, y: number) => {
            context.beginPath();
            context.arc(x, y, 30, 0, Math.PI * 2);
            context.fill();
            context.stroke();
        };
        
        context.lineWidth = 30;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.fillStyle = '#111827';
        context.strokeStyle = '#111827';

        const e = devSettings.emotion || 'smile';

        if (e === 'xd') {
            context.lineWidth = 25;
            // Left eye X (Center: 160, 200)
            context.beginPath(); context.moveTo(130, 170); context.lineTo(190, 230); context.stroke();
            context.beginPath(); context.moveTo(190, 170); context.lineTo(130, 230); context.stroke();
            // Right eye X (Center: 352, 200)
            context.beginPath(); context.moveTo(322, 170); context.lineTo(382, 230); context.stroke();
            context.beginPath(); context.moveTo(382, 170); context.lineTo(322, 230); context.stroke();
        } else if (e === 'cool') {
            // Sunglasses
            context.beginPath();
            context.moveTo(100, 180);
            context.lineTo(412, 180);
            context.lineTo(412, 220);
            context.lineTo(380, 250);
            context.lineTo(300, 250);
            context.lineTo(280, 200);
            context.lineTo(256, 200);
            context.lineTo(232, 200);
            context.lineTo(212, 250);
            context.lineTo(132, 250);
            context.lineTo(100, 220);
            context.closePath();
            context.fill();
        } else if (e === 'angry') {
            drawEye(160, 220);
            drawEye(352, 220);
            // Eyebrows
            context.lineWidth = 40;
            context.beginPath(); context.moveTo(110, 150); context.lineTo(210, 190); context.stroke();
            context.beginPath(); context.moveTo(402, 150); context.lineTo(302, 190); context.stroke();
        } else {
            // Normal eyes
            drawEye(160, 200);
            drawEye(352, 200);
        }

        // Mouth
        context.lineWidth = 30;
        if (e === 'surprised') {
            context.beginPath();
            context.arc(256, 360, 40, 0, Math.PI * 2);
            context.fill();
            context.stroke();
        } else if (e === 'sad') {
            context.beginPath();
            context.arc(256, 420, 60, Math.PI + 0.2, Math.PI * 2 - 0.2);
            context.stroke();
        } else if (e === 'xd') {
            // Big open smile
            context.beginPath();
            context.moveTo(160, 310);
            context.quadraticCurveTo(256, 460, 352, 310);
            context.closePath();
            context.fill();
        } else if (e === 'cool') {
            // smirk
            context.beginPath();
            context.moveTo(220, 350);
            context.lineTo(320, 330);
            context.stroke();
        } else {
            // Default smile
            context.beginPath();
            context.arc(256, 300, 70, 0.2, Math.PI - 0.2);
            context.stroke();
        }
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.anisotropy = 16;
        return tex;
    });
  }, [devSettings.emotion]);

  return (
    <group ref={characterGroupRef}>
      <BlobShadow parentRef={characterGroupRef} />
      <group ref={crouchGroupRef}>
        <group ref={visualGroupRef}>
          {/* TORSO PIVOT AT HIPS */}
          <group position={[0, hipY, 0]}>
            <group ref={spineRef}>
              <group position={[0, -hipY, 0]}>
                {/* TORSO */}
                <group>
                  {/* Seamless Tapered Torso */}
                  <mesh geometry={torsoGeometry}>
                    <PlasticMaterial color={cTorso} pulse={isPulse('spine')} />
                    
                    {/* FRONT LOGO */}
                    {characterConfig.decalFrontVisible !== false && (
                      <Decal 
                        position={[0, torsoLength * 0.15 + decalYFrontOffset, bottomRadius * 0.5 + topRadius * 0.5]} 
                        rotation={[-decalAngle, 0, 0]} 
                        scale={[bottomRadius * 1.4 * decalScaleMultiplier, torsoLength * 0.6 * decalScaleMultiplier, bottomRadius * 2]}
                      >
                        <meshStandardMaterial 
                          map={peepTexture} 
                          transparent 
                          polygonOffset 
                          polygonOffsetFactor={-1} 
                          roughness={0.4}
                        />
                      </Decal>
                    )}

                    {/* BACK LOGO */}
                    {characterConfig.decalBackVisible !== false && (
                      <Decal 
                        position={[0, torsoLength * 0.15 + decalYBackOffset, -(bottomRadius * 0.5 + topRadius * 0.5)]} 
                        rotation={[decalAngle, Math.PI, 0]} 
                        scale={[bottomRadius * 1.4 * decalScaleMultiplier, torsoLength * 0.6 * decalScaleMultiplier, bottomRadius * 2]}
                      >
                        <meshStandardMaterial 
                          map={peepTexture} 
                          transparent 
                          polygonOffset 
                          polygonOffsetFactor={-1} 
                          roughness={0.4}
                        />
                      </Decal>
                    )}
                  </mesh>
                </group>

        {/* NECK JOINT */}
        <group ref={neckRef} position={[0, neckY, 0]}>
          <mesh position={[0, neckLength / 2, 0]}>
            <capsuleGeometry args={[neckThickness, neckLength, 4, 8]} />
            <PlasticMaterial color={cHead} pulse={isPulse('neck')} />
          </mesh>

          {/* HEAD JOINT */}
          <group position={[0, neckLength + headSize * 0.8, 0]}>
            {characterConfig.headAccessory === 'h6' ? (
              <group>
                {/* Box (TV body) */}
                <mesh position={[0, headSize * 0.2, 0]}>
                  <boxGeometry args={[headSize * 2.2, headSize * 1.8, headSize * 2.0]} />
                  <PlasticMaterial color="#4b5563" pulse={isPulse('neck')} />
                </mesh>
                
                {/* Screen Face */}
                <mesh position={[0, headSize * 0.2, headSize * 1.01]}>
                  <planeGeometry args={[headSize * 1.8, headSize * 1.4]} />
                  <TVScreenMaterial />
                </mesh>

                {/* Antennas */}
                <mesh position={[-headSize * 0.5, headSize * 1.4, -headSize * 0.5]} rotation={[0, 0, 0.4]}>
                  <cylinderGeometry args={[headSize * 0.05, headSize * 0.05, headSize * 1.5, 8]} />
                  <PlasticMaterial color="#9ca3af" />
                </mesh>
                <mesh position={[headSize * 0.5, headSize * 1.4, -headSize * 0.5]} rotation={[0, 0, -0.4]}>
                  <cylinderGeometry args={[headSize * 0.05, headSize * 0.05, headSize * 1.5, 8]} />
                  <PlasticMaterial color="#9ca3af" />
                </mesh>
                
                {/* Antenna tips */}
                <mesh position={[-headSize * 0.8, headSize * 2.05, -headSize * 0.5]}>
                  <sphereGeometry args={[headSize * 0.15, 8, 8]} />
                  <PlasticMaterial color="#ef4444" />
                </mesh>
                <mesh position={[headSize * 0.8, headSize * 2.05, -headSize * 0.5]}>
                  <sphereGeometry args={[headSize * 0.15, 8, 8]} />
                  <PlasticMaterial color="#ef4444" />
                </mesh>
              </group>
            ) : characterConfig.headAccessory === 'h3' || devSettings.effectSkull ? (
              <group>
                <mesh>
                  <sphereGeometry args={[headSize, 16, 12]} />
                  <PlasticMaterial color="#f8f9fa" pulse={isPulse('neck')} />
                </mesh>
                {/* Panda Ears */}
                <mesh position={[-headSize * 0.75, headSize * 0.75, 0]}>
                  <sphereGeometry args={[headSize * 0.4, 16, 12]} />
                  <PlasticMaterial color="#111" />
                </mesh>
                <mesh position={[headSize * 0.75, headSize * 0.75, 0]}>
                  <sphereGeometry args={[headSize * 0.4, 16, 12]} />
                  <PlasticMaterial color="#111" />
                </mesh>
                {/* Panda Eye Patches */}
                <mesh position={[-headSize * 0.35, headSize * 0.1, headSize * 0.82]} rotation={[0, -0.2, -0.3]}>
                  <sphereGeometry args={[headSize * 0.3, 16, 12]} />
                  <meshBasicMaterial color="#111" />
                </mesh>
                <mesh position={[headSize * 0.35, headSize * 0.1, headSize * 0.82]} rotation={[0, 0.2, 0.3]}>
                  <sphereGeometry args={[headSize * 0.3, 16, 12]} />
                  <meshBasicMaterial color="#111" />
                </mesh>
                {/* Panda Pupils */}
                <mesh position={[-headSize * 0.35, headSize * 0.15, headSize * 1.05]}>
                  <sphereGeometry args={[headSize * 0.08, 8, 8]} />
                  <meshBasicMaterial color="#fff" />
                </mesh>
                <mesh position={[headSize * 0.35, headSize * 0.15, headSize * 1.05]}>
                  <sphereGeometry args={[headSize * 0.08, 8, 8]} />
                  <meshBasicMaterial color="#fff" />
                </mesh>
                {/* Panda Nose */}
                <mesh position={[0, -headSize * 0.15, headSize * 0.98]}>
                  <sphereGeometry args={[headSize * 0.12, 16, 12]} />
                  <meshBasicMaterial color="#111" />
                </mesh>
                {/* Panda Mouth (small smile) */}
                <mesh 
                  position={[0, -headSize * 0.25, headSize * 0.98]} 
                  rotation={[0, 0, Math.PI]}
                >
                  <torusGeometry args={[headSize * 0.15, headSize * 0.03, 8, 16, Math.PI]} />
                  <meshBasicMaterial color="#111" />
                </mesh>
              </group>
            ) : (
              <mesh>
                <sphereGeometry args={[headSize, 32, 32]} />
                <PlasticMaterial color={cHead} pulse={isPulse('neck')} />
                {/* FACE DECAL instead of 3d primitives */}
                {characterConfig.headAccessory !== 'h3' && !devSettings.effectSkull && (
                  <Decal 
                    position={[0, 0, headSize]} 
                    rotation={[0, 0, 0]} 
                    scale={[headSize * 2, headSize * 2, headSize * 2.5]}
                  >
                    <meshStandardMaterial 
                      map={faceTexture} 
                      transparent 
                      polygonOffset 
                      polygonOffsetFactor={-1} 
                    />
                  </Decal>
                )}
              </mesh>
            )}

            {/* Hat (h1) */}
            {characterConfig.headAccessory === 'h1' && (
              <group position={[0, headSize * 0.6, 0]} rotation={[0.1, 0, 0]}>
                {/* Rim */}
                <mesh position={[0, 0, 0]}>
                   <cylinderGeometry args={[headSize * 1.6, headSize * 1.6, headSize * 0.1, 16]}/>
                   <PlasticMaterial color="#222" />
                </mesh>
                {/* Top */}
                <mesh position={[0, headSize * 0.7, 0]}>
                   <cylinderGeometry args={[headSize * 0.9, headSize * 1.0, headSize * 1.4, 16]}/>
                   <PlasticMaterial color="#222" />
                </mesh>
                {/* Ribbon */}
                <mesh position={[0, headSize * 0.15, 0]}>
                   <cylinderGeometry args={[headSize * 1.05, headSize * 1.05, headSize * 0.3, 16]}/>
                   <PlasticMaterial color="#dc2626" />
                </mesh>
              </group>
            )}

            {/* Clown (h2) - nose and hair */}
            {characterConfig.headAccessory === 'h2' && (
              <group position={[0, 0, 0]}>
                 {/* Clown Nose */}
                 <mesh position={[0, 0, headSize]}>
                   <sphereGeometry args={[headSize * 0.3, 32, 32]} />
                   <PlasticMaterial color="#ef4444" pulse={false} />
                 </mesh>
                 {/* Left Hair */}
                 <mesh position={[-headSize * 1.1, headSize * 0.2, -headSize * 0.2]}>
                   <sphereGeometry args={[headSize * 0.7, 16, 16]} />
                   <PlasticMaterial color="#f97316" pulse={false} />
                 </mesh>
                 {/* Right Hair */}
                 <mesh position={[headSize * 1.1, headSize * 0.2, -headSize * 0.2]}>
                   <sphereGeometry args={[headSize * 0.7, 16, 16]} />
                   <PlasticMaterial color="#f97316" pulse={false} />
                 </mesh>
                 {/* Back Hair */}
                 <mesh position={[0, headSize * 0.2, -headSize * 1.1]}>
                   <sphereGeometry args={[headSize * 0.7, 16, 16]} />
                   <PlasticMaterial color="#f97316" pulse={false} />
                 </mesh>
              </group>
            )}

            {/* Halo (h4) */}
            {(characterConfig.headAccessory === 'h4' || devSettings.effectHalo) && (
              <mesh position={[0, headSize * 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[headSize * 0.8, headSize * 0.1, 16, 32]} />
                <PlasticMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={2} />
              </mesh>
            )}

            {/* Crown (h5) */}
            {characterConfig.headAccessory === 'h5' && (
              <group position={[0, headSize * 0.8, 0]} rotation={[-0.1, 0, 0]}>
                <mesh position={[0, headSize * 0.25, 0]}>
                  <cylinderGeometry args={[headSize * 0.9, headSize * 0.7, headSize * 0.6, 8, 1, false]} />
                  <PlasticMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={0.2} />
                </mesh>
                {Array.from({length: 8}).map((_, i) => {
                   const angle = (i / 8) * Math.PI * 2;
                   const x = Math.cos(angle) * headSize * 0.8;
                   const z = Math.sin(angle) * headSize * 0.8;
                   return (
                   <mesh key={i} position={[x, headSize * 0.65, z]}>
                     <sphereGeometry args={[headSize * 0.15, 8, 8]} />
                     <PlasticMaterial color="#ef4444" />
                   </mesh>
                   )
                })}
              </group>
            )}


            
          </group>
        </group>

        {/* LEFT ARM JOINT */}
        {/* Left shoulder bridge (tapered socket) */}
        <mesh position={[-shoulderSpread + (shoulderSpread - topRadius * 0.5) / 2, shoulderY, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.08, Math.max(0.01, shoulderSpread - topRadius * 0.5), 16]} />
          <PlasticMaterial color={cTorso} pulse={isPulse('spine')} />
        </mesh>
        <group ref={leftShoulderRef} position={[-shoulderSpread, shoulderY, 0]}>
          <group rotation={[0, 0, -bellyAvoidAngle]}>
          {/* Stylish Shoulder Pad */}
          <group position={[0, 0.02, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.1, 0.05, 8, 16]} />
              <PlasticMaterial color={cLShoulder} pulse={isPulse('leftShoulder')} />
            </mesh>
          </group>
          <mesh>
            <sphereGeometry args={[armThickness, 16, 16]} />
            <PlasticMaterial color={cLShoulder} pulse={isPulse('leftShoulder')} />
          </mesh>
          <mesh position={[0, -armLength / 2, 0]}>
            <cylinderGeometry args={[armThickness, armThickness, armLength, 16]} />
            <PlasticMaterial color={cLShoulder} pulse={isPulse('leftShoulder')} />
          </mesh>
          <group ref={leftElbowRef} position={[0, -armLength, 0]}>
            <group rotation={[0, 0, bellyAvoidAngle * 0.8]}>
              <mesh>
                <sphereGeometry args={[armThickness, 16, 16]} />
                <PlasticMaterial color={cLElbow} pulse={isPulse('leftElbow')} />
              </mesh>
              <mesh position={[0, -armLength / 2, 0]}>
                <cylinderGeometry args={[armThickness, armThickness, armLength, 16]} />
                <PlasticMaterial color={cLElbow} pulse={isPulse('leftElbow')} />
              </mesh>
              <mesh position={[0, -armLength, 0]}>
                <sphereGeometry args={[armThickness, 16, 16]} />
                <PlasticMaterial color={cLElbow} pulse={isPulse('leftElbow')} />
              </mesh>
              {/* Hand Area (Wrist) */}
              <group ref={leftWristRef} position={[0, -armLength - armThickness * 0.5, 0]}>
                <mesh>
                  <sphereGeometry args={[(armThickness * 1.15) / 2, 8, 8]} />
                  <PlasticMaterial color={cLHand} pulse={isPulse('leftWrist')} />
                </mesh>
                {/* Hand */}
                <group position={[0, -armThickness * 0.7, 0]}>
                  <mesh>
                    <sphereGeometry args={[armThickness * 1.4, 8, 8]} />
                    <PlasticMaterial color={cLHand} pulse={isPulse('leftWrist')} />
                  </mesh>
                  {/* Thumb */}
                  <mesh position={[armThickness * 1.2, armThickness * 0.5, armThickness * 0.8]}>
                    <sphereGeometry args={[(armThickness * 1.4) / 4, 8, 8]} />
                    <PlasticMaterial color={cLHand} pulse={isPulse('leftWrist')} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>
          </group>
        </group>

        {/* RIGHT ARM JOINT */}
        {/* Right shoulder bridge (tapered socket) */}
        <mesh position={[shoulderSpread - (shoulderSpread - topRadius * 0.5) / 2, shoulderY, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.08, Math.max(0.01, shoulderSpread - topRadius * 0.5), 16]} />
          <PlasticMaterial color={cTorso} pulse={isPulse('spine')} />
        </mesh>
        <group ref={rightShoulderRef} position={[shoulderSpread, shoulderY, 0]}>
          <group rotation={[0, 0, bellyAvoidAngle]}>
          {/* Stylish Shoulder Pad */}
          <group position={[0, 0.02, 0]}>
            <mesh rotation={[0, 0, -Math.PI / 2]}>
              <capsuleGeometry args={[0.1, 0.05, 8, 16]} />
              <PlasticMaterial color={cRShoulder} pulse={isPulse('rightShoulder')} />
            </mesh>
          </group>
          <mesh>
            <sphereGeometry args={[armThickness, 16, 16]} />
            <PlasticMaterial color={cRShoulder} pulse={isPulse('rightShoulder')} />
          </mesh>
          <mesh position={[0, -armLength / 2, 0]}>
            <cylinderGeometry args={[armThickness, armThickness, armLength, 16]} />
            <PlasticMaterial color={cRShoulder} pulse={isPulse('rightShoulder')} />
          </mesh>
          <group ref={rightElbowRef} position={[0, -armLength, 0]}>
            <group rotation={[0, 0, -bellyAvoidAngle * 0.8]}>
              <mesh>
                <sphereGeometry args={[armThickness, 16, 16]} />
                <PlasticMaterial color={cRElbow} pulse={isPulse('rightElbow')} />
              </mesh>
              <mesh position={[0, -armLength / 2, 0]}>
                <cylinderGeometry args={[armThickness, armThickness, armLength, 16]} />
                <PlasticMaterial color={cRElbow} pulse={isPulse('rightElbow')} />
              </mesh>
              <mesh position={[0, -armLength, 0]}>
                <sphereGeometry args={[armThickness, 16, 16]} />
                <PlasticMaterial color={cRElbow} pulse={isPulse('rightElbow')} />
              </mesh>
              {/* Hand Area (Wrist) */}
              <group ref={rightWristRef} position={[0, -armLength - armThickness * 0.5, 0]}>
                <mesh>
                  <sphereGeometry args={[(armThickness * 1.15) / 2, 8, 8]} />
                  <PlasticMaterial color={cRHand} pulse={isPulse('rightWrist')} />
                </mesh>
                {/* Hand */}
                <group position={[0, -armThickness * 0.7, 0]}>
                  <mesh>
                    <sphereGeometry args={[armThickness * 1.4, 8, 8]} />
                    <PlasticMaterial color={cRHand} pulse={isPulse('rightWrist')} />
                  </mesh>
                  {/* Thumb */}
                  <mesh position={[-armThickness * 1.2, armThickness * 0.5, armThickness * 0.8]}>
                    <sphereGeometry args={[(armThickness * 1.4) / 4, 8, 8]} />
                    <PlasticMaterial color={cRHand} pulse={isPulse('rightWrist')} />
                  </mesh>

                  {/* Slingshot */}
                  {hasSlingshot && (
                    <group position={[0, -armThickness * 0.5, armThickness * 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
                      {/* Handle */}
                      <mesh position={[0, -0.3, 0]}>
                        <cylinderGeometry args={[0.03, 0.03, 0.6]} />
                        <meshStandardMaterial color="#8B4513" />
                      </mesh>
                      {/* Left prong */}
                      <mesh position={[-0.15, 0.2, 0]} rotation={[0, 0, Math.PI / 6]}>
                        <cylinderGeometry args={[0.03, 0.03, 0.4]} />
                        <meshStandardMaterial color="#8B4513" />
                      </mesh>
                      {/* Right prong */}
                      <mesh position={[0.15, 0.2, 0]} rotation={[0, 0, -Math.PI / 6]}>
                        <cylinderGeometry args={[0.03, 0.03, 0.4]} />
                        <meshStandardMaterial color="#8B4513" />
                      </mesh>
                    </group>
                  )}
                </group>
              </group>
            </group>
          </group>
          </group>
        </group>
              </group>

              {/* SPARKLES EFFECT */}
              {devSettings.effectSparkles && (
                <Sparkles 
                  position={[0, torsoLength / 2, 0]} 
                  count={50} 
                  scale={3} 
                  size={4} 
                  speed={0.4} 
                  color="#c084fc" 
                  opacity={0.8}
                />
              )}

              {/* HEARTS EFFECT */}
              {devSettings.effectHearts && (
                <group position={[0, torsoLength + 1, 0]}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Text
                      key={i}
                      position={[
                        Math.sin(i * Math.PI * 0.4) * 1.5, 
                        Math.cos(i * Math.PI * 0.4) * 0.5 + Math.sin(Date.now() / 500 + i) * 0.5, 
                        Math.cos(i * Math.PI * 0.4) * 1.5
                      ]}
                      fontSize={0.5}
                      color="#ec4899"
                      rotation={[0, Date.now() / 1000 + i, 0]}
                    >
                      ❤️
                    </Text>
                  ))}
                </group>
              )}
            </group>
          </group>

        {/* LEFT LEG JOINT */}
        {/* Left hip bridge (tapered socket) */}
        <mesh position={[-hipSpread + (hipSpread - bottomRadius * 0.4) / 2, hipY, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.08, Math.max(0.01, hipSpread - bottomRadius * 0.4), 16]} />
          <PlasticMaterial color={cTorso} pulse={isPulse('spine')} />
        </mesh>
        <group ref={leftHipRef} position={[-hipSpread, hipY, 0]}>
          {/* Stylish Hip Pad */}
          <group position={[0, 0.02, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.1, 0.05, 8, 16]} />
              <PlasticMaterial color={cLHip} pulse={isPulse('leftHip')} />
            </mesh>
          </group>
          <mesh>
            <sphereGeometry args={[legThickness, 16, 16]} />
            <PlasticMaterial color={cLHip} pulse={isPulse('leftHip')} />
          </mesh>
          <mesh position={[0, -legLength / 2, 0]}>
            <cylinderGeometry args={[legThickness, legThickness, legLength, 16]} />
            <PlasticMaterial color={cLHip} pulse={isPulse('leftHip')} />
          </mesh>
          <group ref={leftKneeRef} position={[0, -legLength, 0]}>
            <mesh>
              <sphereGeometry args={[legThickness, 16, 16]} />
              <PlasticMaterial color={cLKnee} pulse={isPulse('leftKnee')} />
            </mesh>
            <mesh position={[0, -legLength / 2, 0]}>
              <cylinderGeometry args={[legThickness, legThickness, legLength, 16]} />
              <PlasticMaterial color={cLKnee} pulse={isPulse('leftKnee')} />
            </mesh>
            <mesh position={[0, -legLength, 0]}>
              <sphereGeometry args={[legThickness, 16, 16]} />
              <PlasticMaterial color={cLKnee} pulse={isPulse('leftKnee')} />
            </mesh>
            <mesh position={[0, -legLength - legThickness * 0.8, 0]}>
              <cylinderGeometry args={[shoeRadius, shoeRadius, legThickness * 0.6, 12]} />
              <PlasticMaterial color={cLShoe} pulse={isPulse('leftAnkle')} />
            </mesh>
          </group>
        </group>

        {/* RIGHT LEG JOINT */}
        {/* Right hip bridge (tapered socket) */}
        <mesh position={[hipSpread - (hipSpread - bottomRadius * 0.4) / 2, hipY, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.08, Math.max(0.01, hipSpread - bottomRadius * 0.4), 16]} />
          <PlasticMaterial color={cTorso} pulse={isPulse('spine')} />
        </mesh>
        <group ref={rightHipRef} position={[hipSpread, hipY, 0]}>
          {/* Stylish Hip Pad */}
          <group position={[0, 0.02, 0]}>
            <mesh rotation={[0, 0, -Math.PI / 2]}>
              <capsuleGeometry args={[0.1, 0.05, 8, 16]} />
              <PlasticMaterial color={cRHip} pulse={isPulse('rightHip')} />
            </mesh>
          </group>
          <mesh>
            <sphereGeometry args={[legThickness, 16, 16]} />
            <PlasticMaterial color={cRHip} pulse={isPulse('rightHip')} />
          </mesh>
          <mesh position={[0, -legLength / 2, 0]}>
            <cylinderGeometry args={[legThickness, legThickness, legLength, 16]} />
            <PlasticMaterial color={cRHip} pulse={isPulse('rightHip')} />
          </mesh>
          <group ref={rightKneeRef} position={[0, -legLength, 0]}>
            <mesh>
              <sphereGeometry args={[legThickness, 16, 16]} />
              <PlasticMaterial color={cRKnee} pulse={isPulse('rightKnee')} />
            </mesh>
            <mesh position={[0, -legLength / 2, 0]}>
              <cylinderGeometry args={[legThickness, legThickness, legLength, 16]} />
              <PlasticMaterial color={cRKnee} pulse={isPulse('rightKnee')} />
            </mesh>
            <mesh position={[0, -legLength, 0]}>
              <sphereGeometry args={[legThickness, 16, 16]} />
              <PlasticMaterial color={cRKnee} pulse={isPulse('rightKnee')} />
            </mesh>
            <mesh position={[0, -legLength - legThickness * 0.8, 0]}>
              <cylinderGeometry args={[shoeRadius, shoeRadius, legThickness * 0.6, 12]} />
              <PlasticMaterial color={cRShoe} pulse={isPulse('rightAnkle')} />
            </mesh>
          </group>
        </group>
      </group>
      </group>
    </group>
  );
};

export default PeepCharacter;
