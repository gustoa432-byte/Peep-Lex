import React, { useState, useRef, useEffect } from 'react';
import { useStore, DevSettings } from '../../../store/useStore';
import { X, Copy, Play, Square, Plus, Trash2, Download, Upload, Settings2, Smile, Shirt, Hand, Footprints, Edit2, Pointer, Music, Sparkles, Ghost, Heart, Video, Eye, EyeOff, Sun, Flashlight, Circle, ChevronLeft, ChevronDown, Check, Rotate3D, RotateCcw, Undo2, Redo2, Move, Save, Library, Link2, Home } from 'lucide-react';
import { Slider } from '../../../components/ui/common/Slider';
import { VirtualJoystick } from '../../../components/ui/VirtualJoystick';
import { getGlobalAudioContext } from '../../../components/audio/GlobalAudioPlayer';
import { saveMediaDB } from '../../../lib/db';
import { vibrate } from '../../../lib/haptics';
import { defaultDevSettings } from '../../../store/defaults';
import { MediaLibraryModal } from '../../../components/ui/MediaLibraryModal';

type PoseSection = 'head' | 'torso' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg' | 'effects' | 'movement' | null;

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

const JoystickPanel = React.memo(({ 
  bones, activeBoneName, setActiveBoneName, isTwistMode, setIsTwistMode, updateDevSettings 
}: { 
  bones: { id: string, label: string }[],
  activeBoneName: string | null,
  setActiveBoneName: (id: string) => void,
  isTwistMode: boolean,
  setIsTwistMode: (val: boolean) => void,
  updateDevSettings: (settings: any) => void
}) => {
  const hasInteractedJoystick = useStore(state => state.hasInteractedJoystick);

  const devSettings = useStore(state => state.devSettings);

  // Helper to visually check if a bone has modifications
  const isBoneModified = (boneId: string) => {
    const dev = devSettings;
    const ax = getBoneRotationAxes(boneId);
    if (!ax) return false;
    if (ax.x !== 'nonExistent' && Math.abs((dev as any)[ax.x] || 0) > 0.01) return true;
    if (ax.y !== 'nonExistent' && Math.abs((dev as any)[ax.y] || 0) > 0.01) return true;
    if (ax.z !== 'nonExistent' && Math.abs((dev as any)[ax.z] || 0) > 0.01) return true;
    return false;
  };

  useEffect(() => {
    if (!activeBoneName || !bones.find(b => b.id === activeBoneName)) {
      setActiveBoneName(bones[0].id);
    }
  }, [bones, activeBoneName, setActiveBoneName]);

  return (
    <div className="flex flex-col items-center gap-1 w-full">
      {/* Sub-menu bones aligned to the right side */}
      {bones.length > 1 && (
        <div className="flex flex-col gap-1.5 w-[50px]">
          {bones.map(b => {
            const isActive = activeBoneName === b.id;
            const isMod = isBoneModified(b.id);
            return (
              <button
                key={b.id}
                onClick={() => setActiveBoneName(b.id)}
                className={`w-[50px] h-[46px] px-1 text-[9px] font-bold rounded-lg transition-colors text-center border break-words leading-tight flex items-center justify-center shrink-0 shadow-lg ${isActive ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : isMod ? 'bg-black/95 border-orange-500/50 text-orange-400 shadow-lg hover:bg-black hover:text-orange-400' : 'bg-black/95 border-white/10 text-white/50 shadow-lg hover:bg-black hover:text-white'}`}
              >
                {b.label}
              </button>
            );
          })}
        </div>
      )}
      
      {/* Tools: Twist and Reset */}
      <div className="flex flex-col gap-1.5 w-[50px] items-center mt-3">
        <button 
          onClick={() => setIsTwistMode(!isTwistMode)}
          className={`w-[50px] h-[46px] rounded-lg border flex justify-center items-center transition-all shrink-0 shadow-lg ${isTwistMode ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-black/95 border-white/10 text-white/50 hover:bg-black hover:text-white'}`}
          title="Ось скручивания"
        >
          <Rotate3D size={18} className={isTwistMode ? "animate-pulse" : ""} />
        </button>
        <button 
          onClick={() => {
            if (!activeBoneName) return;
            const ax = getBoneRotationAxes(activeBoneName);
            if (ax) {
               const updates: any = {};
               if (ax.x !== 'nonExistent') updates[ax.x] = 0;
               if (ax.y !== 'nonExistent') updates[ax.y] = 0;
               if (ax.z !== 'nonExistent') updates[ax.z] = 0;
               updateDevSettings(updates);
            }
          }}
          className="w-[50px] h-[46px] bg-black/95 border border-white/10 text-white/50 hover:bg-black hover:text-white hover:border-red-500/50 hover:text-red-400 rounded-lg flex justify-center items-center transition-all shrink-0 shadow-lg"
          title="Сброс вращения"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
});

export const AnimationMenu: React.FC = () => {
  const isAnimationMenuOpen = useStore(state => state.isAnimationMenuOpen);
  if (!isAnimationMenuOpen) return null;
  return <AnimationMenuEditor />;
};

import { useShallow } from 'zustand/react/shallow';

const useSectionModified = (section: PoseSection) => {
  const dev = useStore(state => state.devSettings);
  const isMod = (bone: string) => {
    const axes = getBoneRotationAxes(bone);
    if (!axes) return false;
    if (axes.x !== 'nonExistent' && Math.abs((dev as any)[axes.x] || 0) > 0.01) return true;
    if (axes.y !== 'nonExistent' && Math.abs((dev as any)[axes.y] || 0) > 0.01) return true;
    if (axes.z !== 'nonExistent' && Math.abs((dev as any)[axes.z] || 0) > 0.01) return true;
    return false;
  };
  switch(section) {
    case 'movement': return isMod('movement');
    case 'head': return isMod('neck');
    case 'torso': return isMod('root') || isMod('spine');
    case 'leftArm': return isMod('leftShoulder') || isMod('leftElbow') || isMod('leftWrist');
    case 'rightArm': return isMod('rightShoulder') || isMod('rightElbow') || isMod('rightWrist');
    case 'leftLeg': return isMod('leftHip') || isMod('leftKnee') || isMod('leftAnkle');
    case 'rightLeg': return isMod('rightHip') || isMod('rightKnee') || isMod('rightAnkle');
    case 'effects': 
      return !!dev.effectHearts || !!dev.effectSparkles;
    default: return false;
  }
};

const EffectsControls = React.memo(() => {
  const devSettings = useStore(state => state.devSettings);
  const updateDevSettings = useStore(state => state.updateDevSettings);

  return (
    <div className="space-y-4">
      <h4 className="text-white/70 text-xs font-bold uppercase tracking-wider mb-2">Эффекты</h4>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => updateDevSettings({ effectHearts: !devSettings.effectHearts })} className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors border ${devSettings.effectHearts ? 'bg-orange-500/20 text-orange-400 border-orange-500' : 'bg-black/80 text-white/50 border-transparent hover:bg-black/80'}`}>
          <Heart size={16} /> Сердечки
        </button>
        <button onClick={() => updateDevSettings({ effectSparkles: !devSettings.effectSparkles })} className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors border ${devSettings.effectSparkles ? 'bg-orange-500/20 text-orange-400 border-orange-500' : 'bg-black/80 text-white/50 border-transparent hover:bg-black/80'}`}>
          <Sparkles size={16} /> Блестки
        </button>
      </div>
    </div>
  );
});

