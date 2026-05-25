import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import * as THREE from 'three';
import { vibrate } from '../../lib/haptics';

export const VirtualJoystick: React.FC = () => {
  const devSettings = useStore(state => state.devSettings);
  const updateDevSettings = useStore(state => state.updateDevSettings);
  const activeBoneName = useStore(state => state.activeBoneName);
  const isTwistMode = useStore(state => state.isTwistMode);
  const editingLoopId = useStore(state => state.editingLoopId);
  const setHasInteractedJoystick = useStore(state => state.setHasInteractedJoystick);

  const isMicroMode = editingLoopId !== null;

  const [joystickData, setJoystickData] = useState<{ x: number, y: number, cx: number, cy: number } | null>(null);
  const initialRotationRef = useRef<THREE.Euler | null>(null);
  const lastVibratePosRef = useRef<{x: number, y: number} | null>(null);

  // Constants
  const MAX_RADIUS = 60;
  const SENSITIVITY = 1.5; // Max rotation in radians per drag (Halved for precision)
  const VIBRATE_STEP = MAX_RADIUS / 10; // Trigger vibration every 6 pixels of movement

  const getBoneRotationAxes = (bone: string) => {
    switch(bone) {
      case 'movement': return { x: 'rootPositionX', y: 'rootPositionY', z: 'rootPositionZ' };
      case 'root': return { x: 'nonExistent', y: 'rootRotationY', z: 'nonExistent' };
      case 'spine': return { x: 'spineAngleX', y: 'spineAngleY', z: 'spineAngleZ' };
      case 'neck': return { x: 'neckAngleX', y: 'neckAngleY', z: 'neckAngleZ' };
      case 'leftShoulder': return { x: 'leftShoulderAngleX', y: 'leftShoulderAngleY', z: 'leftShoulderAngleZ' };
      case 'leftElbow': return { x: 'leftElbowAngleX', y: 'leftElbowAngleY', z: 'leftElbowAngleZ' };
      case 'leftWrist': return { x: 'leftWristAngleX', y: 'leftWristAngleY', z: 'leftWristAngleZ' };
      case 'rightShoulder': return { x: 'rightShoulderAngleX', y: 'rightShoulderAngleY', z: 'rightShoulderAngleZ' };
      case 'rightElbow': return { x: 'rightElbowAngleX', y: 'rightElbowAngleY', z: 'rightElbowAngleZ' };
      case 'rightWrist': return { x: 'rightWristAngleX', y: 'rightWristAngleY', z: 'rightWristAngleZ' };
      case 'leftHip': return { x: 'leftHipAngleX', y: 'leftHipAngleY', z: 'leftHipAngleZ' };
      case 'leftKnee': return { x: 'leftKneeAngleX', y: 'leftKneeAngleY', z: 'leftKneeAngleZ' };
      case 'leftAnkle': return { x: 'leftAnkleAngleX', y: 'leftAnkleAngleY', z: 'leftAnkleAngleZ' };
      case 'rightHip': return { x: 'rightHipAngleX', y: 'rightHipAngleY', z: 'rightHipAngleZ' };
      case 'rightKnee': return { x: 'rightKneeAngleX', y: 'rightKneeAngleY', z: 'rightKneeAngleZ' };
      case 'rightAnkle': return { x: 'rightAnkleAngleX', y: 'rightAnkleAngleY', z: 'rightAnkleAngleZ' };
      default: return null;
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isMicroMode || !activeBoneName) return;

    setHasInteractedJoystick(true);

    // Optional: Make sure we didn't tap on UI. This element is fixed inset-0 z-30,
    // so any z-40+ UI will block this event anyway.
    (e.target as Element).setPointerCapture?.(e.pointerId);

    const ax = getBoneRotationAxes(activeBoneName);
    if (!ax) return;

    const s = useStore.getState().devSettings;
    const euler = new THREE.Euler(
      (s[ax.x as keyof typeof s] as number) || 0,
      (s[ax.y as keyof typeof s] as number) || 0,
      (s[ax.z as keyof typeof s] as number) || 0,
      'XYZ'
    );
    (euler as any).yawOffset = s.rootRotationY || 0;
    initialRotationRef.current = euler;
    lastVibratePosRef.current = { x: 0, y: 0 };

    setJoystickData({
      cx: e.clientX,
      cy: e.clientY,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!joystickData || !initialRotationRef.current || !activeBoneName) return;

    let dx = e.clientX - joystickData.cx;
    let dy = e.clientY - joystickData.cy;

    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > MAX_RADIUS) {
      dx = (dx / distance) * MAX_RADIUS;
      dy = (dy / distance) * MAX_RADIUS;
    }

    setJoystickData(prev => prev ? { ...prev, x: prev.cx + dx, y: prev.cy + dy } : null);

    // Haptic feedback logic
    if (lastVibratePosRef.current) {
      const deltaFromLastVibrate = Math.sqrt(
        Math.pow(dx - lastVibratePosRef.current.x, 2) + Math.pow(dy - lastVibratePosRef.current.y, 2)
      );

      if (deltaFromLastVibrate > VIBRATE_STEP) {
        // We moved enough to trigger a tick
        if (distance < MAX_RADIUS * 0.1) {
          // Nearly center (zero ideal) - strong hit
          vibrate(20);
        } else {
          // Gradient based on distance from center (farther = weaker vibration)
          // 20ms to 2ms
          const ratio = distance / MAX_RADIUS;
          const duration = Math.max(2, Math.floor(20 - ratio * 18));
          vibrate(duration);
        }
        lastVibratePosRef.current = { x: dx, y: dy };
      }
    }

    const ax = getBoneRotationAxes(activeBoneName);
    if (!ax) return;

    // Normalizing -1 to 1 based on screen delta
    const normalizedX = dx / MAX_RADIUS;
    const normalizedY = dy / MAX_RADIUS;
    
    if (activeBoneName === 'movement') {
       // Direct translation
       const updates: any = {};
       const MOVEMENT_SPEED = 2.5; // Control speed properly (Halved for precision)
       
       if (!isTwistMode) {
           // Normal mode: Forward/Backward (Z), Left/Right (X)
           let newZ = initialRotationRef.current.z + (normalizedY * MOVEMENT_SPEED);
           let newX = initialRotationRef.current.x + (normalizedX * MOVEMENT_SPEED);
           
           // Clamp to invisible wall (radius 4.5)
           const distance = Math.sqrt(newX * newX + newZ * newZ);
           if (distance > 4.5) {
             newX = (newX / distance) * 4.5;
             newZ = (newZ / distance) * 4.5;
           }

           if (ax.z !== 'nonExistent') updates[ax.z] = newZ;
           if (ax.x !== 'nonExistent') updates[ax.x] = newX;
       } else {
           // Twist mode (Rotate): Up/Down Altitude (Y) + Yaw Spin (Root Rotation Y)
           if (ax.y !== 'nonExistent') {
               // Negative dy (pulling up) means we want the character to fly UP, so we subtract normalizedY.
               const newY = initialRotationRef.current.y - (normalizedY * MOVEMENT_SPEED);
               updates[ax.y] = Math.max(0, Math.min(1.5, newY));
           }
           
           // Fallback, we modify rootRotationY for twisting horizontally
           updates.rootRotationY = (initialRotationRef.current as any).yawOffset + (normalizedX * SENSITIVITY);
       }
       
       updateDevSettings(updates);
       return;
    }

    // Default: Delta Y = Pitch (local X), Delta X = Yaw/Twist (local Y)
    // Twist mode: Delta X = Roll (local Z or local Y if it's an arm, let's map Roll to Z).
    let rotX = 0;
    let rotY = 0;
    let rotZ = 0;

    if (isTwistMode) {
      // Rotate around the local twist axis (we map Roll to Z by default, or Y if root)
      rotZ = normalizedX * SENSITIVITY;
      rotX = normalizedY * SENSITIVITY; // Optionally add pitch back
    } else {
      rotX = normalizedY * SENSITIVITY; // Pitch
      rotY = normalizedX * SENSITIVITY; // Yaw
    }

    const deltaQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(rotX, rotY, rotZ, 'XYZ'));
    const startQuat = new THREE.Quaternion().setFromEuler(initialRotationRef.current);
    const resultQuat = startQuat.clone().multiply(deltaQuat);
    // Convert back to Euler
    const resultEuler = new THREE.Euler().setFromQuaternion(resultQuat, 'XYZ');

    const updates: any = {};
    if (ax.x !== 'nonExistent') updates[ax.x] = resultEuler.x;
    if (ax.y !== 'nonExistent') updates[ax.y] = resultEuler.y;
    if (ax.z !== 'nonExistent') updates[ax.z] = resultEuler.z;

    updateDevSettings(updates);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    // Save to history when drag finishes
    if (joystickData) {
      useStore.getState().pushHistory(useStore.getState().devSettings);
    }
    setJoystickData(null);
    initialRotationRef.current = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  if (!isMicroMode) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[25] touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
      {joystickData && (
        <div 
          className="fixed z-[60] pointer-events-none rounded-full border-[3px] border-black bg-black/80 shadow-[0_2px_0_0_#000]"
          style={{
            left: joystickData.cx - MAX_RADIUS,
            top: joystickData.cy - MAX_RADIUS,
            width: MAX_RADIUS * 2,
            height: MAX_RADIUS * 2,
          }}
        >
          <div 
            className="absolute rounded-full bg-[#8b5cf6] border-[3px] border-black shadow-[0_2px_0_0_#000]"
            style={{
              left: (joystickData.x - joystickData.cx) + MAX_RADIUS - 16,
              top: (joystickData.y - joystickData.cy) + MAX_RADIUS - 16,
              width: 32,
              height: 32,
            }}
          />
        </div>
      )}
    </>
  );
};

