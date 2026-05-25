import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { defaultDevSettings } from '../../store/defaults';
import { Slider } from './common/Slider';
import { Move, Sun, Lightbulb, Palette, Zap, Copy, Settings2, Camera } from 'lucide-react';

type DevTab = 'camera' | 'spot' | 'pink' | 'cyan' | 'ambient' | 'backFill';
type ModeType = 'pos' | 'settings';

export const DevUI: React.FC = () => {
  const isDevUiOpen = useStore(state => state.isDevUiOpen);
  const setIsDevUiOpen = useStore(state => state.setIsDevUiOpen);
  const [activeTab, setActiveTab] = useState<DevTab>('camera');
  const [activeMode, setActiveMode] = useState<ModeType>('pos');
  const [savedIntensities, setSavedIntensities] = useState<Record<string, number>>({});
  const devSettings = useStore(state => state.devSettings);
  const updateDevSettings = useStore(state => state.updateDevSettings);
  const appMode = useStore(state => state.appMode);
  const isUiHidden = useStore(state => state.isUiHidden);
  const isBodyEditorOpen = useStore(state => state.isBodyEditorOpen);

  const isWorld = appMode === 'world';
  const distKey: keyof typeof devSettings = isWorld ? 'worldCameraDistance' : 'cameraDistance';
  const pitchKey: keyof typeof devSettings = isWorld ? 'worldCameraPitch' : 'cameraPitch';
  const heightKey: keyof typeof devSettings = isWorld ? 'worldCameraHeight' : 'cameraHeight';

  if (isUiHidden) return null;

  const handleCopy = () => {
    const exportedSettings = {
      ...(isWorld ? {
        worldCameraDistance: devSettings.worldCameraDistance ?? 5.5,
        worldCameraPitch: devSettings.worldCameraPitch ?? 0,
        worldCameraHeight: devSettings.worldCameraHeight ?? 1.2,
      } : {
        cameraDistance: devSettings.cameraDistance ?? defaultDevSettings.cameraDistance,
        cameraHeight: devSettings.cameraHeight ?? defaultDevSettings.cameraHeight,
        cameraPitch: devSettings.cameraPitch ?? defaultDevSettings.cameraPitch,
      }),
      spotLightPosX: devSettings.spotLightPosX ?? defaultDevSettings.spotLightPosX,
      spotLightPosY: devSettings.spotLightPosY ?? defaultDevSettings.spotLightPosY,
      spotLightPosZ: devSettings.spotLightPosZ ?? defaultDevSettings.spotLightPosZ,
      spotLightAngle: devSettings.spotLightAngle ?? defaultDevSettings.spotLightAngle,
      spotLightPenumbra: devSettings.spotLightPenumbra ?? defaultDevSettings.spotLightPenumbra,
      spotLightIntensity: devSettings.spotLightIntensity ?? defaultDevSettings.spotLightIntensity,
      rimPinkPosX: devSettings.rimPinkPosX ?? defaultDevSettings.rimPinkPosX,
      rimPinkPosY: devSettings.rimPinkPosY ?? defaultDevSettings.rimPinkPosY,
      rimPinkPosZ: devSettings.rimPinkPosZ ?? defaultDevSettings.rimPinkPosZ,
      rimPinkIntensity: devSettings.rimPinkIntensity ?? defaultDevSettings.rimPinkIntensity,
      rimCyanPosX: devSettings.rimCyanPosX ?? defaultDevSettings.rimCyanPosX,
      rimCyanPosY: devSettings.rimCyanPosY ?? defaultDevSettings.rimCyanPosY,
      rimCyanPosZ: devSettings.rimCyanPosZ ?? defaultDevSettings.rimCyanPosZ,
      rimCyanIntensity: devSettings.rimCyanIntensity ?? defaultDevSettings.rimCyanIntensity,
      backFillPosX: devSettings.backFillPosX ?? defaultDevSettings.backFillPosX,
      backFillPosY: devSettings.backFillPosY ?? defaultDevSettings.backFillPosY,
      backFillPosZ: devSettings.backFillPosZ ?? defaultDevSettings.backFillPosZ,
      backFillIntensity: devSettings.backFillIntensity ?? defaultDevSettings.backFillIntensity,
      ambientIntensity: devSettings.ambientIntensity ?? defaultDevSettings.ambientIntensity,
    };
    navigator.clipboard.writeText(JSON.stringify(exportedSettings, null, 2));
  };

  const renderSliders = () => {
    const renderSlider = (key: keyof typeof devSettings, label: string, min: number, max: number, step = 0.1, fallbackVal = 0) => {
      const fallback = ['worldCameraDistance'].includes(key) ? 5.5 : ['worldCameraHeight'].includes(key) ? 1.2 : ['worldCameraPitch'].includes(key) ? 0 : defaultDevSettings[key as keyof typeof defaultDevSettings];
      const val = devSettings[key] ?? fallback;
      return (
        <Slider
          key={key}
          theme="dark"
          label={label}
          value={val as number}
          min={min}
          max={max}
          step={step}
          onChange={(v) => updateDevSettings({ [key]: v })}
          showValue
        />
      );
    };

    if (activeTab === 'camera') {
      return (
        <div className="space-y-4">
          <h4 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">{appMode === 'editor' ? 'Editor' : (appMode === 'world' ? 'World' : 'Room')} Camera</h4>
          {appMode === 'editor' ? (
            <>
              {renderSlider('cameraDistance', 'Distance (Zoom)', 0.5, 50, 0.5)}
              {renderSlider('cameraHeight', 'Height (Y-Offset)', -5, 20, 0.1)}
              {renderSlider('cameraPitch', 'Pitch (Tilt)', -Math.PI / 2, Math.PI / 2, 0.05)}
            </>
          ) : (
            <div className="text-white/60 text-xs italic">
              Camera is locked to default scene settings.
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'ambient') {
      return (
        <div className="space-y-4">
          <h4 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Ambient Light</h4>
          {renderSlider('ambientIntensity', 'Intensity', 0, 5)}
        </div>
      );
    }

    if (activeTab === 'backFill') {
      if (activeMode === 'pos') {
        return (
          <div className="space-y-4">
            <h4 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Fill Position</h4>
            {renderSlider('backFillPosX', 'X Position', -360, 360)}
            {renderSlider('backFillPosY', 'Y Position', -360, 360)}
            {renderSlider('backFillPosZ', 'Z Position', -360, 360)}
          </div>
        );
      }
      if (activeMode === 'settings') {
        return (
          <div className="space-y-4">
            <h4 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Fill Settings</h4>
            {renderSlider('backFillIntensity', 'Intensity', 0, 50)}
          </div>
        );
      }
    }

    if (activeTab === 'spot') {
      if (activeMode === 'pos') {
        return (
          <div className="space-y-4">
            <h4 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Spotlight Position</h4>
            {renderSlider('spotLightPosX', 'X Position', -360, 360)}
            {renderSlider('spotLightPosY', 'Y Position', -360, 360)}
            {renderSlider('spotLightPosZ', 'Z Position', -360, 360)}
          </div>
        );
      }
      if (activeMode === 'settings') {
        return (
          <div className="space-y-4">
            <h4 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Spotlight Settings</h4>
            {renderSlider('spotLightIntensity', 'Intensity', 0, 50)}
            {renderSlider('spotLightAngle', 'Angle', 0, Math.PI / 2, 0.01)}
            {renderSlider('spotLightPenumbra', 'Penumbra', 0, 1, 0.01)}
          </div>
        );
      }
    }

    if (activeTab === 'pink') {
      if (activeMode === 'pos') {
        return (
          <div className="space-y-4">
            <h4 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Pink Rim Position</h4>
            {renderSlider('rimPinkPosX', 'X Position', -360, 360)}
            {renderSlider('rimPinkPosY', 'Y Position', -360, 360)}
            {renderSlider('rimPinkPosZ', 'Z Position', -360, 360)}
          </div>
        );
      }
      if (activeMode === 'settings') {
        return (
          <div className="space-y-4">
            <h4 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Pink Rim Settings</h4>
            {renderSlider('rimPinkIntensity', 'Intensity', 0, 20)}
          </div>
        );
      }
    }

    if (activeTab === 'cyan') {
      if (activeMode === 'pos') {
        return (
          <div className="space-y-4">
            <h4 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Cyan Rim Position</h4>
            {renderSlider('rimCyanPosX', 'X Position', -360, 360)}
            {renderSlider('rimCyanPosY', 'Y Position', -360, 360)}
            {renderSlider('rimCyanPosZ', 'Z Position', -360, 360)}
          </div>
        );
      }
      if (activeMode === 'settings') {
        return (
          <div className="space-y-4">
            <h4 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Cyan Rim Settings</h4>
            {renderSlider('rimCyanIntensity', 'Intensity', 0, 20)}
          </div>
        );
      }
    }

    return null;
  };

  const TabButton = ({ type, icon: Icon, colorClass }: { type: DevTab, icon: any, colorClass: string }) => {
    let key: keyof typeof devSettings | null = null;
    if (type === 'spot') key = 'spotLightIntensity';
    else if (type === 'pink') key = 'rimPinkIntensity';
    else if (type === 'cyan') key = 'rimCyanIntensity';
    else if (type === 'ambient') key = 'ambientIntensity';
    else if (type === 'backFill') key = 'backFillIntensity';

    const currentVal = key ? (devSettings[key] ?? defaultDevSettings[key as keyof typeof defaultDevSettings]) as number : null;
    const isLightOff = currentVal !== null && currentVal === 0;

    const handleDoubleClick = () => {
      if (!key) return;
      if (!isLightOff) {
        setSavedIntensities(prev => ({ ...prev, [type]: currentVal as number }));
        updateDevSettings({ [key]: 0 });
      } else {
        const restoreVal = savedIntensities[type] || defaultDevSettings[key as keyof typeof defaultDevSettings] || 5;
        updateDevSettings({ [key]: restoreVal });
      }
    };

    const isActive = activeTab === type;
    const activeStyle = isLightOff ? 'bg-black text-gray-500 border border-gray-700' : colorClass;

    return (
      <button
        onClick={() => setActiveTab(type)}
        onDoubleClick={handleDoubleClick}
        className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 relative group
          ${isActive ? activeStyle : isLightOff ? 'bg-black/95 text-gray-700 border border-white/5 hover:bg-black hover:text-gray-500' : 'bg-black/95 text-white/50 border border-white/10 hover:bg-black hover:text-white'}
        `}
      >
        <Icon size={20} />
      </button>
    );
  };

  const ModeButton = ({ mode, icon: Icon, colorClass }: { mode: ModeType, icon: any, colorClass: string }) => {
    const isActive = activeMode === mode;
    return (
      <button
        onClick={() => setActiveMode(mode)}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 relative group
          ${isActive ? colorClass : 'bg-black/95 text-white/50 border border-white/10 hover:bg-black hover:text-white'}
        `}
      >
        <Icon size={20} />
      </button>
    );
  };

  return (
    <div className={`transition-opacity duration-300 ${isBodyEditorOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {appMode !== 'room' && appMode !== 'roomEditor' && (
        <button 
          onClick={() => setIsDevUiOpen(!isDevUiOpen)}
          className={`fixed top-0 left-[80px] z-[100] w-12 h-12 bg-black/90 border border-white/10 border-t-0 border-l-0 rounded-br-2xl flex items-center justify-center text-white/60 hover:text-white transition-colors ${isDevUiOpen ? 'text-white border-purple-500' : ''}`}
        >
          <Settings2 size={20} className={isDevUiOpen ? "text-purple-400" : ""} />
        </button>
      )}

      <div className={`fixed left-0 top-14 z-[99] pointer-events-none transition-all duration-300 flex justify-start max-w-[90vw] ${isDevUiOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
        <div className="flex gap-2 ml-2">
          
          {/* Sliders Area */}
          <div className="pointer-events-auto w-[280px] sm:w-[320px] max-h-[70vh] overflow-y-auto bg-transparent p-5 flex flex-col custom-scrollbar">
            <div className="flex-1">
              {renderSliders()}
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={handleCopy}
                className="w-full py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/40 hover:to-orange-500/40 border border-white/20 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(234,179,8,0.4)]"
              >
                <Copy size={16} />
                Copy Config
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {/* Vertical Toolbar for Main Categories */}
            <div className="flex flex-col gap-2 pointer-events-auto bg-black/95 p-1.5 rounded-2xl border border-white/10 shadow-xl shrink-0 h-fit">
              <TabButton type="camera" icon={Camera} colorClass="bg-white text-black border border-white shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
              <TabButton type="spot" icon={Lightbulb} colorClass="bg-white text-black border border-white shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
              <TabButton type="pink" icon={Palette} colorClass="bg-pink-500 text-white border border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.8)]" />
              <TabButton type="cyan" icon={Palette} colorClass="bg-cyan-500 text-white border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
              <TabButton type="backFill" icon={Sun} colorClass="bg-gray-400 text-white border border-gray-300 shadow-[0_0_15px_rgba(156,163,175,0.8)]" />
              <TabButton type="ambient" icon={Sun} colorClass="bg-yellow-500 text-white border border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.8)]" />
            </div>

            {/* Mode Selector (Only if spot, pink, cyan, or backFill) */}
            {['spot', 'pink', 'cyan', 'backFill'].includes(activeTab) && (
              <div className="flex flex-col gap-2 bg-black/95 p-1.5 rounded-2xl border border-white/10 shadow-xl shrink-0 h-fit pointer-events-auto">
                <ModeButton mode="pos" icon={Move} colorClass="bg-green-500 text-white border border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
                <ModeButton mode="settings" icon={Zap} colorClass="bg-blue-500 text-white border border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
