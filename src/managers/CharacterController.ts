import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { inputState } from '../store/inputState';
import { MultiplayerService } from '../services/MultiplayerService';
import { defaultDevSettings } from '../store/defaults';
import { activePoseRef } from '../features/characterCustomization/3d/AnimationPlayer';

const UP_VECTOR = new THREE.Vector3(0, 1, 0);

export class CoreCharacterController {
  public position = new THREE.Vector3(0, 0, 0);
  public visualQuaternion = new THREE.Quaternion();
  
  public cameraPosition = new THREE.Vector3(0, 10, 26);
  public cameraQuaternion = new THREE.Quaternion();

  public animation = {
    runTime: 0,
    isMoving: false,
    isCrouching: false,
    leftHipX: 0, leftKneeX: 0, rightHipX: 0, rightKneeX: 0,
    leftShoulderX: 0, leftElbowX: 0, rightShoulderX: 0, rightElbowX: 0
  };

  private velocityY = 0;
  private yaw = 0;
  private pitch = 0.2;
  private lastSyncTime = 0;
  private lastJumpTrigger = 0;
  private lastTime = performance.now();

  private isRunning = false;
  private animationFrameId = 0;

  private floorY = 0;
  private lastAppMode = 'editor';
  private lastRoomEditorMode = 'view';
  private checkpointPos?: THREE.Vector3;
  private currentSpeedBoost: number = 0;

  // Web Worker for Grid Collisions
  private worker: Worker | null = null;
  private isWorkerReady = false;
  private nearbyBlocks: any[] = [];
  private lastWorkerRequestPos = new THREE.Vector3(9999, 9999, 9999);
  private currentRoomObjectsRef: any[] = [];
  private reqIdCounters = 0;
  private workerTimeoutId: ReturnType<typeof setTimeout> | null = null;

  public colliders: Array<{ position: number[], scale: number[] }> = [];

