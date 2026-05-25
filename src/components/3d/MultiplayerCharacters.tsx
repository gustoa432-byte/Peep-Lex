import React, { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { remoteState } from '../../lib/multiplayerState';
import { BlobShadow } from './PeepCharacter';
import { useRemoteKinematics } from '../../hooks/useRemoteKinematics';
import { PlasticMaterial } from './materials/PlasticMaterial';

// Component for a single remote player
const RemotePlayer = ({ id, config }: { id: string, config: any }) => {
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
  } = useRemoteKinematics(id);

  const {
    mainColor = '#F4C430', legColor = '#E34234', headSize = 0.65,
    headColor, torsoColor,
    leftShoulderColor, leftElbowColor, leftHandColor,
    rightShoulderColor, rightElbowColor, rightHandColor,
    leftHipColor, leftKneeColor, leftShoeColor,
    rightHipColor, rightKneeColor, rightShoeColor,
    torsoRadius = 0.75, torsoLength = 1.4, armLength = 1.1, armThickness = 0.18,
    legLength = 1.3, legThickness = 0.28,
  } = config || {};

  // Resolved colors
  const cHead = headColor || mainColor;
  const cTorso = torsoColor || mainColor;
  const cLS = leftShoulderColor || mainColor;
  const cLE = leftElbowColor || mainColor;
  const cLH = leftHandColor || mainColor;
  const cRS = rightShoulderColor || mainColor;
  const cRE = rightElbowColor || mainColor;
  const cRH = rightHandColor || mainColor;
  const cLHip = leftHipColor || legColor;
  const cLKnee = leftKneeColor || legColor;
  const cLShoe = leftShoeColor || '#111827';
  const cRHip = rightHipColor || legColor;
  const cRKnee = rightKneeColor || legColor;
  const cRShoe = rightShoeColor || '#111827';

  // Body metrics
  const defaultLegLength = 1.3;
  const defaultTorsoLength = 1.4;
  const scaleLeg = legLength / defaultLegLength;
  const scaleTorso = torsoLength / defaultTorsoLength;
  const halfTorso = torsoLength / 2;
  const hipY = legLength;
  const lowerLegLength = legLength / 2;

  // Reusable Geometries
  const torsoGeometry = useMemo(() => new THREE.CylinderGeometry(torsoRadius, torsoRadius * 0.9, torsoLength, 16), [torsoRadius, torsoLength]);
  const defaultJointGeo = useMemo(() => new THREE.SphereGeometry(armThickness * 1.15, 16, 16), [armThickness]);
  const armLimbGeo = useMemo(() => new THREE.CylinderGeometry(armThickness, armThickness * 0.9, armLength / 2, 12), [armThickness, armLength]);
  const handGeo = useMemo(() => new THREE.SphereGeometry(armThickness * 1.3, 16, 16), [armThickness]);
  const legJointGeo = useMemo(() => new THREE.SphereGeometry(legThickness * 1.15, 16, 16), [legThickness]);
  const legLimbGeo = useMemo(() => new THREE.CylinderGeometry(legThickness, legThickness * 0.9, lowerLegLength, 12), [legThickness, lowerLegLength]);
  const shoeGeo = useMemo(() => new THREE.BoxGeometry(legThickness * 2.5, 0.4, legThickness * 3.5), [legThickness]);
  const headGeo = useMemo(() => new THREE.BoxGeometry(1.4 * headSize, 1.4 * headSize, 1.4 * headSize), [headSize]);

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
                  <mesh geometry={torsoGeometry}>
                    <PlasticMaterial color={cTorso} />
                  </mesh>

                  {/* NECK / HEAD (Pivot at top of torso) */}
                  <group position={[0, halfTorso - 0.1, 0]}>
                    <group ref={neckRef}>
                      <mesh geometry={headGeo} position={[0, 0.7 * headSize, 0]}>
                        <PlasticMaterial color={cHead} />
                      </mesh>
                    </group>
                  </group>
                </group>

                {/* LEFT ARM */}
                <group position={[torsoRadius, halfTorso - 0.2, 0]}>
                  <group ref={leftShoulderRef}>
                    <mesh geometry={defaultJointGeo}><PlasticMaterial color={cLS} /></mesh>
                    <mesh geometry={armLimbGeo} position={[armThickness * 0.5, -armLength / 4, 0]} rotation={[0, 0, Math.PI / 12]}>
                      <PlasticMaterial color={cLS} />
                    </mesh>
                    <group position={[armThickness * 0.9, -armLength / 2, 0]}>
                      <group ref={leftElbowRef}>
                        <mesh geometry={defaultJointGeo}><PlasticMaterial color={cLE} /></mesh>
                        <mesh geometry={armLimbGeo} position={[0, -armLength / 4, 0]}>
                          <PlasticMaterial color={cLE} />
                        </mesh>
                        <group position={[0, -armLength / 2, 0]}>
                            <group ref={leftWristRef}>
                                <mesh geometry={handGeo}><PlasticMaterial color={cLH} /></mesh>
                            </group>
                        </group>
                      </group>
                    </group>
                  </group>
                </group>

                {/* RIGHT ARM */}
                <group position={[-torsoRadius, halfTorso - 0.2, 0]}>
                  <group ref={rightShoulderRef}>
                    <mesh geometry={defaultJointGeo}><PlasticMaterial color={cRS} /></mesh>
                    <mesh geometry={armLimbGeo} position={[-armThickness * 0.5, -armLength / 4, 0]} rotation={[0, 0, -Math.PI / 12]}>
                      <PlasticMaterial color={cRS} />
                    </mesh>
                    <group position={[-armThickness * 0.9, -armLength / 2, 0]}>
                      <group ref={rightElbowRef}>
                        <mesh geometry={defaultJointGeo}><PlasticMaterial color={cRE} /></mesh>
                        <mesh geometry={armLimbGeo} position={[0, -armLength / 4, 0]}>
                          <PlasticMaterial color={cRE} />
                        </mesh>
                        <group position={[0, -armLength / 2, 0]}>
                            <group ref={rightWristRef}>
                                <mesh geometry={handGeo}><PlasticMaterial color={cRH} /></mesh>
                            </group>
                        </group>
                      </group>
                    </group>
                  </group>
                </group>

              </group>
            </group>
          </group>

          {/* LEFT LEG (Pivot at hip) */}
          <group position={[torsoRadius * 0.4, hipY, 0]}>
            <group ref={leftHipRef}>
              <mesh geometry={legJointGeo}><PlasticMaterial color={cLHip} /></mesh>
              <mesh geometry={legLimbGeo} position={[0, -lowerLegLength / 2, 0]}>
                <PlasticMaterial color={cLHip} />
              </mesh>
              <group position={[0, -lowerLegLength, 0]}>
                <group ref={leftKneeRef}>
                  <mesh geometry={legJointGeo}><PlasticMaterial color={cLKnee} /></mesh>
                  <mesh geometry={legLimbGeo} position={[0, -lowerLegLength / 2, 0]}>
                    <PlasticMaterial color={cLKnee} />
                  </mesh>
                  <mesh geometry={shoeGeo} position={[0, -lowerLegLength, 0.2]}>
                    <PlasticMaterial color={cLShoe} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>

          {/* RIGHT LEG */}
          <group position={[-torsoRadius * 0.4, hipY, 0]}>
            <group ref={rightHipRef}>
              <mesh geometry={legJointGeo}><PlasticMaterial color={cRHip} /></mesh>
              <mesh geometry={legLimbGeo} position={[0, -lowerLegLength / 2, 0]}>
                <PlasticMaterial color={cRHip} />
              </mesh>
              <group position={[0, -lowerLegLength, 0]}>
                <group ref={rightKneeRef}>
                  <mesh geometry={legJointGeo}><PlasticMaterial color={cRKnee} /></mesh>
                  <mesh geometry={legLimbGeo} position={[0, -lowerLegLength / 2, 0]}>
                    <PlasticMaterial color={cRKnee} />
                  </mesh>
                  <mesh geometry={shoeGeo} position={[0, -lowerLegLength, 0.2]}>
                    <PlasticMaterial color={cRShoe} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

export const MultiplayerCharacters = () => {
  const otherPlayers = useStore(state => state.otherPlayers);

  return (
    <group>
      {otherPlayers.map(p => (
        <RemotePlayer key={p.id} id={p.id} config={p.config} />
      ))}
    </group>
  );
};
