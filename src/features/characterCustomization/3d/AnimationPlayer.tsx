import { useFrame } from '@react-three/fiber';
import { useStore, DevSettings } from '../../../store/useStore';
import * as THREE from 'three';
import { useRef, useEffect } from 'react';
import { defaultDevSettings } from '../../../store/defaults';

export const activePoseRef = {
  current: { ...defaultDevSettings } as DevSettings
};

export const timeController = {
  shiftTime: (deltaMs: number) => {},
  getTime: () => 0,
};

export const AnimationPlayer = () => {
  const isPlayingAnimation = useStore(state => state.isPlayingAnimation);
  const isPlayingLoops = useStore(state => state.isPlayingLoops);
  const isPaused = useStore(state => state.isPaused);
  
  const timeRef = useRef(0);

  useEffect(() => {
    timeController.shiftTime = (deltaMs) => {
      timeRef.current += deltaMs;
      const loops = useStore.getState().loops;
      let realTotalDurationMs = 0;
      if (loops && loops.length > 0) {
        loops.forEach(l => {
           const spd = Math.max(1, isNaN(Number(l.speed)) ? 500 : Number(l.speed));
           realTotalDurationMs += ((l.frames?.length || 1) * spd) + (l.delayAfter || 0);
        });
      }
      const actualDurationMs = realTotalDurationMs > 0 ? Math.min(29900, realTotalDurationMs) : 30000;
      
      if (timeRef.current < 0) {
        timeRef.current = actualDurationMs + (timeRef.current % actualDurationMs);
      } else if (timeRef.current >= actualDurationMs) {
        timeRef.current = timeRef.current % actualDurationMs;
      }
    };
    timeController.getTime = () => timeRef.current;
  }, []);

  useFrame((state, delta) => {
    if (!isPlayingAnimation && !isPlayingLoops) {
      timeRef.current = 0;
      activePoseRef.current = useStore.getState().devSettings;
      return;
    }
    
    if (isPaused) {
      // Just hold the current pose, don't advance time
    } else {
      const safeDelta = isNaN(delta) ? 0 : Math.min(Math.max(0, delta), 0.1);
      timeRef.current += safeDelta * 1000;
    }

    const { keyframes, animationSpeed, loops } = useStore.getState();

    const safeNum = (val: any, fallback: number = 0) => {
      const num = Number(val);
      return isNaN(num) ? fallback : num;
    };

    let easeProgress = 0;
    let currentPose: Partial<DevSettings> | null = null;
    let nextPose: Partial<DevSettings> | null = null;

    if (isPlayingLoops && loops.length > 0) {
      // Find the active loop based on trackStartTime
      const sortedLoops = [...loops].sort((a, b) => (a.trackStartTime || 0) - (b.trackStartTime || 0));
      
      // Calculate true total duration based on pieces
      let realTotalDurationMs = 0;
      sortedLoops.forEach(l => {
         const fLen = l.frames?.length || 1;
         const spd = Math.max(1, isNaN(Number(l.speed)) ? 500 : Number(l.speed));
         realTotalDurationMs += (fLen * spd) + (l.delayAfter || 0);
      });
      const maxAllowedMs = 29900; // 29.9s
      const actualDurationSec = Math.min(maxAllowedMs, realTotalDurationMs) / 1000 || 30;
      
      const { isPlayingLoopsOnce, setIsPlayingLoops, setIsPlayingLoopsOnce, globalTrackUrl, trackDuration, globalTrackStartTime, backgroundVideoUrl } = useStore.getState();
      const currentRawTimeSec = safeNum(timeRef.current) / 1000;
      
      let playbackEndDurationSec = actualDurationSec;
      const isShortPack = loops.length === 1 && (loops[0].frames?.length === 4) && !backgroundVideoUrl && !globalTrackUrl;
      
      if (globalTrackUrl) {
        if (trackDuration > 0) {
          playbackEndDurationSec = Math.min(30, trackDuration - (globalTrackStartTime || 0));
        } else {
          playbackEndDurationSec = 30;
        }
      } else if (backgroundVideoUrl) {
        playbackEndDurationSec = 30;
      } else if (!isShortPack) {
        playbackEndDurationSec = 30;
      }
      
      playbackEndDurationSec = Math.max(5, Math.min(30, playbackEndDurationSec));
      
      if (currentRawTimeSec >= 30 || (isPlayingLoopsOnce && currentRawTimeSec >= playbackEndDurationSec)) {
        setIsPlayingLoops(false);
        setIsPlayingLoopsOnce(false);
        timeRef.current = 0;
        return;
      }
      
      const currentTimeSec = (safeNum(timeRef.current) / 1000) % Math.max(0.1, actualDurationSec);
      
      // Determine exactly which loop falls on the current second
      let activeLoopIndex = -1;
      for (let i = sortedLoops.length - 1; i >= 0; i--) {
        const startTimeSec = (sortedLoops[i].trackStartTime || 0);
        if (currentTimeSec >= startTimeSec) {
          activeLoopIndex = i;
          break;
        }
      }

      if (activeLoopIndex === -1) {
        const loop = sortedLoops[0];
        const loopFrames = loop.frames || [useStore.getState().devSettings];
        currentPose = loopFrames[0] || useStore.getState().devSettings;
        nextPose = loopFrames[0] || useStore.getState().devSettings;
        easeProgress = 1;
      } else {
        const loop = sortedLoops[activeLoopIndex];
        const loopFrames = loop.frames || [useStore.getState().devSettings];
        const loopStartTimeSec = (loop.trackStartTime || 0);
        const timeInLoopSec = currentTimeSec - loopStartTimeSec;
        const timeInLoopMs = timeInLoopSec * 1000;
        
        const speed = Math.max(1, safeNum(loop.speed, 500));
        const framesLen = Math.max(1, loopFrames.length);
        const normalLoopDurationMs = speed * framesLen;
        
        if (timeInLoopMs >= normalLoopDurationMs) {
           // We are in the 'delayAfter' portion. Freeze on the last frame.
           const lastIdx = framesLen - 1;
           currentPose = loopFrames[lastIdx];
           nextPose = loopFrames[lastIdx];
           easeProgress = 1;
        } else {
           const currentIndex = Math.floor(timeInLoopMs / speed) % framesLen;
           const nextIndex = (currentIndex + 1) % framesLen;
           const rawProgress = (timeInLoopMs % speed) / speed;
           const progress = Math.max(0, Math.min(1, safeNum(rawProgress)));
           
           easeProgress = progress * progress * (3 - 2 * progress);
           currentPose = loopFrames[currentIndex];
           nextPose = loopFrames[nextIndex];
        }
      }
    } else if (isPlayingAnimation && keyframes.length >= 2) {
      const speed = Math.max(1, safeNum(animationSpeed, 500));
      const totalDuration = keyframes.length * speed;
      const currentTime = safeNum(timeRef.current) % totalDuration;
      
      const currentIndex = Math.floor(currentTime / speed) % keyframes.length;
      const nextIndex = (currentIndex + 1) % keyframes.length;
      const rawProgress = (currentTime % speed) / speed;
      const progress = Math.max(0, Math.min(1, safeNum(rawProgress)));

      easeProgress = progress * progress * (3 - 2 * progress);
      currentPose = keyframes[currentIndex];
      nextPose = keyframes[nextIndex];
    } else {
       return;
    }

    if (!currentPose || !nextPose) return;

    const interpolated: Partial<DevSettings> = {};
    const currentDevSettings = useStore.getState().devSettings;
    
    for (const key in currentDevSettings) {
      if (key.endsWith('Mode')) {
        const newVal = currentPose[key as keyof DevSettings];
        (interpolated as any)[key] = newVal !== undefined ? newVal : currentDevSettings[key as keyof DevSettings];
      } else if (typeof currentDevSettings[key as keyof DevSettings] === 'number') {
        const startValue = currentPose[key as keyof DevSettings];
        const endValue = nextPose[key as keyof DevSettings];
        
        const start = startValue !== undefined ? safeNum(startValue as number) : safeNum(currentDevSettings[key as keyof DevSettings] as number);
        const end = endValue !== undefined ? safeNum(endValue as number) : safeNum(currentDevSettings[key as keyof DevSettings] as number);
        
        // Use Type Assertion for numeric interpolation
        (interpolated as any)[key] = safeNum(THREE.MathUtils.lerp(start, end, easeProgress));
      } else if (typeof currentDevSettings[key as keyof DevSettings] === 'boolean' || typeof currentDevSettings[key as keyof DevSettings] === 'string') {
        const newVal = currentPose[key as keyof DevSettings];
        (interpolated as any)[key] = newVal !== undefined ? newVal : currentDevSettings[key as keyof DevSettings];
      }
    }

    const nextState = { ...currentDevSettings, ...interpolated } as DevSettings;
    activePoseRef.current = nextState;
  });

  return null;
};
