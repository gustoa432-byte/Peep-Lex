import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import { getMediaDB } from '../../lib/db';
import { timeController } from '../../features/characterCustomization/3d/AnimationPlayer';

export const getGlobalAudioContext = () => {
  if (!(window as any).__GLOBAL_AUDIO_CONTEXT__) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      (window as any).__GLOBAL_AUDIO_CONTEXT__ = new AudioContextClass();
    }
  }
  return (window as any).__GLOBAL_AUDIO_CONTEXT__ as AudioContext;
};

export const getGlobalAudioGainNode = () => {
  if (!(window as any).__GLOBAL_AUDIO_GAIN_NODE__) {
    const ctx = getGlobalAudioContext();
    if (ctx) {
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);
      (window as any).__GLOBAL_AUDIO_GAIN_NODE__ = gainNode;
    }
  }
  return (window as any).__GLOBAL_AUDIO_GAIN_NODE__ as GainNode | undefined;
};

export const getGlobalAudioPannerNode = () => {
  if (!(window as any).__GLOBAL_AUDIO_PANNER_NODE__) {
    const ctx = getGlobalAudioContext();
    if (ctx) {
      const pannerNode = ctx.createPanner();
      pannerNode.panningModel = 'HRTF';
      pannerNode.distanceModel = 'inverse';
      pannerNode.refDistance = 2;
      pannerNode.maxDistance = 10000;
      pannerNode.rolloffFactor = 1;
      
      const gainNode = getGlobalAudioGainNode();
      if (gainNode) {
        pannerNode.connect(gainNode);
      } else {
        pannerNode.connect(ctx.destination);
      }
      (window as any).__GLOBAL_AUDIO_PANNER_NODE__ = pannerNode;
    }
  }
  return (window as any).__GLOBAL_AUDIO_PANNER_NODE__ as PannerNode | undefined;
};

