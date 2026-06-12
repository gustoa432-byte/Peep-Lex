import React, { useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { inputState } from '../../store/inputState';
import { CharacterController } from '../../managers/CharacterController';
import { useStore } from '../../store/useStore';

interface ScriptRunnerProps {
  script?: string;
  targetRef: React.RefObject<THREE.Object3D>;
}

export const ScriptRunner: React.FC<ScriptRunnerProps> = ({ script, targetRef }) => {
  const customScriptRef = useRef<((Peep: any, dt: number) => void) | null>(null);

  // 1. Собираем API один раз! Никаких аллокаций памяти в useFrame.
  const PeepAPI = useMemo(() => {
    return {
      self: {
        // Используем геттеры, чтобы всегда получать актуальные координаты меша
        getPosition: () => targetRef.current?.position,
        getRotation: () => targetRef.current?.rotation,
        getScale: () => targetRef.current?.scale,
        move: (x: number, y: number, z: number) => {
          if (targetRef.current) {
            targetRef.current.position.x += x;
            targetRef.current.position.y += y;
            targetRef.current.position.z += z;
          }
        },
        rotateY: (rad: number) => {
          if (targetRef.current) targetRef.current.rotation.y += rad;
        }
      },
      // inputState - это мутабельный объект, прокидываем ссылку на него
      Input: inputState,
      Player: {
        getPosition: () => CharacterController.getSnapshot().position,
        teleport: (x: number, y: number, z: number) => {
          CharacterController.teleport(new THREE.Vector3(x, y, z));
        },
        kill: () => {
          // Имитируем логику trigger_kill
          const cp = (CharacterController as any).checkpointPos;
          CharacterController.teleport(cp ? cp : new THREE.Vector3(0, 10, 0));
          (CharacterController as any).velocityY = 0;
        }
      }
    };
  }, [targetRef]); // Зависимость только от рефа

  useEffect(() => {
    if (!script) {
      customScriptRef.current = null;
      return;
    }

    try {
      // Isolate window and document to prevent easy access to globals
      const executeScript = new Function(
        'window', 'document', 'globalThis',
        `
          ${script}
          return typeof onUpdate === 'function' ? onUpdate : null;
        `
      );
      const onUpdateFunc = executeScript({}, {}, {});
      if (onUpdateFunc) {
         customScriptRef.current = onUpdateFunc;
      } else {
         customScriptRef.current = null;
      }
    } catch (e) {
      console.error('Error compiling user script:', e);
      customScriptRef.current = null;
    }
  }, [script]);

  useFrame((state, delta) => {
    if (customScriptRef.current && targetRef.current) {
      try {
        // Передаем закэшированный объект
        customScriptRef.current(PeepAPI, delta);
      } catch (e) {
        console.error('Error executing user script:', e);
      }
    }
  });

  return null;
};