  constructor() {
    this.loop = this.loop.bind(this);
    if (typeof window !== 'undefined') {
      try {
        this.worker = new Worker(new URL('../workers/roomGridWorker.ts', import.meta.url), { type: 'module' });
        this.worker.onmessage = (e) => {
          if (e.data.type === 'NEARBY_BLOCKS') {
            this.nearbyBlocks = e.data.payload;
            this.isWorkerReady = true;
          } else if (e.data.type === 'CHUNKS_UPDATED') {
            useStore.getState().setRoomChunks(e.data.payload);
          }
        };
      } catch (e) {
        console.warn('Could not initialize roomGridWorker, falling back to main thread computations');
      }
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }

  stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);
  }

  teleport(pos: THREE.Vector3, resetYaw = true) {
    this.position.copy(pos);
    if (resetYaw) this.yaw = 0;
    this.velocityY = 0;
  }

  private loop() {
    if (!this.isRunning) return;
    this.animationFrameId = requestAnimationFrame(this.loop);

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    this.update(dt);
  }

  private update(dt: number) {
    const store = useStore.getState();
    const { appMode, roomEditorMode, isFirstPerson, cameraSpeed, isCrouching, jumpTrigger, roomObjects, podiumPosition, devSettings, isPlayingAnimation, isPlayingLoops, isAnimationMenuOpen, editingLoopId } = store;
    
    if (appMode !== this.lastAppMode || roomEditorMode !== this.lastRoomEditorMode) {
      if (
        ((appMode === 'room' || appMode === 'world' || appMode === 'parkour') && this.lastAppMode === 'editor') ||
        (appMode === 'roomEditor' && roomEditorMode === 'voxel' && this.lastRoomEditorMode !== 'voxel')
      ) {
        this.yaw = 0;
        this.pitch = 0.05; // Slightly lower than horizon (0 is flat horizon)
        this.visualQuaternion.setFromAxisAngle(UP_VECTOR, Math.PI);
      }
      this.lastAppMode = appMode;
      this.lastRoomEditorMode = roomEditorMode;
    }
    
    const { move, look } = inputState;
    const isRoomOrVoxel = appMode === 'room' || (appMode === 'roomEditor' && roomEditorMode === 'voxel');

    // EDITOR KINEMATICS
    if (appMode === 'editor') {
        const isMainHub = !isAnimationMenuOpen && !isPlayingLoops && editingLoopId === null;
        const activeSettings = (isPlayingAnimation || isPlayingLoops) ? activePoseRef.current : devSettings;
        const currentDevSettings = isMainHub ? defaultDevSettings : activeSettings;
        
        this.position.set(currentDevSettings.rootPositionX || 0, currentDevSettings.rootPositionY || 0, currentDevSettings.rootPositionZ || 0);
        
        let targetRotY = currentDevSettings.rootRotationY || 0;
        let diff = targetRotY - new THREE.Euler().setFromQuaternion(this.visualQuaternion).y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        const newRotY = new THREE.Euler().setFromQuaternion(this.visualQuaternion).y + diff * (1 - Math.exp(-20 * dt));
        this.visualQuaternion.setFromAxisAngle(UP_VECTOR, newRotY);

        this.animation.isMoving = false;
        this.animation.isCrouching = isCrouching;
        return;
    }

    // Send updated objects to worker if they changed
    if (this.currentRoomObjectsRef !== roomObjects) {
        const prev = this.currentRoomObjectsRef;
        this.currentRoomObjectsRef = roomObjects;
        
        if (this.worker) {
            let incremental = false;
            // Detect if a few blocks were appended
            if (roomObjects.length > prev.length && roomObjects.length - prev.length <= 50) {
                let same = true;
                for (let i = 0; i < prev.length; i++) {
                   if (prev[i] !== roomObjects[i]) {
                       same = false; break;
                   }
                }
                if (same) {
                   incremental = true;
                   this.worker.postMessage({ type: 'ADD_BLOCKS', payload: roomObjects.slice(prev.length) });
                }
            } 
            // Detect single block removal
            else if (prev.length - roomObjects.length === 1) {
                // Find which one was removed
                const removedSet = new Set(prev.map((o: any) => o.id));
                for(const obj of roomObjects) removedSet.delete(obj.id);
                if (removedSet.size === 1) {
                    incremental = true;
                    this.worker.postMessage({ type: 'REMOVE_BLOCK', payload: Array.from(removedSet)[0] });
                }
            }

            if (!incremental) {
                this.worker.postMessage({ type: 'SET_BLOCKS', payload: this.currentRoomObjectsRef });
            }
            
            // ALWAYS force a re-fetch of nearby chunks so building shows up in real-time
            this.lastWorkerRequestPos.set(9999, 9999, 9999);
        }
    }

    // Body/Room Editor - character is still or simple
    if (appMode === 'roomEditor' && roomEditorMode !== 'voxel') {
         if (this.worker && this.isWorkerReady && roomObjects.length > 0) {
             // In macro mode, we need the whole room loaded. We'll ask the worker.
             this.worker.postMessage({ type: 'GET_NEARBY', payload: { x: podiumPosition[0], z: podiumPosition[2], radius: 100, reqId: this.reqIdCounters++ } });
         }
         return;
    }

    // Ask worker for nearby blocks
    if ((appMode === 'room' || (appMode === 'roomEditor' && roomEditorMode === 'voxel')) && this.worker) {
        const dx = this.position.x - this.lastWorkerRequestPos.x;
        const dz = this.position.z - this.lastWorkerRequestPos.z;
        if (dx * dx + dz * dz > 16) { // Request updates every ~4 meters moved
            this.lastWorkerRequestPos.set(this.position.x, this.position.y, this.position.z);
            // Request radius 12 is ~2-3 chunks max, giving ~100-200 objects instead of 900+
            this.worker.postMessage({ type: 'GET_NEARBY', payload: { x: this.position.x, z: this.position.z, radius: 12, reqId: this.reqIdCounters++ } });
        }
    }

    const collisionBlocks = (this.worker && this.isWorkerReady) ? this.nearbyBlocks : roomObjects;

    // WORLD / ROOM KINEMATICS
    // 1. Look Input (Joystick)

    const rotationSpeed = cameraSpeed * 2.0;
    this.yaw -= (isNaN(look.x) ? 0 : look.x) * rotationSpeed * (isFirstPerson ? 0.3 : 1.0) * dt;
    
    let lookY = isNaN(look.y) ? 0 : look.y;
    if (isFirstPerson) {
      this.pitch -= lookY * rotationSpeed * dt * 0.5;
      this.pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.pitch));
    } else {
      this.pitch += lookY * rotationSpeed * dt;
      this.pitch = Math.max(0.2, Math.min(Math.PI/2 - 0.1, this.pitch));
    }

    // 1b. Look Input (Mouse Delta for Desktop)
    const { mouseDelta } = inputState;
    if (mouseDelta.x !== 0 || mouseDelta.y !== 0) {
      const mouseSens = 0.003;
      this.yaw -= mouseDelta.x * mouseSens;
      if (isFirstPerson) {
        this.pitch -= mouseDelta.y * mouseSens;
        this.pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.pitch));
      } else {
        this.pitch += mouseDelta.y * mouseSens;
        this.pitch = Math.max(0.2, Math.min(Math.PI/2 - 0.1, this.pitch));
      }
      mouseDelta.x = 0;
      mouseDelta.y = 0;
    }

    // 2. Floor Calculation
    let currentFloorY = -2.0;
    let highestTrigger: string | null = null;
    if (appMode === 'world') {
      currentFloorY = 0;
    } else if (isRoomOrVoxel) {
      const px = this.position.x - podiumPosition[0];
      const pz = this.position.z - podiumPosition[2];
      const distSq = px * px + pz * pz;

      if (distSq <= 20.25) currentFloorY = 1.0;
      else if (distSq <= 42.25) currentFloorY = 0.76;
      else if (distSq <= 72.25) currentFloorY = -0.2;
      
      const charRadius = 0.5;
      for (let i = 0; i < collisionBlocks.length; i++) {
        const obj = collisionBlocks[i];
        const bx = obj.position[0], by = obj.position[1], bz = obj.position[2];
        const sx = obj.scale[0]/2, sy = obj.scale[1]/2, sz = obj.scale[2]/2;
        
        if (this.position.x + charRadius > bx - sx && this.position.x - charRadius < bx + sx &&
            this.position.z + charRadius > bz - sz && this.position.z - charRadius < bz + sz) {
          const blockTop = by + sy;
          if (this.position.y >= blockTop - 1.2) {
            if (blockTop > currentFloorY) {
               currentFloorY = blockTop;
               highestTrigger = obj.type.startsWith('trigger_') ? obj.type : null;
            } else if (blockTop === currentFloorY && obj.type.startsWith('trigger_')) {
               highestTrigger = obj.type;
            }
          }
        }
      }
    }
    this.floorY = currentFloorY;

    // 3. Gravity and Jump
    let isBouncing = false;
    if (highestTrigger === 'trigger_jump' && this.position.y <= this.floorY + 0.2) {
       this.velocityY = 25; // Super jump bounce!
       isBouncing = true;
       // We could add haptic/sound here later
    }

    if (jumpTrigger !== this.lastJumpTrigger) {
      this.lastJumpTrigger = jumpTrigger;
      if (this.position.y <= this.floorY + 0.1 && !isBouncing) {
        this.velocityY = appMode === 'world' ? 10 : 15;
      }
    }

    this.velocityY -= (appMode === 'world' ? 25 : 35) * dt;
    this.position.y += this.velocityY * dt;

    if (this.position.y < this.floorY) {
      this.position.y = this.floorY;
      this.velocityY = 0;
    }

    if (highestTrigger === 'trigger_checkpoint') {
       if (!this.checkpointPos || this.checkpointPos.distanceToSquared(this.position) > 1.0) {
           this.checkpointPos = this.position.clone();
           // Optional: could add haptics/sound here for checkpoint 
       }
    }

    if (this.position.y < -100) {
      if (this.checkpointPos) {
        this.teleport(this.checkpointPos);
      } else {
        this.teleport(new THREE.Vector3(0, 10, 0));
      }
      this.velocityY = 0;
    }

    if (highestTrigger === 'trigger_speed') {
       this.currentSpeedBoost = 30; // Max speed boost
    }

    // Decay speed boost
    if (this.currentSpeedBoost > 0) {
       this.currentSpeedBoost = Math.max(0, this.currentSpeedBoost - 20 * dt);
    }

    if (highestTrigger === 'trigger_kill') {
      if (this.checkpointPos) {
        this.teleport(this.checkpointPos);
      } else {
        this.teleport(new THREE.Vector3(0, 10, 0));
      }
      this.velocityY = 0;
    }

    // 4. Movement
    const rawMag = Math.sqrt(move.x * move.x + move.y * move.y);
    const isMoving = rawMag > 0.1 || this.currentSpeedBoost > 0;
    this.animation.isMoving = isMoving;
    this.animation.isCrouching = isCrouching;

    if (isMoving) {
      // If releasing stick but have boost, keep moving mostly forward based on pitch/yaw? Wait, better to just use forward vector if no input.
      let dirX = move.x;
      let dirY = move.y;
      if (rawMag < 0.1 && this.currentSpeedBoost > 0) {
         dirY = -1; // Default to forward if just boosted and not touching stick
      }

      const moveDir = new THREE.Vector3(dirX, 0, dirY).normalize();
      moveDir.applyAxisAngle(UP_VECTOR, this.yaw);

      const baseSpeed = 15 * Math.min(1, Math.max(rawMag, 1));
      const speed = (baseSpeed + this.currentSpeedBoost) * dt;
      const prevX = this.position.x;
      const prevZ = this.position.z;

      this.position.x += moveDir.x * speed;
      
      if (isRoomOrVoxel) {
        if (this.checkCollisionX(collisionBlocks)) this.position.x = prevX;
      }

      this.position.z += moveDir.z * speed;
      
      if (isRoomOrVoxel) {
        if (this.checkCollisionZ(collisionBlocks)) this.position.z = prevZ;
      }

      const targetRotation = Math.atan2(moveDir.x, moveDir.z);
      const targetQuat = new THREE.Quaternion().setFromAxisAngle(UP_VECTOR, targetRotation);
      this.visualQuaternion.slerp(targetQuat, 15 * dt);
    } else if (isFirstPerson) {
      const targetQuat = new THREE.Quaternion().setFromAxisAngle(UP_VECTOR, this.yaw + Math.PI);
      this.visualQuaternion.slerp(targetQuat, 20 * dt);
    }

    // 5. Animations
    const isJumping = this.position.y > this.floorY + 0.01;
    this.updateAnimations(dt, isJumping, isMoving, rawMag);

    // 6. Camera transform
    this.updateCamera(dt, isFirstPerson, isRoomOrVoxel, roomEditorMode, collisionBlocks, devSettings);

    // 7. Multiplayer Sync
    const nowSync = Date.now();
    if (nowSync - this.lastSyncTime >= 33) {
      this.lastSyncTime = nowSync;
      const isMainHub = !isAnimationMenuOpen && !isPlayingLoops && editingLoopId === null;
      const currentDevSettings = defaultDevSettings;
      
      MultiplayerService.sendPlayerState({
        position: this.position,
        rotation: new THREE.Euler().setFromQuaternion(this.visualQuaternion).y,
        animation: {
          runTime: this.animation.runTime,
          isMoving,
          isCrouching,
          ...this.animation,
        },
        devSettings: currentDevSettings
      });
    }
  }

  private checkCollisionX(roomObjects: any[]) {
    const charRadius = 0.5;
    const charHeight = 2.0;
    for (let i = 0; i < roomObjects.length; i++) {
        const obj = roomObjects[i];
        const bx = obj.position[0], by = obj.position[1], bz = obj.position[2];
        const sx = obj.scale[0]/2, sy = obj.scale[1]/2, sz = obj.scale[2]/2;
        if (
          this.position.x + charRadius > bx - sx && this.position.x - charRadius < bx + sx &&
          this.position.z + charRadius > bz - sz && this.position.z - charRadius < bz + sz &&
          this.position.y < by + sy - 1.2 && this.position.y + charHeight > by - sy
        ) return true;
    }
    return false;
  }

  private checkCollisionZ(roomObjects: any[]) {
    const charRadius = 0.5;
    const charHeight = 2.0;
    for (let i = 0; i < roomObjects.length; i++) {
        const obj = roomObjects[i];
        const bx = obj.position[0], by = obj.position[1], bz = obj.position[2];
        const sx = obj.scale[0]/2, sy = obj.scale[1]/2, sz = obj.scale[2]/2;
        if (
          this.position.x + charRadius > bx - sx && this.position.x - charRadius < bx + sx &&
          this.position.z + charRadius > bz - sz && this.position.z - charRadius < bz + sz &&
          this.position.y < by + sy - 1.2 && this.position.y + charHeight > by - sy
        ) return true;
    }
    return false;
  }

  private updateAnimations(dt: number, isJumping: boolean, isMoving: boolean, rawMag: number) {
    if (isJumping) {
      this.animation.runTime = 0;
      const jumpHeight = this.position.y - this.floorY;
      const jumpFactor = Math.min(1, jumpHeight / 1.5);
      this.animation.leftHipX = -0.8 * jumpFactor;
      this.animation.leftKneeX = 1.6 * jumpFactor;
      this.animation.rightHipX = -0.8 * jumpFactor;
      this.animation.rightKneeX = 1.6 * jumpFactor;
      this.animation.leftShoulderX = -0.6 * jumpFactor;
      this.animation.rightShoulderX = -0.6 * jumpFactor;
    } else if (isMoving) {
      this.animation.runTime += dt * 15 * Math.min(1, rawMag);
      const t = this.animation.runTime;
      this.animation.leftHipX = Math.sin(t) * 0.8;
      this.animation.leftKneeX = Math.max(0, Math.cos(t)) * 1.2;
      this.animation.rightHipX = -Math.sin(t) * 0.8;
      this.animation.rightKneeX = Math.max(0, -Math.cos(t)) * 1.2;
      this.animation.leftShoulderX = -Math.sin(t) * 0.8;
      this.animation.leftElbowX = -Math.max(0, Math.sin(t)) * 0.6;
      this.animation.rightShoulderX = Math.sin(t) * 0.8;
      this.animation.rightElbowX = -Math.max(0, -Math.sin(t)) * 0.6;
    } else {
      this.animation.runTime = 0;
      this.animation.leftHipX = 0; this.animation.leftKneeX = 0;
      this.animation.rightHipX = 0; this.animation.rightKneeX = 0;
      this.animation.leftShoulderX = 0; this.animation.leftElbowX = 0;
      this.animation.rightShoulderX = 0; this.animation.rightElbowX = 0;
    }
  }

  private updateCamera(dt: number, isFirstPerson: boolean, isRoomOrVoxel: boolean, roomEditorMode: string | undefined, roomObjects: any[], devSettings: any) {
    const targetPos = this.position.clone();
    
    let headHeight = 8.1; // Default head height
    // (removed 4.0 override for voxel)

    targetPos.y += headHeight;

    if (isFirstPerson) {
        // slightly angle down towards the horizon
        const lookQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
        const lookDir = new THREE.Vector3(0, 0, -1).applyQuaternion(lookQuat); // Look forward in local space
        
        this.cameraPosition.copy(targetPos);
        const focusPoint = targetPos.clone().add(lookDir);
        this.cameraQuaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(this.cameraPosition, focusPoint, UP_VECTOR));
    } else {
        const targetHeight = isRoomOrVoxel ? (devSettings.roomCameraHeight ?? 8.1) : 8.1;
        const targetDistance = isRoomOrVoxel ? (devSettings.roomCameraDistance ?? 26) : 26;
        
        let offset;
        if (isRoomOrVoxel) {
            const currentPitch = this.pitch + (devSettings.roomCameraPitch ?? -0.220796);
            offset = new THREE.Vector3(0, Math.sin(currentPitch) * targetDistance, Math.cos(currentPitch) * targetDistance);
        } else {
            // World fixed pitch offset
            offset = new THREE.Vector3(0, 5, targetDistance); 
        }
        offset.applyAxisAngle(UP_VECTOR, this.yaw);
        
        let finalPos = targetPos.clone().add(offset);
        
        // Simple AABB collision for Camera
        if (isRoomOrVoxel) {
            const dir = finalPos.clone().sub(targetPos).normalize();
            let maxDist = offset.length();
            let minHitDist = maxDist;
            
            const box = new THREE.Box3();
            const blockRay = new THREE.Ray(targetPos, dir);
            const intersectPoint = new THREE.Vector3();
            
            for (let i = 0; i < roomObjects.length; i++) {
                const obj = roomObjects[i];
                const dx = obj.position[0] - targetPos.x;
                const dz = obj.position[2] - targetPos.z;
                if (dx*dx + dz*dz > 30*30) continue; 
                
                const sx = obj.scale[0]/2, sy = obj.scale[1]/2, sz = obj.scale[2]/2;
                box.min.set(obj.position[0] - sx, obj.position[1] - sy, obj.position[2] - sz);
                box.max.set(obj.position[0] + sx, obj.position[1] + sy, obj.position[2] + sz);
                
                if (blockRay.intersectBox(box, intersectPoint)) {
                    const dist = targetPos.distanceTo(intersectPoint);
                    if (dist < minHitDist && dist > 1.0) {
                        minHitDist = dist;
                    }
                }
            }
            if (minHitDist < maxDist) {
                const safeDist = Math.max(0.3, minHitDist - 0.5);
                finalPos = targetPos.clone().add(dir.multiplyScalar(safeDist));
            }
        }

        this.cameraPosition.copy(finalPos);
        this.cameraQuaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(this.cameraPosition, targetPos, UP_VECTOR));
    }
  }

  // To let R3F access it quickly 
  getSnapshot() {
    return {
      position: this.position,
      visualQuaternion: this.visualQuaternion,
      cameraPosition: this.cameraPosition,
      cameraQuaternion: this.cameraQuaternion,
      animation: this.animation
    };
  }
}

export const CharacterController = new CoreCharacterController();
