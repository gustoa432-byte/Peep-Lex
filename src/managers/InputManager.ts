import { useStore } from '../store/useStore';
import { inputState } from '../store/inputState';

class CoreInputManager {
  private keys: Record<string, boolean> = {};

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handlePointerLockChange = this.handlePointerLockChange.bind(this);
  }

  init() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('pointerlockchange', this.handlePointerLockChange);
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
    document.removeEventListener('mousemove', this.handleMouseMove);
  }

  private handlePointerLockChange() {
    if (document.pointerLockElement) {
      document.addEventListener('mousemove', this.handleMouseMove);
    } else {
      document.removeEventListener('mousemove', this.handleMouseMove);
    }
  }

  private handleMouseMove(e: MouseEvent) {
    if (document.pointerLockElement) {
      inputState.mouseDelta.x += e.movementX;
      inputState.mouseDelta.y += e.movementY;
    }
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.repeat) return;
    this.keys[e.code] = true;
    this.updateFromKeys();
    
    if (e.code === 'Space') {
      useStore.getState().triggerJump();
    }
    if (e.code === 'KeyC') {
      useStore.getState().toggleCrouch();
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.keys[e.code] = false;
    this.updateFromKeys();
  }

  private updateFromKeys() {
    let x = 0;
    let y = 0;
    
    if (this.keys['KeyW'] || this.keys['ArrowUp']) y = -1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) y = 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) x = -1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) x = 1;
    
    // Normalize if diagonal
    if (x !== 0 && y !== 0) {
      const length = Math.sqrt(x * x + y * y);
      x /= length;
      y /= length;
    }
    
    // We only update if no joystick input is currently active (a simple heuristic is to check if joystick is being touched, but for now we just mix them or overwrite).
    // Let's assume keyboard always overwrites joystick state if touched, unless we want to sum them. For simplicity, we just set it.
    // In a real app we'd prioritize the last used device.
    inputState.move.x = x;
    inputState.move.y = y;
  }

  // Joystick wrappers
  setLook(x: number, y: number) {
    inputState.look.x = x;
    inputState.look.y = y;
  }

  setMove(x: number, y: number) {
    inputState.move.x = x;
    inputState.move.y = y;
  }

  get move() { return inputState.move; }
  get look() { return inputState.look; }
}

export const InputManager = new CoreInputManager();