export const GlobalAudioPlayer = () => {
  const globalTrackUrl = useStore(state => state.globalTrackUrl);
  const globalTrackStartTime = useStore(state => state.globalTrackStartTime);
  const currentLoopStartTime = useStore(state => state.currentLoopStartTime);
  
  const isPlayingAnimation = useStore(state => state.isPlayingAnimation);
  const isPlayingLoops = useStore(state => state.isPlayingLoops);
  const animationSpeed = useStore(state => state.animationSpeed);
  const keyframes = useStore(state => state.keyframes);
  const isPaused = useStore(state => state.isPaused);
  const audioScrubTrigger = useStore(state => state.audioScrubTrigger);

  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);

  // Handle Pause/Resume separately to avoid completely rebuilding the node
  useEffect(() => {
    const ctx = getGlobalAudioContext();
    if (!ctx) return;
    
    if (isPaused && ctx.state === 'running') {
      ctx.suspend().catch(() => {});
    } else if (!isPaused && ctx.state === 'suspended' && (isPlayingLoops || isPlayingAnimation)) {
      ctx.resume().catch(() => {});
    }
  }, [isPaused, isPlayingLoops, isPlayingAnimation]);

  // Initialize Audio Context and Fetch Buffer
  useEffect(() => {
    if (!globalTrackUrl) {
      if (sourceNodeRef.current) sourceNodeRef.current.stop();
      audioBufferRef.current = null;
      setIsLoaded(false);
      return;
    }

    let isCancelled = false;
    const initAudio = async () => {
      try {
        const ctx = getGlobalAudioContext();
        if (!ctx) return;
        
        const isBlob = globalTrackUrl.startsWith('blob:');
        const isData = globalTrackUrl.startsWith('data:');
        const isHttp = globalTrackUrl.startsWith('http');
        const isLocalDB = !isBlob && !isData && !isHttp;
        const finalUrl = globalTrackUrl;
        
        // Prevent old cached URLs from previous versions that we know fail
        if (finalUrl.includes('pixabay') || (isBlob && !window.URL.createObjectURL)) {
          throw new Error('Outdated URL format');
        }
        
        // Safari/Mobile WebView compatibility for ArrayBuffer
        const getArrayBuffer = async (blob: Blob): Promise<ArrayBuffer> => {
           if (typeof blob.arrayBuffer === 'function') {
               return await blob.arrayBuffer();
           }
           return new Promise((resolve, reject) => {
               const reader = new FileReader();
               reader.onload = () => resolve(reader.result as ArrayBuffer);
               reader.onerror = () => reject(reader.error);
               reader.readAsArrayBuffer(blob);
           });
        };

        let arrayBuffer: ArrayBuffer;
        
        if (isLocalDB) {
           let file: any = useStore.getState().globalTrackFile;
           if (!file) {
              file = await getMediaDB(globalTrackUrl);
              // Also sync the file back to state if we recovered it
              if (file && !isCancelled) useStore.getState().setGlobalTrackFile(file as File);
           }
           if (!file) {
               // Try to download via ApiService
               const { ApiService } = await import('../../services/ApiService');
               const data = await ApiService.downloadMedia(globalTrackUrl);
               if (data && !isCancelled) {
                   file = data;
                   await import('../../lib/db').then(m => m.saveMediaDB(globalTrackUrl, file as any as File));
                   if (!isCancelled) useStore.getState().setGlobalTrackFile(file as any as File);
               } else if (!isCancelled) {
                   throw new Error("Local file not found in DB and API download failed");
               }
           }
           if (isCancelled) return;
           if (!(file instanceof Blob) && !((file as any).size !== undefined && (file as any).type !== undefined)) {
               throw new Error("Invalid_File_Object");
           }
           arrayBuffer = await getArrayBuffer(file);
        } else if (isBlob) {
           // For blob URLs created from user file uploads, sometimes fetch fails in strict environments (like Android WebViews).
           const file = useStore.getState().globalTrackFile;
           if (file) {
              arrayBuffer = await getArrayBuffer(file);
           } else {
              const response = await fetch(finalUrl);
              if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
              arrayBuffer = await response.arrayBuffer();
           }
        } else {
           const response = await fetch(finalUrl);
           if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
           arrayBuffer = await response.arrayBuffer();
        }
        
        if (isCancelled) return;

        let audioBuffer: AudioBuffer;
        try {
          audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
            const p = ctx.decodeAudioData(arrayBuffer, resolve, reject);
            if (p) p.then(resolve).catch(reject);
          });
        } catch (e) {
          throw new Error('Failed to decode audio');
        }
        
        if (isCancelled) return;
        
        audioBufferRef.current = audioBuffer;
        useStore.getState().setTrackDuration(audioBuffer.duration);
        setIsLoaded(true);
      } catch (err) {
        if (isCancelled) return;
        // Automatically reset the track if it's broken without noisy error logs
        useStore.getState().setGlobalTrackUrl(null);
        useStore.getState().setGlobalTrackFile(null);
        try {
            if (globalTrackUrl?.startsWith('local_')) {
                const { deleteMediaDB } = await import('../../lib/db');
                await deleteMediaDB(globalTrackUrl);
            }
        } catch(e) {}
        setIsLoaded(false);
      }
    };

    initAudio();

    return () => {
      isCancelled = true;
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
    };
  }, [globalTrackUrl]);

  useEffect(() => {
    const ctx = getGlobalAudioContext();
    if (!ctx || !audioBufferRef.current || !isLoaded) return;
    
    const playAudio = async () => {
      // Stop currently playing
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
        } catch(e) {}
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }

      if (isPlayingLoops) {
        // PLAY FULL 30s CROP (from globalTrackStartTime to globalTrackStartTime + 30)
        // Check if we are paused. If we are paused during scrub, we still want to prepare the buffer 
        // but it will immediately be suspended by the other useEffect.
        if (!isPaused && ctx.state === 'suspended') {
          await ctx.resume().catch(() => {});
        }

        const source = ctx.createBufferSource();
        source.buffer = audioBufferRef.current;
        const pannerNode = getGlobalAudioPannerNode();
        if (pannerNode) {
          source.connect(pannerNode);
        } else {
          source.connect(getGlobalAudioGainNode() || ctx.destination);
        }
        
        const currentTimeOffsetSec = (timeController.getTime() % 30000) / 1000;
        const startSec = Math.min(globalTrackStartTime + currentTimeOffsetSec, audioBufferRef.current!.duration - 0.1);
        const durationSec = 30; // 30 sec max
        
        source.loop = true;
        source.loopStart = globalTrackStartTime;
        source.loopEnd = Math.min(globalTrackStartTime + durationSec, audioBufferRef.current!.duration);
        
        try {
          source.start(0, startSec);
          sourceNodeRef.current = source;
        } catch(e) {
          console.error("Audio playback error:", e);
        }

      } else if (isPlayingAnimation) {
        // PLAY FLEX WINDOW
        if (!isPaused && ctx.state === 'suspended') {
          await ctx.resume().catch(() => {});
        }

        const source = ctx.createBufferSource();
        source.buffer = audioBufferRef.current;
        const pannerNode = getGlobalAudioPannerNode();
        if (pannerNode) {
          source.connect(pannerNode);
        } else {
          source.connect(getGlobalAudioGainNode() || ctx.destination);
        }
        
        // Let the user listen to the track play normally from the offset, not clamp to 1.5s loop
        const currentTimeOffsetSec = (timeController.getTime() % 30000) / 1000;
        const startSec = Math.min(globalTrackStartTime + currentLoopStartTime + currentTimeOffsetSec, audioBufferRef.current!.duration - 0.1);
        
        // Loop the entire 30s block while character loops its small animation chunk
        source.loop = true;
        source.loopStart = globalTrackStartTime;
        source.loopEnd = Math.min(globalTrackStartTime + 30, audioBufferRef.current!.duration);
        
        try {
          source.start(0, startSec);
          sourceNodeRef.current = source;
        } catch (e) {
          console.error("Audio playback error:", e);
        }
      }
    };

    playAudio();

  }, [
    isPlayingAnimation, 
    isPlayingLoops, 
    globalTrackUrl, 
    keyframes.length, 
    animationSpeed, 
    isLoaded,
    globalTrackStartTime,
    currentLoopStartTime,
    audioScrubTrigger
  ]);

  return null;
};