const AnimationMenuEditor: React.FC = React.memo(() => {
  const store = useStore(useShallow(state => ({
    isAnimationMenuOpen: state.isAnimationMenuOpen,
    setIsAnimationMenuOpen: state.setIsAnimationMenuOpen,
    updateDevSettings: state.updateDevSettings,
    keyframes: state.keyframes,
    addKeyframe: state.addKeyframe,
    removeKeyframe: state.removeKeyframe,
    clearKeyframes: state.clearKeyframes,
    updateKeyframe: state.updateKeyframe,
    isPlayingAnimation: state.isPlayingAnimation,
    setIsPlayingAnimation: state.setIsPlayingAnimation,
    loops: state.loops,
    saveLoop: state.saveLoop,
    removeLoop: state.removeLoop,
    duplicateLoop: state.duplicateLoop,
    updateLoopStartTime: state.updateLoopStartTime,
    updateLoopDelay: state.updateLoopDelay,
    isPlayingLoops: state.isPlayingLoops,
    setIsPlayingLoops: state.setIsPlayingLoops,
    editingLoopId: state.editingLoopId,
    setEditingLoopId: state.setEditingLoopId,
    loadLoopForEditing: state.loadLoopForEditing,
    globalTrackUrl: state.globalTrackUrl,
    setGlobalTrackUrl: state.setGlobalTrackUrl,
    backgroundVideoUrl: state.backgroundVideoUrl,
    setBackgroundVideoUrl: state.setBackgroundVideoUrl,
    setGlobalTrackFile: state.setGlobalTrackFile,
    setBackgroundVideoFile: state.setBackgroundVideoFile,
    isUiHidden: state.isUiHidden,
    setIsUiHidden: state.setIsUiHidden,
    activePoseSection: state.activePoseSection,
    setActivePoseSection: state.setActivePoseSection,
    activeBoneName: state.activeBoneName,
    setActiveBoneName: state.setActiveBoneName,
    isTwistMode: state.isTwistMode,
    setIsTwistMode: state.setIsTwistMode,
    isPaused: state.isPaused,
    setIsPaused: state.setIsPaused,
    triggerAudioScrub: state.triggerAudioScrub,
    selectedKeyframeIndex: state.selectedKeyframeIndex,
    setSelectedKeyframeIndex: state.setSelectedKeyframeIndex
  })));

  const {
    isAnimationMenuOpen, setIsAnimationMenuOpen,
    updateDevSettings,
    keyframes, addKeyframe, removeKeyframe, clearKeyframes, updateKeyframe,
    isPlayingAnimation, setIsPlayingAnimation,
    loops, saveLoop, removeLoop, duplicateLoop, updateLoopStartTime, updateLoopDelay,
    isPlayingLoops, setIsPlayingLoops,
    editingLoopId, setEditingLoopId, loadLoopForEditing,
    globalTrackUrl, setGlobalTrackUrl,
    backgroundVideoUrl, setBackgroundVideoUrl,
    setGlobalTrackFile, setBackgroundVideoFile,
    isUiHidden, setIsUiHidden,
    activePoseSection, setActivePoseSection,
    activeBoneName, setActiveBoneName,
    isTwistMode, setIsTwistMode,
    isPaused, setIsPaused, triggerAudioScrub,
    selectedKeyframeIndex, setSelectedKeyframeIndex
  } = store;

  
  // Custom Modal State
  const [saveLoopName, setSaveLoopName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Arm sub-tab state
  const [armSubMode, setArmSubMode] = useState<'arm' | 'hand'>('arm');
  
  // Camera flash effect state
  const [isFlashing, setIsFlashing] = useState(false);
  
  // BPM Menu state
  const [showBpmMenu, setShowBpmMenu] = useState(false);
  const animationSpeed = useStore(state => state.animationSpeed);
  const setAnimationSpeed = useStore(state => state.setAnimationSpeed);

  // Overwrite Confirm State
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const [showExitPrompt, setShowExitPrompt] = useState(false);

  // Library State
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryTab, setLibraryTab] = useState<'flexes' | 'shorts'>('flexes');
  const [isSavingPack, setIsSavingPack] = useState(false);
  const [savePackPromptOpen, setSavePackPromptOpen] = useState(false);
  const [savePackName, setSavePackName] = useState("");
  const [loopToDelete, setLoopToDelete] = useState<string | null>(null);
  const flexPacks = useStore(state => state.flexPacks);
  const loadFlexPack = useStore(state => state.loadFlexPack);
  const removeFlexPack = useStore(state => state.removeFlexPack);
  const [newPackName, setNewPackName] = useState('');
  
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);
  const [tempDelay, setTempDelay] = useState<number>(0);
  const [showDelayPrompt, setShowDelayPrompt] = useState(false);
  const [packToDelete, setPackToDelete] = useState<string | null>(null);

  const [showMediaModal, setShowMediaModal] = useState<'audio' | 'video' | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to end when loops change length
  useEffect(() => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
            left: scrollContainerRef.current.scrollWidth,
            behavior: 'smooth'
        });
    }
  }, [loops.length]);

  const handleAddKeyframeWithFlash = () => {
    const storeState = useStore.getState();
    let realTotalDurationMs = 0;
    storeState.loops.forEach(l => {
       if (l.id !== editingLoopId) {
          realTotalDurationMs += (l.frames.length * l.speed) + (l.delayAfter || 0);
       }
    });
    const projectedDurationMs = (storeState.keyframes.length + 1) * storeState.animationSpeed;
    if (realTotalDurationMs + projectedDurationMs > 29900) {
       alert("Добавление кадра превысит лимит в 29.9 секунд!");
       return;
    }

    addKeyframe(storeState.devSettings);
    setIsFlashing(true);
    vibrate([15, 50, 15]);
    setTimeout(() => setIsFlashing(false), 150);
  };

  const exitLoopEditor = () => {
    setEditingLoopId(null);
    setActivePoseSection(null);
    setIsPlayingAnimation(false);
    // MUST Clear effect modes from global devSettings so it doesn't bleed back into Peep Studio
    updateDevSettings({ ambientMode: 0, spotMode: 0, rimPinkMode: 0, rimCyanMode: 0 }, true);
  };

  const handleCloseEditor = () => {
    // Leave the character in its current pose instead of zeroing it
    setActivePoseSection(null);
    setIsAnimationMenuOpen(false);
  };

  const handleLoadPose = (pose: DevSettings, index?: number) => {
    if (index !== undefined) setSelectedKeyframeIndex(index);
    updateDevSettings(pose, true);
  };

  const syncLightsToKeyframe = (index: number, newMode: any, field: keyof DevSettings) => {
    updateKeyframe(index, { [field]: newMode });
    handleLoadPose({ ...keyframes[index], [field]: newMode }, index);
  };

  const renderPoseSliders = () => {
    // Helper to pass common props to JoystickPanel
    const renderJoystick = (bones: {id: string, label: string}[]) => (
      <JoystickPanel 
        bones={bones} 
        activeBoneName={activeBoneName} 
        setActiveBoneName={setActiveBoneName}
        isTwistMode={isTwistMode}
        setIsTwistMode={setIsTwistMode}
        updateDevSettings={updateDevSettings}
      />
    );

    switch (activePoseSection) {
      case 'movement':
        return (
          <div className="flex flex-col gap-2 w-full">
            {renderJoystick([{ id: 'movement', label: 'Движение' }])}
          </div>
        );
      case 'head':
        return (
          <div className="flex flex-col gap-2 w-full">
             {renderJoystick([{ id: 'neck', label: 'Голова' }])}
          </div>
        );
      case 'torso':
        return (
          <div className="flex flex-col gap-2 w-full">
            {renderJoystick([
              { id: 'root', label: 'Таз' },
              { id: 'spine', label: 'Спина' }
            ])}
          </div>
        );
      case 'leftArm':
        return (
          <div className="flex flex-col gap-2 w-full">
            {renderJoystick([
              { id: 'leftShoulder', label: 'Плечо' },
              { id: 'leftElbow', label: 'Локоть' },
              { id: 'leftWrist', label: 'Кисть' }
            ])}
          </div>
        );
      case 'rightArm':
        return (
          <div className="flex flex-col gap-2 w-full">
            {renderJoystick([
              { id: 'rightShoulder', label: 'Плечо' },
              { id: 'rightElbow', label: 'Локоть' },
              { id: 'rightWrist', label: 'Кисть' }
            ])}
          </div>
        );
      case 'leftLeg':
        return (
          <div className="flex flex-col gap-2 w-full">
            {renderJoystick([
              { id: 'leftHip', label: 'Бедро' },
              { id: 'leftKnee', label: 'Колено' },
              { id: 'leftAnkle', label: 'Ступня' }
            ])}
          </div>
        );
      case 'rightLeg':
        return (
          <div className="flex flex-col gap-2 w-full">
            {renderJoystick([
              { id: 'rightHip', label: 'Бедро' },
              { id: 'rightKnee', label: 'Колено' },
              { id: 'rightAnkle', label: 'Ступня' }
            ])}
          </div>
        );
      case 'effects':
        return <div className="w-48"><EffectsControls /></div>;
      default:
        return null;
    }
  };

  const PoseNavCategory = ({ icon: Icon, section, label, flip }: { icon: any, section: PoseSection, label: string, flip?: boolean }) => {
    const isActive = activePoseSection === section;
    const isModified = useSectionModified(section);
    return (
      <div className={`shrink-0 w-[50px] h-[46px] rounded-[16px]`}>
        <button
          onClick={() => setActivePoseSection(isActive ? null : section)}
          className={`w-full h-full flex flex-col items-center justify-center gap-0.5 rounded-[16px] border-[3px] border-black transition-all ${isActive ? 'bg-[#ff6b00] text-white shadow-[0_2px_0_0_#000]' : isModified ? 'bg-[#8b5cf6] text-[#ffb067] hover:bg-[#a78bfa] shadow-[0_2px_0_0_#000]' : 'bg-[#8b5cf6] text-white hover:bg-[#a78bfa] shadow-[0_2px_0_0_#000]'}`}
        >
          <Icon size={16} className={flip ? "scale-x-[-1]" : ""} />
          <span className={`text-[8px] font-black tracking-wider text-center leading-tight`}>{label}</span>
        </button>
      </div>
    );
  };

  // ----- MAIN RENDER -----
  
  const isMicroMode = editingLoopId !== null;
  const isAnimating = (isPlayingLoops && !isPaused) || isPlayingAnimation;

  return (
    <div className="select-none">
      {isMicroMode && activePoseSection !== null && <VirtualJoystick />}
      <div className={`fixed inset-0 bg-white pointer-events-none z-[9999] transition-opacity duration-150 ${isFlashing ? 'opacity-50' : 'opacity-0'}`} />

      <div className="absolute top-4 right-4 flex flex-row items-center gap-2 z-50 pointer-events-auto transition-opacity duration-300">
        {!isUiHidden && !isAnimating && (
          <>
            {isMicroMode && (
              <>
                <div>
                  <button
                      onClick={() => useStore.getState().undoHistory()}
                      className="p-3 bg-[#8b5cf6] text-white rounded-full transition-all border-[3px] border-black shadow-[0_3px_0_0_#000] active:translate-y-1 active:shadow-none hover:bg-[#a78bfa] flex items-center justify-center"
                      title="Отменить"
                  >
                      <Undo2 size={20} strokeWidth={3} />
                  </button>
                </div>
                <div>
                  <button
                      onClick={() => useStore.getState().redoHistory()}
                      className="p-3 bg-[#8b5cf6] text-white rounded-full transition-all border-[3px] border-black shadow-[0_3px_0_0_#000] active:translate-y-1 active:shadow-none hover:bg-[#a78bfa] flex items-center justify-center"
                      title="Вернуть"
                  >
                      <Redo2 size={20} strokeWidth={3} />
                  </button>
                </div>
              </>
            )}
            {!isMicroMode && (
              <>
                <input 
                    type="file" accept="audio/*" ref={fileInputRef} className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) { alert("Размер аудио не должен превышать 10МБ!"); return; }
                        const id = `local_audio_${Date.now()}`;
                        saveMediaDB(id, file).then(() => { setGlobalTrackFile(file); setGlobalTrackUrl(id); });
                      }
                    }}
                />
                <div>
                  <button
                      onClick={() => {
                          setShowMediaModal('audio');
                      }}
                      className={`p-3 ${globalTrackUrl ? 'bg-[#06b6d4]' : 'bg-[#8b5cf6]'} text-white rounded-full transition-all border-[3px] border-black shadow-[0_3px_0_0_#000] active:translate-y-1 active:shadow-none hover:bg-opacity-80 flex items-center justify-center`}
                      title="Музыка"
                  >
                      <Music size={20} strokeWidth={3} />
                  </button>
                </div>
                <input 
                    type="file" accept="video/mp4,video/webm" ref={videoInputRef} className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 3 * 1024 * 1024) { alert("Размер видео не должен превышать 3МБ!"); return; }
                        const id = `local_video_${Date.now()}`;
                        import('../../../lib/db').then(m => m.saveMediaDB(id, file)).then(() => { useStore.getState().setBackgroundVideoFile(file); useStore.getState().setBackgroundVideoUrl(id); });
                      }
                    }}
                />
                <div>
                  <button
                      onClick={() => {
                          setShowMediaModal('video');
                      }}
                      className={`p-3 ${backgroundVideoUrl ? 'bg-[#c084fc]' : 'bg-[#8b5cf6]'} text-white rounded-full transition-all border-[3px] border-black shadow-[0_3px_0_0_#000] active:translate-y-1 active:shadow-none hover:bg-opacity-80 flex items-center justify-center`}
                      title="Фоновое видео"
                  >
                      <Video size={20} strokeWidth={3} />
                  </button>
                </div>
                <div>
                  <button
                      onClick={() => setShowLibrary(true)}
                      className="p-3 bg-[#8b5cf6] text-white rounded-full transition-all border-[3px] border-black shadow-[0_3px_0_0_#000] active:translate-y-1 active:shadow-none hover:bg-[#ff6b00] flex items-center justify-center"
                      title="Библиотека флексов"
                  >
                      <Library size={20} className="stroke-white" strokeWidth={3} />
                  </button>
                </div>
              </>
            )}
          </>
        )}
        {!isUiHidden && !isAnimating && (
          isMicroMode ? (
            <div className="relative">
              <div>
                <button
                  onClick={() => setShowBpmMenu(!showBpmMenu)}
                  className="p-3 bg-[#8b5cf6] text-white rounded-full transition-all border-[3px] border-black shadow-[0_3px_0_0_#000] active:translate-y-1 active:shadow-none hover:bg-opacity-80 flex items-center justify-center"
                  title="Настройки BPM"
                >
                  <Settings2 size={20} className="stroke-white" strokeWidth={3} />
                </button>
              </div>
              
              {showBpmMenu && (
                <div className="absolute top-1/2 -left-4 -translate-x-full -translate-y-1/2 w-48 bg-white border-[3px] border-black rounded-[20px] p-4 shadow-[0_4px_0_0_rgba(0,0,0,1)] z-[90]">
                  <div className="flex flex-col gap-2">
                    <label className="text-black text-xs text-center font-black tracking-widest uppercase">
                      BPM (мс/кадр)
                    </label>
                    <input 
                      type="range" 
                      min="100" 
                      max="2000" 
                      step="100"
                      value={animationSpeed} 
                      onChange={(e) => {
                         const maxSpeed = Number(e.target.value);
                         const storeState = useStore.getState();
                         let realTotalDurationMs = 0;
                         storeState.loops.forEach(l => {
                            if (l.id !== editingLoopId) {
                               realTotalDurationMs += (l.frames.length * l.speed) + (l.delayAfter || 0);
                            }
                         });
                         const projectedDurationMs = storeState.keyframes.length * maxSpeed;
                         if (realTotalDurationMs + projectedDurationMs > 29900) {
                            alert("Эта задержка превысит лимит ленты в 29.9 секунд!");
                            return;
                         }
                         setAnimationSpeed(maxSpeed);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <div className="text-black text-center text-sm font-black">
                      {animationSpeed} мс
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <button
                onClick={handleCloseEditor}
                className="p-3 bg-[#ef4444] text-white rounded-full transition-all border-[3px] border-black shadow-[0_3px_0_0_#000] active:translate-y-1 active:shadow-none hover:bg-opacity-80 flex items-center justify-center"
                title="Домой"
              >
                <Home size={20} strokeWidth={3} className="stroke-white" />
              </button>
            </div>
          )
        )}
      </div>

      {isMicroMode && activePoseSection !== null && (
        <div className={`fixed left-1 top-24 bottom-40 overflow-y-auto flex flex-col z-50 pointer-events-auto items-start pb-10 pl-1 custom-scrollbar transition-transform duration-300 ${isUiHidden || isAnimating ? '-translate-x-[150%]' : 'translate-x-0'}`}>
            <div className="flex flex-col gap-1.5">
              {renderPoseSliders()}
            </div>
        </div>
      )}

      {isMicroMode && (
        <div className={`fixed right-1 top-24 bottom-40 overflow-y-auto flex flex-col gap-1.5 z-50 pointer-events-auto items-end pb-10 pr-1 custom-scrollbar transition-transform duration-300 ${isUiHidden || isAnimating ? 'translate-x-[150%]' : 'translate-x-0'}`}>
          <div className="flex flex-col gap-1.5 items-end">
            <PoseNavCategory section="movement" icon={Move} label="Полет" />
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            <PoseNavCategory section="head" icon={Smile} label="Голова" />
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            <PoseNavCategory section="torso" icon={Shirt} label="Торс" />
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            <PoseNavCategory section="leftArm" icon={Hand} label="Лев.Рука" flip />
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            <PoseNavCategory section="rightArm" icon={Hand} label="Прав.Рука" />
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            <PoseNavCategory section="leftLeg" icon={Footprints} label="Лев.Нога" flip />
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            <PoseNavCategory section="rightLeg" icon={Footprints} label="Прав.Нога" />
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            <PoseNavCategory section="effects" icon={Sparkles} label="Эффекты" />
          </div>
        </div>
      )}

      <div className={`absolute bottom-0 left-0 w-full transition-transform duration-300 z-40 pointer-events-auto ${isUiHidden ? 'translate-y-[120%]' : 'translate-y-0'}`}>
        
        {isMicroMode ? (
          // MICRO MODE - POSE & KEYFRAME EDITOR (BOTTOM SHEET)
          <div className="bg-transparent pt-2 pb-4 sm:pb-6 relative flex justify-center w-full">
            <svg width="0" height="0" className="absolute pointer-events-none">
              <defs>
                <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
                </linearGradient>

                <linearGradient id="greenOscillatingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2">
                    <animate attributeName="stop-opacity" values="0.2;1;0.2" dur="2.5s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" stopColor="#22c55e" stopOpacity="1">
                    <animate attributeName="stop-opacity" values="1;0.2;1" dur="2.5s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.2">
                    <animate attributeName="stop-opacity" values="0.2;1;0.2" dur="2.5s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
              </defs>
            </svg>
            
            {/* Play & Keyframes Row */}
            <div className="w-full max-w-full px-1">
              <div className="flex items-center justify-center flex-nowrap gap-1 sm:gap-3 py-2 w-full mx-auto">
                <button
                  onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
                  className={`shrink-0 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${(keyframes.length > 0 && !isPlayingAnimation && keyframes.length < 4) ? 'animate-pulse' : ''}`}
                >
                  {isPlayingAnimation ? (
                    <Square size={40} stroke="black" strokeWidth={3} fill="url(#pinkGrad)" />
                  ) : (
                    <Play size={50} stroke="black" strokeWidth={3} fill="url(#pinkGrad)" />
                  )}
                </button>
               
               {keyframes.map((kf, i) => (
                 <div key={i} className="shrink-0 flex flex-col items-center gap-2 relative group cursor-pointer" onClick={() => handleLoadPose(kf, i)}>
                    <div className={`w-[52px] sm:w-[60px] h-10 sm:h-11 rounded-xl flex items-center justify-center font-black transition-all relative border-[3px] border-black ${selectedKeyframeIndex === i ? 'bg-[#ff6b00] text-white shadow-[0_2px_0_0_#000]' : 'bg-[#8b5cf6] text-white hover:bg-[#a78bfa] shadow-[0_2px_0_0_#000]'}`}>
                        <span className="z-10 tracking-widest">{i + 1}</span>
                    </div>
                    {/* Tiny Light Buttons underneath the keyframe */}
                    <div className="flex gap-1 justify-center">
                        <button onClick={(e) => { e.stopPropagation(); syncLightsToKeyframe(i, (((kf.ambientMode || 0) + 1) % 4), 'ambientMode'); }} className={`${kf.ambientMode === 3 ? 'text-red-500' : kf.ambientMode === 2 ? 'text-yellow-400' : kf.ambientMode === 1 ? 'text-yellow-400' : 'text-white/60'}`}><Sun size={12} /></button>
                        <button onClick={(e) => { e.stopPropagation(); syncLightsToKeyframe(i, (((kf.spotMode || 0) + 1) % 3), 'spotMode'); }} className={`${kf.spotMode === 2 ? 'text-red-500' : kf.spotMode === 1 ? 'text-white' : 'text-white/60'}`}><Flashlight size={12} /></button>
                        <button onClick={(e) => { e.stopPropagation(); syncLightsToKeyframe(i, (((kf.rimPinkMode || 0) + 1) % 4), 'rimPinkMode'); }} className={`${kf.rimPinkMode === 3 ? 'text-red-500' : kf.rimPinkMode === 2 ? 'text-pink-400' : kf.rimPinkMode === 1 ? 'text-pink-400' : 'text-white/60'}`}><Circle size={12} strokeWidth={3} /></button>
                        <button onClick={(e) => { e.stopPropagation(); syncLightsToKeyframe(i, (((kf.rimCyanMode || 0) + 1) % 4), 'rimCyanMode'); }} className={`${kf.rimCyanMode === 3 ? 'text-red-500' : kf.rimCyanMode === 2 ? 'text-cyan-400' : kf.rimCyanMode === 1 ? 'text-cyan-400' : 'text-white/60'}`}><Circle size={12} strokeWidth={3} /></button>
                    </div>
                    {/* Delete button */}
                    <button onClick={(e) => { e.stopPropagation(); removeKeyframe(i); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity border-2 border-black shadow-[0_2px_0_0_#000]"><Trash2 size={12} strokeWidth={3} /></button>
                 </div>
               ))}

               {keyframes.length < 4 && (
                 <button 
                  onClick={handleAddKeyframeWithFlash}
                  className={`shrink-0 w-[52px] sm:w-[60px] h-10 sm:h-11 bg-[#8b5cf6] rounded-xl flex items-center justify-center text-white/90 hover:text-white hover:bg-[#a78bfa] transition-all border-[3px] border-black shadow-[0_2px_0_0_#000] active:translate-y-1 active:shadow-none ${keyframes.length === 0 ? 'animate-pulse' : ''}`}
                 >
                   <Plus size={20} strokeWidth={3} />
                 </button>
               )}
               
               <div className="flex items-center gap-1">
                <button 
                  onClick={() => {
                     let realTotalDurationMs = 0;
                     loops.forEach(l => {
                        if (l.id !== editingLoopId) {
                           realTotalDurationMs += (l.frames.length * l.speed) + (l.delayAfter || 0);
                        }
                     });
                     const currentLoopDurationMs = keyframes.length * useStore.getState().animationSpeed;
                     if (realTotalDurationMs + currentLoopDurationMs > 29900) {
                        alert("Общая длительность ленты не может превышать 29.9 секунд!");
                        return;
                     }
                     if (editingLoopId === 'draft' && loops.length >= 20) {
                        alert("Достигнут лимит в 20 кусочков!");
                        return;
                     }
                     
                     const originalLoop = loops.find(l => l.id === editingLoopId);
                     const isChanged = editingLoopId === 'draft' 
                        ? keyframes.length > 0 
                        : (JSON.stringify(keyframes) !== JSON.stringify(originalLoop?.frames) || saveLoopName !== originalLoop?.name || useStore.getState().animationSpeed !== originalLoop?.speed);
                        
                     if (isChanged) {
                        setShowExitPrompt(true);
                     } else {
                        exitLoopEditor();
                     }
                  }}
                  className={`shrink-0 w-[44px] h-[44px] sm:w-[50px] sm:h-[50px] flex items-center justify-center rounded-[14px] bg-[#22c55e] border-[3px] border-black shadow-[0_4px_0_0_#000] text-white hover:bg-[#4ade80] active:translate-y-1 active:shadow-none transition-all ${keyframes.length >= 4 ? 'animate-bounce' : ''}`}
                >
                  <Check size={32} strokeWidth={4} />
                </button>
               </div>
              </div>
            </div>

          </div>
        ) : (
          // MACRO MODE - TIMELINE (BOTTOM BAR)
          <div className="bg-transparent pt-2 pb-2">
            <div className="px-4 mb-2 flex flex-col gap-2">
               <div className="flex items-center gap-4">
                 <button
                    onClick={() => {
                       if (isPlayingLoops) {
                          setIsPlayingLoops(false);
                       } else {
                          getGlobalAudioContext().resume().catch(()=>{});
                          useStore.getState().setIsPlayingLoopsOnce(false);
                          setIsPlayingLoops(true);
                          setIsPaused(false);
                       }
                    }}
                    className={`shrink-0 px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all border-[3px] border-black shadow-[0_3px_0_0_#000] active:translate-y-1 active:shadow-none ${isPlayingLoops && !isPaused ? 'bg-[#ff6b00] text-white' : 'bg-[#8b5cf6] text-white hover:bg-[#a78bfa]'}`}
                 >
                   {isPlayingLoops && !isPaused ? <><Square size={16} fill="currentColor" strokeWidth={3} /> Стоп</> : <><Play size={16} fill="currentColor" strokeWidth={3} /> Смотреть всё</>}
                 </button>
               </div>
            </div>

            <div ref={scrollContainerRef} className={`flex overflow-x-auto items-center px-4 gap-3 py-2 min-h-[90px] overflow-y-hidden custom-scrollbar transition-all duration-300 ${isAnimating ? 'h-0 opacity-0 min-h-0 py-0 border-none scale-y-0' : ''}`}>
              {loops.map((loop, idx) => (
                <React.Fragment key={loop.id}>
                  <div className="rounded-[16px] border-[3px] border-black shadow-[0_3px_0_0_#000] transform hover:translate-y-px hover:shadow-[0_2px_0_0_#000] active:translate-y-[3px] active:shadow-none transition-all flex-shrink-0 bg-[#8b5cf6]">
                    <div 
                      onClick={() => {
                        loadLoopForEditing(loop.id);
                        setSaveLoopName(loop.name);
                        setActivePoseSection(null);
                      }}
                      className="shrink-0 flex flex-col justify-between rounded-[16px] h-16 w-16 cursor-pointer relative group overflow-hidden transition-all hover:bg-black/10 p-2"
                    >
                      <span className="text-white text-[10px] font-black leading-tight tracking-wider truncate pr-3">{loop.name}</span>
                      <span className="text-white/70 text-[9px] font-black">{idx + 1}/20</span>
                      
                      {/* Copy & Delete Actions */}
                      <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all z-20">
                         <button 
                           onClick={(e) => { e.stopPropagation(); setLoopToDelete(loop.id); }} 
                           className="bg-black text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                         >
                           <Trash2 size={8} strokeWidth={3} />
                         </button>
                         <button 
                           onClick={(e) => { e.stopPropagation(); duplicateLoop(loop.id); }} 
                           className="bg-black text-white rounded-full p-1 hover:bg-blue-500 transition-colors"
                         >
                           <Copy size={8} strokeWidth={3} />
                         </button>
                      </div>
                    </div>
                  </div>
                  {idx < loops.length - 1 && (
                     <button
                        onClick={() => {
                           setActiveConnectionId(loop.id);
                           setTempDelay(loop.delayAfter || 0);
                           setShowDelayPrompt(false);
                        }}
                        className={`shrink-0 w-5 h-5 rounded-full z-10 flex items-center justify-center transition-all border-[2px] border-black shadow-[0_2px_0_0_#000] active:translate-y-1 active:shadow-none ${loop.delayAfter ? 'bg-[#22c55e] text-white' : 'bg-[#fff] text-black hover:bg-gray-200'}`}
                     >
                        <Link2 size={10} strokeWidth={4} />
                     </button>
                  )}
                </React.Fragment>
              ))}

              <div className="rounded-[16px] border-[3px] border-black shadow-[0_3px_0_0_#000] active:translate-y-[3px] active:shadow-none transition-all bg-white hover:bg-gray-100">
                <button 
                  onClick={() => {
                    let realTotalDurationMs = 0;
                    loops.forEach(l => {
                       realTotalDurationMs += (l.frames.length * l.speed) + (l.delayAfter || 0);
                    });
                    if (loops.length >= 20) {
                       alert("Достигнут лимит в 20 кусочков!");
                       return;
                    }
                    if (realTotalDurationMs >= 29900) {
                       alert("Достигнут лимит длительности в 29.9 секунд!");
                       return;
                    }
                    
                    let initialPose: any = {};
                    if (loops.length > 0) {
                       const lastLoop = loops[loops.length - 1];
                       if (lastLoop.frames.length > 0) {
                          initialPose = lastLoop.frames[lastLoop.frames.length - 1];
                       }
                    }
                    clearKeyframes(initialPose);
                    setEditingLoopId('draft');
                    setSaveLoopName(`Кусочек ${loops.length + 1}`);
                    setActivePoseSection(null);
                  }}
                  className="shrink-0 h-16 w-16 rounded-[16px] flex flex-col items-center justify-center text-black cursor-pointer transition-all disabled:opacity-50"
                >
                  <Plus size={24} strokeWidth={3} className="mb-1" />
                  <span className="text-[9px] font-black tracking-widest uppercase">Новый</span>
                </button>
              </div>

              <div className="rounded-[16px] border-[3px] border-black shadow-[0_3px_0_0_#000] active:translate-y-[3px] active:shadow-none transition-all bg-[#3b82f6] hover:bg-[#2563eb]">
                <button 
                  onClick={() => {
                     if (loops.length === 0) {
                        alert("Сначала создайте кусочек!");
                        return;
                     }
                     setSavePackPromptOpen(true);
                  }}
                  className="shrink-0 h-16 w-16 rounded-[16px] flex flex-col items-center justify-center text-white cursor-pointer transition-all disabled:opacity-50"
                >
                  <Save size={24} strokeWidth={3} className="mb-1" />
                  <span className="text-[8px] font-black tracking-wider uppercase text-center leading-none">В библ.</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

       {showExitPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
          <div className="bg-white max-w-[320px] w-full border-[3px] border-black rounded-[24px] shadow-[0_8px_0_0_rgba(0,0,0,1)] p-6 pb-7 relative">
            <button 
              onClick={() => setShowExitPrompt(false)}
              className="absolute -top-3 -right-3 w-12 h-12 bg-red-500 border-[3px] border-black rounded-full flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:bg-red-400 active:translate-y-1 active:shadow-none transition-all z-10"
            >
              <X size={28} strokeWidth={4} className="text-white" />
            </button>

            <h3 className="text-2xl font-black text-black text-center mb-3 tracking-tight uppercase leading-none">Сохранить?</h3>
            <p className="text-black/60 text-sm text-center mb-6 font-bold leading-tight">
              У вас есть несохраненные изменения в этом кусочке!
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                   if (editingLoopId === 'draft' && loops.length >= 20) {
                      alert("Достигнут лимит в 20 кусочков!");
                      setShowExitPrompt(false);
                      return;
                   }
                   saveLoop(saveLoopName || 'Loop', 0, editingLoopId === 'draft' ? undefined : editingLoopId);
                   setShowExitPrompt(false);
                   exitLoopEditor();
                }}
                className="w-full py-4 rounded-[18px] text-white bg-[#22c55e] hover:bg-[#4ade80] border-[3px] border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] font-black text-base tracking-wide active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <Check size={24} className="-ml-1" strokeWidth={4} />
                СОХРАНИТЬ
              </button>
              
              <button 
                onClick={() => {
                   setShowExitPrompt(false);
                   exitLoopEditor();
                }}
                className="w-full py-4 rounded-[18px] text-white bg-red-500 hover:bg-red-400 border-[3px] border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] font-black text-base tracking-wide active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={24} className="-ml-1" strokeWidth={3} />
                ВЫЙТИ БЕЗ СОХРАНЕНИЯ
              </button>
            </div>
          </div>
        </div>
      )}

       {showOverwriteConfirm && selectedKeyframeIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
          <div className="bg-white max-w-[320px] w-full border-[3px] border-black rounded-[24px] shadow-[0_8px_0_0_rgba(0,0,0,1)] p-6 pb-7 relative">
            <button 
              onClick={() => setShowOverwriteConfirm(false)}
              className="absolute -top-3 -right-3 w-12 h-12 bg-red-500 border-[3px] border-black rounded-full flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:bg-red-400 active:translate-y-1 active:shadow-none transition-all z-10"
            >
              <X size={28} strokeWidth={4} className="text-white" />
            </button>

            <h3 className="text-2xl font-black text-black text-center mb-3 tracking-tight uppercase leading-none">Обновить позу?</h3>
            <p className="text-black/60 text-sm text-center mb-6 font-bold leading-tight">
              Вы хотите сохранить текущие изменения в ячейку {selectedKeyframeIndex + 1}?
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  updateKeyframe(selectedKeyframeIndex, useStore.getState().devSettings);
                  setShowOverwriteConfirm(false);
                  setIsFlashing(true);
                  vibrate([15, 50, 15]);
                  setTimeout(() => setIsFlashing(false), 150);
                }}
                className="w-full py-4 rounded-[18px] text-black bg-orange-400 hover:bg-orange-300 border-[3px] border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] font-black text-base tracking-wide active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <Check size={24} className="-ml-1" strokeWidth={4} />
                ОБНОВИТЬ ПОЗУ
              </button>
            </div>
          </div>
        </div>
      )}

      {showLibrary && (
        <div className="fixed inset-0 bg-black/95 z-[99999] flex flex-col items-center justify-center p-4">
           <div className="bg-white border-[3px] border-black p-6 pb-7 rounded-[24px] w-full max-w-sm flex flex-col shadow-[0_8px_0_0_rgba(0,0,0,1)] relative max-h-[80vh]">
              <button 
                onClick={() => setShowLibrary(false)}
                className="absolute -top-3 -right-3 w-12 h-12 bg-red-500 border-[3px] border-black rounded-full flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:bg-red-400 active:translate-y-1 active:shadow-none transition-all z-10"
              >
                <X size={28} strokeWidth={4} className="text-white" />
              </button>
              
              <h3 className="text-2xl font-black text-black text-center mb-6 tracking-tight leading-none flex items-center justify-center gap-2">
                 <Library size={28} className="text-[#ff7a00]" strokeWidth={3} />
                 Библиотека флексов
              </h3>
            
            <div className="flex-1 overflow-y-auto mb-4 space-y-3 custom-scrollbar pr-2 min-h-[200px]">
              <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-[16px] border-[3px] border-black">
                <button 
                  onClick={() => setLibraryTab('flexes')}
                  className={`flex-1 py-2 font-black uppercase text-sm tracking-widest rounded-[12px] transition-all border-[3px] ${libraryTab === 'flexes' ? 'bg-[#ff7a00] text-white border-black shadow-[0_3px_0_0_#000] translate-y-[-2px]' : 'bg-transparent text-black/50 border-transparent hover:bg-black/5'}`}
                >
                  Флексы
                </button>
                <button 
                  onClick={() => setLibraryTab('shorts')}
                  className={`flex-1 py-2 font-black uppercase text-sm tracking-widest rounded-[12px] transition-all border-[3px] ${libraryTab === 'shorts' ? 'bg-[#ff7a00] text-white border-black shadow-[0_3px_0_0_#000] translate-y-[-2px]' : 'bg-transparent text-black/50 border-transparent hover:bg-black/5'}`}
                >
                  Шортс
                </button>
              </div>

              {(() => {
                const isShortPack = (pack: typeof flexPacks[0]) => pack.loops.length === 1 && pack.loops[0].frames?.length === 4 && !pack.backgroundVideoUrl && !pack.globalTrackUrl;
                const activePacks = flexPacks?.filter(p => libraryTab === 'shorts' ? isShortPack(p) : !isShortPack(p)) || [];
                
                if (activePacks.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center h-full text-black/30 font-bold py-10">
                      {libraryTab === 'flexes' ? (
                        <>
                          <Library size={48} className="mb-4 opacity-50" strokeWidth={2} />
                          <p>Библиотека пуста</p>
                          <p className="text-xs mt-2 text-center max-w-[200px]">Создайте несколько кубиков и нажмите "В библ."</p>
                        </>
                      ) : (
                        <>
                          <Video size={48} className="mb-4 opacity-50 text-[#a855f7]" strokeWidth={2} />
                          <p className="text-center px-4 uppercase tracking-wide">Шортсов пока нет!</p>
                          <p className="text-xs mt-2 text-center max-w-[250px] leading-tight text-black/40">Шортс - это флекс-пак ровно из 4 поз в одном кусочке, без видео и звукового фона.</p>
                        </>
                      )}
                    </div>
                  );
                }

                return activePacks.map((pack) => (
                  <div key={pack.id} className="bg-white border-[3px] border-black rounded-[16px] p-4 flex flex-col gap-3 group relative transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-black font-black break-words pr-2 text-lg leading-tight">{pack.name}</span>
                        <span className="text-black/50 font-bold text-xs mt-1">Кубиков: {pack.loops.length} | {new Date(pack.createdAt).toLocaleDateString()}</span>
                      </div>
                      <button 
                        onClick={() => setPackToDelete(pack.id)}
                        className="w-10 h-10 rounded-[12px] text-white flex items-center justify-center transition-all bg-[#ff4b4b] border-[3px] border-black shadow-[0_3px_0_0_#000] active:translate-y-[3px] active:shadow-none shrink-0"
                        title="Удалить флекс полностью"
                      >
                        <Trash2 size={20} strokeWidth={3} />
                      </button>
                    </div>

                    {packToDelete === pack.id ? (
                      <div className="flex flex-col gap-3 mt-2 border-t-[3px] border-black/10 pt-4">
                        <span className="text-[#ff4b4b] text-sm font-black uppercase text-center">Вы уверены?</span>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => {
                                removeFlexPack(pack.id);
                                setPackToDelete(null);
                             }}
                             className="flex-1 py-3 rounded-[16px] text-white bg-[#ff4b4b] hover:bg-red-400 border-[3px] border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] font-black uppercase tracking-wider active:translate-y-1 active:shadow-none transition-all flex items-center justify-center text-sm"
                           >Удалить</button>
                           <button 
                             onClick={() => setPackToDelete(null)}
                             className="flex-1 py-3 rounded-[16px] text-black bg-white hover:bg-gray-100 border-[3px] border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] font-black uppercase tracking-wider active:translate-y-1 active:shadow-none transition-all flex items-center justify-center text-sm"
                           >Отмена</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 mt-2 border-t-[3px] border-black/10 pt-4">
                        <button 
                          onClick={() => {
                            loadFlexPack(pack.id);
                            setShowLibrary(false);
                          }}
                          className="w-full py-3 rounded-[16px] text-white bg-[#ff7a00] hover:bg-[#e66a00] border-[3px] border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] font-black uppercase tracking-wider active:translate-y-1 active:shadow-none transition-all flex items-center justify-center text-sm"
                        >
                          Загрузить
                        </button>
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {showMediaModal && (
        <MediaLibraryModal
          type={showMediaModal}
          currentUrl={showMediaModal === 'audio' ? globalTrackUrl : backgroundVideoUrl}
          onClose={() => setShowMediaModal(null)}
          onSelect={(id) => {
             if (showMediaModal === 'audio') {
                useStore.getState().setGlobalTrackUrl(id);
                useStore.getState().setGlobalTrackFile(null);
             } else {
                useStore.getState().setBackgroundVideoUrl(id);
                useStore.getState().setBackgroundVideoFile(null);
             }
             setShowMediaModal(null);
          }}
        />
      )}

      {savePackPromptOpen && (
        <div className="fixed inset-0 bg-black/95 z-[99999] flex flex-col items-center justify-center p-4">
           <div className="bg-white border-[3px] border-black p-6 pb-7 rounded-[24px] w-full max-w-sm flex flex-col gap-4 shadow-[0_8px_0_0_rgba(0,0,0,1)] relative">
              <button 
                onClick={() => setSavePackPromptOpen(false)}
                className="absolute -top-3 -right-3 w-12 h-12 bg-red-500 border-[3px] border-black rounded-full flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:bg-red-400 active:translate-y-1 active:shadow-none transition-all z-10"
              >
                <X size={28} strokeWidth={4} className="text-white" />
              </button>
              
              <h3 className="text-black font-black text-2xl text-center uppercase leading-none tracking-tight">Сохранить Пак?</h3>
              <p className="text-black/60 text-sm flex-1 text-center font-bold">Введите название для нового пака с флексами.</p>
              
              <input
                type="text"
                autoFocus
                value={savePackName}
                onChange={(e) => setSavePackName(e.target.value)}
                className="bg-zinc-100 border-[3px] border-black text-black font-bold px-4 py-4 rounded-[16px] focus:outline-none focus:bg-white shadow-[inset_0_2px_0_0_rgba(0,0,0,0.1)]"
                placeholder="Название..."
              />
              <div className="flex gap-2 mt-2">
                 <button
                   className="flex-1 py-4 bg-orange-500 border-[3px] border-black hover:bg-orange-400 text-white rounded-[18px] font-black tracking-wide shadow-[0_4px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                   disabled={isSavingPack || !savePackName.trim()}
                   onClick={async () => {
                     if (isSavingPack || !savePackName.trim()) return;
                     
                     const state = useStore.getState();
                     if (state.loops.length === 0) {
                         setSavePackPromptOpen(false);
                         return;
                     }
                     
                     setIsSavingPack(true);
                     let audioUrl = state.globalTrackUrl;
                     let videoUrl = state.backgroundVideoUrl;
                     
                     try {
                         const { ApiService } = await import('../../../services/ApiService');
                         
                         const newPackId = `flex_${Date.now()}`;
                         const newPack = {
                           id: newPackId,
                           name: savePackName.trim(),
                           loops: [...state.loops],
                           globalTrackUrl: audioUrl,
                           backgroundVideoUrl: videoUrl,
                           createdAt: Date.now()
                         };
                         
                         // Upload JSON to library (Supabase peep_media packs folder)
                         if (state.profile) {
                             const jsonBlob = new Blob([JSON.stringify(newPack, null, 2)], { type: 'application/json' });
                             await ApiService.uploadMedia('peep_media', `packs/${state.profile.id}/${newPackId}.json`, jsonBlob);
                             
                             // Upload associated media if it's a local database file
                             if (audioUrl && audioUrl.startsWith('local_')) {
                                const audioFile = state.globalTrackFile || await import('../../../lib/db').then(m => m.getMediaDB(audioUrl));
                                if (audioFile) {
                                  await ApiService.uploadMedia('peep_media', audioUrl, audioFile as Blob, { upsert: true });
                                }
                             }
                             if (videoUrl && videoUrl.startsWith('local_')) {
                                const videoFile = state.backgroundVideoFile || await import('../../../lib/db').then(m => m.getMediaDB(videoUrl));
                                if (videoFile) {
                                  await ApiService.uploadMedia('peep_media', videoUrl, videoFile as Blob, { upsert: true });
                                }
                             }
                         }
                         
                         // Save to local Zustand store
                         useStore.getState().saveFlexPack(savePackName.trim(), newPackId);
                         setSavePackPromptOpen(false);
                         setShowLibrary(true);
                     } catch (e) {
                         console.error("Failed to save pack to Supabase:", e);
                         alert("Ошибка при сохранении пакета в библиотеку.");
                     } finally {
                         setIsSavingPack(false);
                     }
                   }}
                 >
                   {isSavingPack ? 'СОХРАНЕНИЕ...' : <><Check size={24} strokeWidth={4} /> СОХРАНИТЬ</>}
                 </button>
              </div>
           </div>
        </div>
      )}

      {activeConnectionId && (
        <div className="fixed inset-0 bg-black/95 z-[99999] flex flex-col items-center justify-center p-4">
           <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm flex flex-col gap-4 shadow-2xl relative">
              <button 
                onClick={() => {
                   const originalLoop = loops.find(l => l.id === activeConnectionId);
                   if (originalLoop?.delayAfter !== tempDelay) {
                      setShowDelayPrompt(true);
                   } else {
                      setActiveConnectionId(null);
                   }
                }}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                title="Закрыть"
              >
                 <X size={20} />
              </button>

              <h3 className="text-white font-bold text-center text-lg pr-6">Пауза между кусочками</h3>
              
              <div className="flex justify-between items-center mt-2">
                 <span className="text-white/50 text-xs">0s</span>
                 <span className="text-purple-400 font-mono font-bold text-xl">{(tempDelay / 1000).toFixed(1)}s</span>
                 <span className="text-white/50 text-xs">1s</span>
              </div>
              
              <input
                type="range"
                min="0"
                max="1000"
                step="100"
                value={tempDelay}
                onChange={(e) => setTempDelay(Number(e.target.value))}
                className="w-full h-2 bg-black/80 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />

              {showDelayPrompt && (
                <div className="mt-6 flex flex-col gap-3 p-4 bg-black/80 rounded-xl border border-white/10">
                   <p className="text-white text-center text-sm mb-1">Сохранить изменения?</p>
                   <div className="flex gap-2">
                     <button
                       className="flex-1 py-2.5 bg-black/80 hover:bg-black/80 text-white rounded-lg font-bold transition-all text-sm"
                       onClick={() => {
                          setActiveConnectionId(null);
                          setShowDelayPrompt(false);
                       }}
                     >
                       Продолжить
                     </button>
                     <button
                       className="flex-1 py-2.5 bg-green-500 hover:bg-green-400 text-white rounded-lg font-bold transition-all text-sm shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                       onClick={() => {
                          updateLoopDelay(activeConnectionId, tempDelay);
                          setActiveConnectionId(null);
                          setShowDelayPrompt(false);
                       }}
                     >
                       Сохранить
                     </button>
                   </div>
                </div>
              )}
           </div>
        </div>
      )}

      {loopToDelete && (
        <div className="fixed inset-0 bg-black/95 z-[99999] flex flex-col items-center justify-center p-4">
           <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm flex flex-col gap-4 shadow-2xl">
              <h3 className="text-white font-bold text-center text-lg">Удалить кусочек?</h3>
              <p className="text-white/70 text-center text-sm">Вы уверены, что хотите полностью удалить этот кусочек?</p>
              <div className="flex gap-2 mt-2">
                 <button
                   className="flex-1 py-3 bg-black/80 hover:bg-black/80 text-white rounded-xl font-bold transition-all"
                   onClick={() => setLoopToDelete(null)}
                 >
                   Отмена
                 </button>
                 <button
                   className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl font-bold transition-all"
                   onClick={() => {
                     removeLoop(loopToDelete);
                     if (editingLoopId === loopToDelete) {
                         setEditingLoopId(null);
                         clearKeyframes({});
                     }
                     setLoopToDelete(null);
                   }}
                 >
                   Да, удалить
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
});
