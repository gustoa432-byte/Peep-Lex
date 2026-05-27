import React, { useState, useRef, useEffect } from 'react';
import { inputState } from '../../../store/inputState';
import { useStore } from '../../../store/useStore';
import { vibrate } from '../../../lib/haptics';

export const VoxelJoysticks: React.FC<{
  onJump?: () => void;
  onCrouch?: () => void;
  // disableSwipe?: boolean; if we want to disable swipe gestures for jumping/crouching
}> = ({ onJump, onCrouch }) => {
  const isPlayingLoops = useStore(state => state.isPlayingLoops);

  // Left Joystick Logic for Room
  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickKnobRef = useRef<HTMLDivElement>(null);
  const [isMoveActive, setIsMoveActive] = useState(false);
  const moveStartRef = useRef<{ x: number, y: number } | null>(null);
  const maxRadius = 50;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!joystickRef.current) return;
    joystickRef.current.setPointerCapture(e.pointerId);
    
    const clientX = e.clientX ?? (e as any).touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? (e as any).touches?.[0]?.clientY ?? 0;
    
    moveStartRef.current = { x: clientX, y: clientY };
    setIsMoveActive(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!joystickRef.current || !joystickRef.current.hasPointerCapture(e.pointerId) || !moveStartRef.current) return;
    
    const clientX = e.clientX ?? (e as any).touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? (e as any).touches?.[0]?.clientY ?? 0;

    let dx = clientX - moveStartRef.current.x;
    let dy = clientY - moveStartRef.current.y;

    if (isNaN(dx)) dx = 0;
    if (isNaN(dy)) dy = 0;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }
    
    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    inputState.move.x = dx / maxRadius;
    inputState.move.y = dy / maxRadius;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!joystickRef.current) return;
    joystickRef.current.releasePointerCapture(e.pointerId);
    moveStartRef.current = null;
    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transform = `translate(0px, 0px)`;
    }
    inputState.move.x = 0;
    inputState.move.y = 0;
    setIsMoveActive(false);
  };

  // Right Joystick Logic (Camera)
  const lookJoystickRef = useRef<HTMLDivElement>(null);
  const lookKnobRef = useRef<HTMLDivElement>(null);
  const [isLookActive, setIsLookActive] = useState(false);
  const lookStartRef = useRef<{ x: number, y: number, time: number } | null>(null);

  const handleLookPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!lookJoystickRef.current) return;
    lookJoystickRef.current.setPointerCapture(e.pointerId);
    
    const clientX = e.clientX ?? (e as any).touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? (e as any).touches?.[0]?.clientY ?? 0;

    lookStartRef.current = { x: clientX, y: clientY, time: Date.now() };
    setIsLookActive(true);
  };

  const handleLookPointerMove = (e: React.PointerEvent) => {
    if (!lookJoystickRef.current || !lookJoystickRef.current.hasPointerCapture(e.pointerId) || !lookStartRef.current) return;
    
    const clientX = e.clientX ?? (e as any).touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? (e as any).touches?.[0]?.clientY ?? 0;

    let dx = clientX - lookStartRef.current.x;
    let dy = clientY - lookStartRef.current.y;

    if (isNaN(dx)) dx = 0;
    if (isNaN(dy)) dy = 0;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }
    
    if (lookKnobRef.current) {
      lookKnobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    inputState.look.x = dx / maxRadius;
    inputState.look.y = dy / maxRadius;
  };

  const handleLookPointerUp = (e: React.PointerEvent) => {
    if (!lookJoystickRef.current) return;
    lookJoystickRef.current.releasePointerCapture(e.pointerId);
    
    // Check for swipe gesture
    if (lookStartRef.current) {
      const deltaY = e.clientY - lookStartRef.current.y;
      const deltaTime = Date.now() - lookStartRef.current.time;
      
      // Fast vertical swipe
      if (deltaTime < 300 && !isPlayingLoops) {
        if (deltaY < -40) {
          vibrate([10, 30, 10]);
          if (onJump) onJump();
        } else if (deltaY > 40) {
          vibrate(10);
          if (onCrouch) onCrouch();
        }
      }
    }
    
    lookStartRef.current = null;
    if (lookKnobRef.current) {
      lookKnobRef.current.style.transform = `translate(0px, 0px)`;
    }
    inputState.look.x = 0;
    inputState.look.y = 0;
    setIsLookActive(false);
  };

  useEffect(() => {
    return () => {
      inputState.move.x = 0;
      inputState.move.y = 0;
      inputState.look.x = 0;
      inputState.look.y = 0;
    };
  }, []);

  return (
    <>
      {/* Left Joystick - Movement */}
      <div 
        className={`fixed bottom-8 left-4 w-32 h-32 bg-black/10 border-[3px] border-black/50 rounded-full pointer-events-auto touch-none flex items-center justify-center p-0 m-0 transition-opacity duration-300 ${isMoveActive ? 'opacity-5' : 'opacity-100'} z-50`}
        ref={joystickRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div 
          ref={joystickKnobRef}
          className="w-12 h-12 bg-white rounded-full shadow-[0_4px_0_0_rgba(0,0,0,0.3)] transition-transform duration-75 pointer-events-none"
          style={{ transform: `translate(0px, 0px)` }}
        />
      </div>

      {/* Right Joystick - Camera */}
      <div 
        className={`fixed bottom-8 right-4 w-32 h-32 bg-black/10 border-[3px] border-black/50 rounded-full pointer-events-auto touch-none flex items-center justify-center p-0 m-0 transition-opacity duration-300 ${isLookActive ? 'opacity-5' : 'opacity-100'} z-50`}
        ref={lookJoystickRef}
        onPointerDown={handleLookPointerDown}
        onPointerMove={handleLookPointerMove}
        onPointerUp={handleLookPointerUp}
        onPointerCancel={handleLookPointerUp}
      >
        <div 
          ref={lookKnobRef}
          className="w-12 h-12 bg-white rounded-full shadow-[0_4px_0_0_rgba(0,0,0,0.3)] transition-transform duration-75 pointer-events-none"
          style={{ transform: `translate(0px, 0px)` }}
        />
      </div>
    </>
  );
};
