import React, { useState } from 'react';
import { useStore, TabType } from '../../../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { Palette, Smile, X, Crown, Shirt, ChevronLeft, ChevronRight, Type, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import { Slider } from '../../../components/ui/common/Slider';

const tabs: { id: TabType; label: string; icon: React.FC<any> }[] = [
  { id: 'body', label: 'Форма', icon: Smile },
  { id: 'colors', label: 'Цвета', icon: Palette },
];

const bodyPresets = [
  { torsoLength: 1.694, legLength: 1.573, armLength: 1.331, torsoRadius: 0.7725, armThickness: 0.19440000000000002, legThickness: 0.30240000000000006, headSize: 0.71 },
  { torsoLength: 1.694, legLength: 1.573, armLength: 1.331, torsoRadius: 1.1400000000000001, armThickness: 0.2862, legThickness: 0.44520000000000004, headSize: 0.71 },
  { torsoLength: 1.694, legLength: 1.573, armLength: 1.331, torsoRadius: 1.2374999999999998, armThickness: 0.3276, legThickness: 0.5096, headSize: 0.8 },
  { torsoLength: 1.442, legLength: 1.3390000000000002, armLength: 1.1330000000000002, torsoRadius: 0.8025, armThickness: 0.1692, legThickness: 0.2632, headSize: 0.77 },
  { torsoLength: 1.442, legLength: 1.3390000000000002, armLength: 1.1330000000000002, torsoRadius: 1.065, armThickness: 0.2646, legThickness: 0.4116, headSize: 0.81 },
  { torsoLength: 1.442, legLength: 1.3390000000000002, armLength: 1.1330000000000002, torsoRadius: 1.2374999999999998, armThickness: 0.3276, legThickness: 0.5096, headSize: 0.81 },
  { torsoLength: 0.9099999999999999, legLength: 0.8450000000000001, armLength: 0.7150000000000001, torsoRadius: 1.2374999999999998, armThickness: 0.3276, legThickness: 0.5096, headSize: 0.92 }
];

const ColorCircle = ({ color, selected, onClick, className = '' }: any) => (
  <button
    onClick={onClick}
    className={`shrink-0 transition-all snap-center border-[2px] border-black ${selected ? 'scale-110 shadow-[0_2px_0_0_#000] z-10' : 'hover:scale-105'} ${className || 'w-8 h-8 rounded-full'}`}
    style={{ backgroundColor: color }}
  />
);

const palette = [
  '#F4C430', '#E34234', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#ffffff', '#111827'
];

export const BodyEditorOverlay = () => {
  const isBodyEditorOpen = useStore(state => state.isBodyEditorOpen);
  
  if (!isBodyEditorOpen) return null;

  return <BodyEditorOverlayContent />;
};

const BodyEditorOverlayContent = React.memo(() => {
  const [colorsSubTab, setColorsSubTab] = useState<'solid' | 'gradients' | 'effects'>('solid');
  const [presetIndex, setPresetIndex] = useState(0);
  const { 
    setIsBodyEditorOpen, 
    activeTab, setActiveTab, 
    selectedColorPart, setSelectedColorPart,
    characterConfig, updateCharacterConfig,
    profile
  } = useStore(useShallow(state => ({
    setIsBodyEditorOpen: state.setIsBodyEditorOpen,
    activeTab: state.activeTab,
    setActiveTab: state.setActiveTab,
    selectedColorPart: state.selectedColorPart,
    setSelectedColorPart: state.setSelectedColorPart,
    characterConfig: state.characterConfig,
    updateCharacterConfig: state.updateCharacterConfig,
    profile: state.profile
  })));

  const handlePrevPreset = () => {
    const newIndex = (presetIndex - 1 + bodyPresets.length) % bodyPresets.length;
    setPresetIndex(newIndex);
    updateCharacterConfig(bodyPresets[newIndex]);
  };

  const handleNextPreset = () => {
    const newIndex = (presetIndex + 1) % bodyPresets.length;
    setPresetIndex(newIndex);
    updateCharacterConfig(bodyPresets[newIndex]);
  };

  const getColor = (partId: string) => {
    const val = characterConfig[partId as keyof typeof characterConfig];
    if (val) return val as string;
    const isLegPart = partId.includes('Hip') || partId.includes('Knee') || partId.includes('Shoe');
    return isLegPart ? (characterConfig.legColor || '#E34234') : (characterConfig.mainColor || '#F4C430');
  };

  const DummyPart = ({ id, w, h, rounded = 'rounded-full' }: {id: string, w: string, h: string, rounded?: string}) => {
    const isSelected = selectedColorPart === id;
    const color = getColor(id);
    
    let bgStyle: any = { background: color };
    if (color === 'p1') bgStyle = { background: '#4B5320' }; 
    else if (color === 'p2') bgStyle = { background: '#ffffff' };
    else if (color === 'p3') bgStyle = { background: 'linear-gradient(to top, #ffcc00, #ff4500)' };
    else if (color === 'p4') bgStyle = { background: '#00008b' };
    else if (color === 'p5') bgStyle = { background: '#ffff00' };
    else if (color === 'p6') bgStyle = { background: '#ff0000', backgroundImage: 'radial-gradient(circle, #fff 30%, transparent 30%)', backgroundSize: '10px 10px' };
    else if (color === 'p7') bgStyle = { background: '#111827' };
    else if (color === 'p8') bgStyle = { background: '#facc15' };
    else if (color === 'p9') bgStyle = { background: '#facc9e' };
    else if (color === 'p10') bgStyle = { background: '#111111' };

    return (
      <button
        onClick={() => setSelectedColorPart(id)}
        style={bgStyle}
        title={id}
        className={`${w} ${h} ${rounded} transition-all duration-200 border-[2px] border-black ${isSelected ? 'scale-110 shadow-[0_2px_0_0_#000] z-10' : 'hover:scale-105'}`}
      />
    );
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-[60] flex flex-col justify-start pt-8 px-4">
      {/* Top Right Close Button */}
      <div className="absolute top-0 right-0 pointer-events-auto z-[100]">
        <div className="rounded-bl-[28px] border-b-[3px] border-l-[3px] border-black shadow-[-3px_3px_0_0_#000] bg-[#8b5cf6]">
          <button 
            onClick={() => setIsBodyEditorOpen(false)}
            className="w-12 h-12 bg-transparent rounded-bl-[28px] flex flex-col items-center justify-center text-white hover:bg-[#a78bfa] hover:text-white transition-all active:translate-y-1 active:-translate-x-1"
          >
            <X size={24} className="ml-1 mb-1" strokeWidth={3}/>
          </button>
        </div>
      </div>

      {/* Main Panel */}
      <div className="pointer-events-auto w-full max-w-sm mr-auto ml-0 flex flex-col items-start gap-4 mt-6">
        
        {/* Tab & Content Container */}
        <div className="w-full flex flex-col gap-2">
          
          {/* Tabs */}
          <div className="rounded-[24px] w-full max-w-md mx-auto border-[3px] border-black shadow-[0_3px_0_0_#000] bg-[#8b5cf6]">
            <div className="flex p-1 w-full gap-1">
            <button 
              onClick={() => setActiveTab('body')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-[18px] font-black tracking-widest text-[10px] uppercase transition-colors border-[2px] border-transparent ${activeTab === 'body' ? 'bg-[#ff6b00] text-white border-black shadow-[0_2px_0_0_#000]' : 'text-white hover:bg-[#a78bfa]'}`}
            >
              <Shirt size={18} strokeWidth={3} /> Форма
            </button>
            <button 
              onClick={() => setActiveTab('colors')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-[18px] font-black tracking-widest text-[10px] uppercase transition-colors border-[2px] border-transparent ${activeTab === 'colors' ? 'bg-[#ff6b00] text-white border-black shadow-[0_2px_0_0_#000]' : 'text-white hover:bg-[#a78bfa]'}`}
            >
              <Palette size={18} strokeWidth={3} /> Цвет
            </button>
            <button 
              onClick={() => setActiveTab('accessories')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-[18px] font-black tracking-widest text-[10px] uppercase transition-colors border-[2px] border-transparent ${activeTab === 'accessories' ? 'bg-[#ff6b00] text-white border-black shadow-[0_2px_0_0_#000]' : 'text-white hover:bg-[#a78bfa]'}`}
            >
              <Crown size={18} strokeWidth={3} /> Аксы
            </button>
            <button 
              onClick={() => setActiveTab('effects')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-[18px] font-black tracking-widest text-[10px] transition-colors border-[2px] border-transparent ${activeTab === 'effects' ? 'bg-[#ff6b00] text-white border-black shadow-[0_2px_0_0_#000]' : 'text-white hover:bg-[#a78bfa] uppercase'}`}
            >
              <Smile size={18} strokeWidth={3} /> Настроение
            </button>
            <button 
              onClick={() => setActiveTab('decal')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-[18px] font-black tracking-widest text-[10px] uppercase transition-colors border-[2px] border-transparent ${activeTab === 'decal' ? 'bg-[#ff6b00] text-white border-black shadow-[0_2px_0_0_#000]' : 'text-white hover:bg-[#a78bfa]'}`}
            >
              <Type size={18} strokeWidth={3} /> Лейба
            </button>
            </div>
          </div>

          {/* Form Sliders Removed From Here */}

          {/* Colors Rows */}
          {activeTab === 'colors' && (
            <div className="p-3 flex justify-end">
              {/* Right Side: Mini Interactive Dummy */}
              <div className="rounded-2xl border-[3px] border-black shadow-[0_3px_0_0_#000] scale-[0.8] origin-right shrink-0 bg-[#8b5cf6]">
                <div className="flex items-center justify-center p-3 rounded-2xl bg-transparent">
                  <div className="flex flex-col items-center gap-[2px]">
                  {/* Head */}
                  <DummyPart id="headColor" w="w-10" h="h-10" rounded="rounded-full" />
                  
                  <div className="flex gap-[2px] items-start mt-1">
                    {/* Left Arm visually */}
                    <div className="flex flex-col items-center gap-[2px] mt-1">
                      <DummyPart id="leftShoulderColor" w="w-4" h="h-7" rounded="rounded-full" />
                      <DummyPart id="leftElbowColor" w="w-4" h="h-6" rounded="rounded-full" />
                      <DummyPart id="leftHandColor" w="w-4" h="h-4" rounded="rounded-full" />
                    </div>

                    {/* Torso */}
                    <div className="flex flex-col gap-[2px]">
                      <DummyPart id="torsoColor" w="w-12" h="h-14" rounded="rounded-[12px]" />
                      
                      {/* Legs */}
                      <div className="flex gap-1 justify-center mt-1">
                        {/* Left Leg visually */}
                        <div className="flex flex-col items-center gap-[2px]">
                            <DummyPart id="leftHipColor" w="w-5" h="h-7" rounded="rounded-md" />
                            <DummyPart id="leftKneeColor" w="w-5" h="h-7" rounded="rounded-md" />
                            <DummyPart id="leftShoeColor" w="w-[22px]" h="h-3" rounded="rounded-md" />
                        </div>
                        {/* Right Leg visually */}
                        <div className="flex flex-col items-center gap-[2px]">
                            <DummyPart id="rightHipColor" w="w-5" h="h-7" rounded="rounded-md" />
                            <DummyPart id="rightKneeColor" w="w-5" h="h-7" rounded="rounded-md" />
                            <DummyPart id="rightShoeColor" w="w-[22px]" h="h-3" rounded="rounded-md" />
                        </div>
                      </div>
                    </div>

                    {/* Right Arm visually */}
                    <div className="flex flex-col items-center gap-[2px] mt-1">
                      <DummyPart id="rightShoulderColor" w="w-4" h="h-7" rounded="rounded-full" />
                      <DummyPart id="rightElbowColor" w="w-4" h="h-6" rounded="rounded-full" />
                      <DummyPart id="rightHandColor" w="w-4" h="h-4" rounded="rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}


        </div>
      </div>
      
      {/* Side Arrows for Body Presets */}
      {activeTab === 'body' && (
        <div className="absolute inset-0 pointer-events-none z-[80] flex items-center justify-between px-2" style={{ top: '60%', bottom: 'auto', transform: 'translateY(-50%)' }}>
          <button 
            onClick={handlePrevPreset}
            className="pointer-events-auto w-14 h-14 flex items-center justify-center bg-[#8b5cf6] rounded-full text-white hover:bg-[#a78bfa] transition-all border-[3px] border-black shadow-[0_3px_0_0_#000] active:translate-y-1 active:shadow-none"
          >
            <ChevronLeft size={36} strokeWidth={3} />
          </button>
          <button 
            onClick={handleNextPreset}
            className="pointer-events-auto w-14 h-14 flex items-center justify-center bg-[#8b5cf6] rounded-full text-white hover:bg-[#a78bfa] transition-all border-[3px] border-black shadow-[0_3px_0_0_#000] active:translate-y-1 active:shadow-none"
          >
            <ChevronRight size={36} strokeWidth={3} />
          </button>
        </div>
      )}

      {/* Bottom Panel for Colors / Gradients / Effects */}
      {activeTab === 'colors' && (
        <div className="absolute bottom-[20px] left-0 right-0 px-2 pointer-events-auto flex flex-col items-center z-[70]">
          <div className="w-full max-w-md bg-[#8b5cf6] border-[3px] border-black rounded-[28px] shadow-[0_4px_0_0_#000]">
            <div className="w-full p-2 flex flex-col gap-2">
            {/* Sub-tabs inside colors */}
            <div className="flex bg-[#a78bfa] border-[2px] border-black rounded-[20px] p-1 w-full gap-1">
              <button 
                onClick={() => setColorsSubTab('solid')}
                className={`flex-1 py-1.5 rounded-[16px] font-black tracking-widest text-[10px] uppercase transition-colors border-[2px] border-transparent ${colorsSubTab === 'solid' ? 'bg-[#ff6b00] text-white border-black shadow-[0_2px_0_0_#000]' : 'text-white hover:bg-black/80'}`}
              >
                Обычные
              </button>
              <button 
                onClick={() => setColorsSubTab('gradients')}
                className={`flex-1 py-1.5 rounded-[16px] font-black tracking-widest text-[10px] uppercase transition-colors border-[2px] border-transparent ${colorsSubTab === 'gradients' ? 'bg-[#ff6b00] text-white border-black shadow-[0_2px_0_0_#000]' : 'text-white hover:bg-black/80'}`}
              >
                Градиенты
              </button>
              <button 
                onClick={() => setColorsSubTab('effects')}
                className={`flex-1 py-1.5 rounded-[16px] font-black tracking-widest text-[10px] uppercase transition-colors border-[2px] border-transparent ${colorsSubTab === 'effects' ? 'bg-[#ff6b00] text-white border-black shadow-[0_2px_0_0_#000]' : 'text-white hover:bg-black/80'}`}
              >
                Эффекты
              </button>
            </div>

            <div className="px-1 pb-1">
              {colorsSubTab === 'solid' && (
                <div className="flex gap-2 overflow-x-auto min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {palette.slice(0, 10).map(c => {
                    const val = characterConfig[selectedColorPart as keyof typeof characterConfig];
                    const isLegPart = selectedColorPart.includes('Hip') || selectedColorPart.includes('Knee') || selectedColorPart.includes('Shoe');
                    const fallback = isLegPart ? characterConfig.legColor : characterConfig.mainColor;
                    const isSelected = val === c || (val === undefined && fallback === c);
                    return (
                      <ColorCircle 
                        key={c}
                        color={c} 
                        selected={isSelected} 
                        onClick={() => updateCharacterConfig({ [selectedColorPart]: c })} 
                        className="w-10 h-10 rounded-full"
                      />
                    );
                  })}
                </div>
              )}

              {colorsSubTab === 'gradients' && (
                <div className="flex gap-2 overflow-x-auto min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {[
                    {id:'g1', css:'linear-gradient(45deg, #ff0000, #0000ff)'},
                    {id:'g2', css:'linear-gradient(45deg, #00ff00, #ffff00)'},
                    {id:'g3', css:'linear-gradient(45deg, #ff00ff, #00ffff)'},
                    {id:'g4', css:'linear-gradient(45deg, #ff8800, #ff0088)'},
                    {id:'g5', css:'linear-gradient(45deg, #000000, #ffffff)'},
                    {id:'g6', css:'linear-gradient(45deg, #8800ff, #ff0088)'},
                    {id:'g7', css:'linear-gradient(45deg, #00ffff, #0000ff)'},
                    {id:'g8', css:'linear-gradient(45deg, #ffff00, #ff0000)'},
                    {id:'g9', css:'linear-gradient(45deg, #00ff00, #0000ff)'},
                    {id:'g10', css:'linear-gradient(45deg, #ff00ff, #ffff00)'},
                  ].map(g => {
                    const isSelected = characterConfig[selectedColorPart as keyof typeof characterConfig] === g.css;
                    return (
                      <button
                        key={g.id}
                        onClick={() => updateCharacterConfig({ [selectedColorPart]: g.css })}
                        className={`shrink-0 w-10 h-10 rounded-full border-[2px] border-black relative transition-transform ${isSelected ? 'scale-110 shadow-[0_2px_0_0_#000] z-10 box-border' : 'hover:scale-105'}`}
                        style={{ background: g.css }}
                      />
                    );
                  })}
                </div>
              )}

              {colorsSubTab === 'effects' && (
                <div className="flex gap-2 overflow-x-auto min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {[
                    {id:'p1', name:'🪖'},
                    {id:'p2', name:'✨'},
                    {id:'p3', name:'🔥'},
                    {id:'p4', name:'🌊'},
                    {id:'p5', name:'⚡'},
                    {id:'p6', name:'🔴'},
                    {id:'p7', name:'❓'},
                    {id:'p8', name:'😐'},
                    {id:'p9', name:'📜'},
                    {id:'p10', name:'💀'},
                  ].map(p => {
                    const isSelected = characterConfig[selectedColorPart as keyof typeof characterConfig] === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => updateCharacterConfig({ [selectedColorPart]: p.id })}
                        className={`shrink-0 w-10 h-10 text-xl rounded-full border-[2px] border-black relative transition-transform ${isSelected ? 'scale-110 shadow-[0_2px_0_0_#000] z-10 bg-black/80' : 'hover:scale-105 hover:bg-black/80'} flex items-center justify-center`}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Bottom Panel for Accessories */}
      {activeTab === 'accessories' && (
        <div className="absolute bottom-[20px] left-0 right-0 px-2 pointer-events-auto flex flex-col items-center z-[70]">
          <div className="w-full max-w-md bg-[#8b5cf6] border-[3px] border-black rounded-[24px] shadow-[0_4px_0_0_#000]">
            <div className="w-full p-3 flex flex-col gap-2.5">
            {/* 1. Head Accessories */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black tracking-widest text-[#cfb6ff] uppercase px-1">Аксессуары (Голова)</span>
              <div className="flex gap-2 overflow-x-auto min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {[
                  {id: undefined, name: '❌'},
                  {id:'h1', name:'🎩'},
                  {id:'h2', name:'🤡'},
                  {id:'h3', name:'🐼'},
                  {id:'h4', name:'👼'},
                  {id:'h5', name:'👑'},
                  {id:'h6', name:'📺'},
                ].map(p => {
                  const isSelected = characterConfig.headAccessory === p.id;
                  return (
                    <button
                      key={p.id || 'none'}
                      onClick={() => {
                        updateCharacterConfig({ headAccessory: p.id });
                      }}
                      className={`shrink-0 w-10 h-10 flex items-center justify-center text-2xl rounded-[12px] border-[2px] border-black transition-all relative ${isSelected ? 'scale-110 shadow-[0_2px_0_0_#000] z-10 bg-[#a78bfa]' : 'hover:scale-105 hover:bg-[#a78bfa] text-white/80'}`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Bottom Panel for Одежда/Эффекты */}
      {activeTab === 'effects' && (
        <div className="absolute bottom-[20px] left-0 right-0 px-2 pointer-events-auto flex flex-col items-center z-[70]">
          <div className="w-full max-w-md bg-[#8b5cf6] border-[3px] border-black rounded-[24px] shadow-[0_4px_0_0_#000]">
            <div className="w-full p-3 flex flex-col gap-2.5">
            {/* 1. Эмоции */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black tracking-widest text-[#cfb6ff] uppercase px-1">Эмоции</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'smile', label: 'Улыбка' },
                  { id: 'sad', label: 'Грусть' },
                  { id: 'angry', label: 'Злость' },
                  { id: 'surprised', label: 'Шок' },
                  { id: 'cool', label: 'Крутой' },
                  { id: 'xd', label: 'XD' },
                ].map(emo => {
                  const isActive = useStore.getState().devSettings.emotion === emo.id;
                  return (
                      <button
                        key={emo.id}
                        onClick={() => useStore.getState().updateDevSettings({ emotion: emo.id as any })}
                        className={`w-full py-2 px-1.5 rounded-[12px] text-[11px] font-black tracking-wider uppercase transition-all border-[2px] ${
                          isActive 
                            ? 'bg-[#ff6b00] text-white border-black shadow-[0_2px_0_0_#000] scale-105' 
                            : 'bg-transparent text-white border-transparent hover:bg-black/80'
                        }`}
                      >
                        {emo.label}
                      </button>
                  );
                })}
              </div>
            </div>
            

          </div>
        </div>
        </div>
      )}
      {/* Bottom Panel for Лейба (Decal) */}
      {activeTab === 'decal' && (
        <div className="absolute bottom-[20px] left-0 right-0 px-2 pointer-events-none flex flex-col items-center z-[70]">
          
          <div className="mb-4 flex flex-row items-center justify-center gap-4">
            <button 
              onClick={() => {
                const backVisible = characterConfig.decalBackVisible !== false;
                updateCharacterConfig({ decalBackVisible: !backVisible });
              }}
              className={`pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full transition-all border-[3px] border-black shadow-[0_3px_0_0_#000] active:translate-y-1 active:shadow-none ${
                characterConfig.decalBackVisible !== false 
                  ? 'bg-[#ff6b00] text-white hover:opacity-80' 
                  : 'bg-[#8b5cf6] text-white/50 hover:text-white hover:opacity-80'
              }`}
              title="Toggle Back Decal"
            >
              {characterConfig.decalBackVisible !== false ? <X size={28} strokeWidth={3} /> : <RotateCcw size={24} strokeWidth={3} />}
            </button>
            <div className="flex flex-row items-center justify-center gap-2">
              <button 
                onClick={() => {
                  let ns = Math.max(0.2, (characterConfig.decalScale ?? 1) - 0.28);
                  updateCharacterConfig({ decalScale: ns });
                }}
                className="pointer-events-auto w-12 h-12 flex items-center justify-center bg-[#8b5cf6] rounded-full text-white transition-all border-[3px] border-black shadow-[0_3px_0_0_#000] hover:bg-[#a78bfa] active:translate-y-1 active:shadow-none"
              >
                <ChevronLeft size={28} strokeWidth={3} />
              </button>
              <button 
                onClick={() => {
                  let ny = Math.min(1, (characterConfig.decalYFront ?? 0) + 0.1);
                  updateCharacterConfig({ decalYFront: ny, decalYBack: ny });
                }}
                className="pointer-events-auto w-12 h-12 flex items-center justify-center bg-[#8b5cf6] rounded-full text-white transition-all border-[3px] border-black shadow-[0_3px_0_0_#000] hover:bg-[#a78bfa] active:translate-y-1 active:shadow-none"
              >
                <ChevronUp size={28} strokeWidth={3} />
              </button>
              <button 
                onClick={() => {
                  let ny = Math.max(-1, (characterConfig.decalYFront ?? 0) - 0.1);
                  updateCharacterConfig({ decalYFront: ny, decalYBack: ny });
                }}
                className="pointer-events-auto w-12 h-12 flex items-center justify-center bg-[#8b5cf6] rounded-full text-white transition-all border-[3px] border-black shadow-[0_3px_0_0_#000] hover:bg-[#a78bfa] active:translate-y-1 active:shadow-none"
              >
                <ChevronDown size={28} strokeWidth={3} />
              </button>
              <button 
                onClick={() => {
                  let ns = Math.min(3, (characterConfig.decalScale ?? 1) + 0.28);
                  updateCharacterConfig({ decalScale: ns });
                }}
                className="pointer-events-auto w-12 h-12 flex items-center justify-center bg-[#8b5cf6] rounded-full text-white transition-all border-[3px] border-black shadow-[0_3px_0_0_#000] hover:bg-[#a78bfa] active:translate-y-1 active:shadow-none"
              >
                <ChevronRight size={28} strokeWidth={3} />
              </button>
            </div>
            <button 
              onClick={() => {
                const frontVisible = characterConfig.decalFrontVisible !== false;
                updateCharacterConfig({ decalFrontVisible: !frontVisible });
              }}
              className={`pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full transition-all border-[3px] border-black shadow-[0_3px_0_0_#000] active:translate-y-1 active:shadow-none ${
                characterConfig.decalFrontVisible !== false 
                  ? 'bg-[#ff6b00] text-white hover:opacity-80' 
                  : 'bg-[#8b5cf6] text-white/50 hover:text-white hover:opacity-80'
              }`}
              title="Toggle Front Decal"
            >
              {characterConfig.decalFrontVisible !== false ? <X size={28} strokeWidth={3} /> : <RotateCcw size={24} strokeWidth={3} />}
            </button>
          </div>

          <div className="w-full max-w-md bg-[#8b5cf6] border-[3px] border-black rounded-[28px] shadow-[0_4px_0_0_#000] pointer-events-auto">
            <div className="w-full p-2 flex flex-col gap-2">
            
            {/* Sub-tabs inside colors */}
            <div className="flex bg-[#a78bfa] border-[2px] border-black rounded-[20px] p-1 w-full gap-1">
              <button 
                onClick={() => setColorsSubTab('solid')}
                className={`flex-1 py-1.5 rounded-[16px] font-black tracking-widest text-[10px] uppercase transition-colors border-[2px] border-transparent ${colorsSubTab === 'solid' ? 'bg-[#ff6b00] text-white border-black shadow-[0_2px_0_0_#000]' : 'text-white hover:bg-black/80'}`}
              >
                Обычные
              </button>
              <button 
                onClick={() => setColorsSubTab('gradients')}
                className={`flex-1 py-1.5 rounded-[16px] font-black tracking-widest text-[10px] uppercase transition-colors border-[2px] border-transparent ${colorsSubTab === 'gradients' ? 'bg-[#ff6b00] text-white border-black shadow-[0_2px_0_0_#000]' : 'text-white hover:bg-black/80'}`}
              >
                Градиенты
              </button>
              <button 
                onClick={() => setColorsSubTab('effects')}
                className={`flex-1 py-1.5 rounded-[16px] font-black tracking-widest text-[10px] uppercase transition-colors border-[2px] border-transparent ${colorsSubTab === 'effects' ? 'bg-[#ff6b00] text-white border-black shadow-[0_2px_0_0_#000]' : 'text-white hover:bg-black/80'}`}
              >
                Эффекты
              </button>
            </div>

            <div className="px-1 pb-1">
              {colorsSubTab === 'solid' && (
                <div className="flex gap-2 overflow-x-auto min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {palette.slice(0, 10).map(c => {
                    const isSelected = (characterConfig.decalColor || '#111827') === c;
                    return (
                      <ColorCircle 
                        key={c}
                        color={c} 
                        selected={isSelected} 
                        onClick={() => updateCharacterConfig({ decalColor: c })} 
                        className="w-10 h-10 rounded-full shrink-0"
                      />
                    );
                  })}
                </div>
              )}

              {colorsSubTab === 'gradients' && (
                <div className="flex gap-2 overflow-x-auto min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {[
                    {id:'g1', css:'linear-gradient(45deg, #ff0000, #0000ff)'},
                    {id:'g2', css:'linear-gradient(45deg, #00ff00, #ffff00)'},
                    {id:'g3', css:'linear-gradient(45deg, #ff00ff, #00ffff)'},
                    {id:'g4', css:'linear-gradient(45deg, #ff8800, #ff0088)'},
                    {id:'g5', css:'linear-gradient(45deg, #000000, #ffffff)'},
                    {id:'g6', css:'linear-gradient(45deg, #8800ff, #ff0088)'},
                    {id:'g7', css:'linear-gradient(45deg, #00ffff, #0000ff)'},
                    {id:'g8', css:'linear-gradient(45deg, #ffff00, #ff0000)'},
                    {id:'g9', css:'linear-gradient(45deg, #00ff00, #0000ff)'},
                    {id:'g10', css:'linear-gradient(45deg, #ff00ff, #ffff00)'},
                  ].map(g => {
                    const isSelected = characterConfig.decalColor === g.css;
                    return (
                      <button
                        key={g.id}
                        onClick={() => updateCharacterConfig({ decalColor: g.css })}
                        className={`shrink-0 w-10 h-10 rounded-full border-[2px] border-black relative transition-transform ${isSelected ? 'scale-110 shadow-[0_2px_0_0_#000] z-10 box-border' : 'hover:scale-105'}`}
                        style={{ background: g.css }}
                      />
                    );
                  })}
                </div>
              )}

              {colorsSubTab === 'effects' && (
                <div className="flex gap-2 overflow-x-auto min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {[
                    {id:'p1', name:'🪖'},
                    {id:'p2', name:'✨'},
                    {id:'p3', name:'🔥'},
                    {id:'p4', name:'🌊'},
                    {id:'p5', name:'⚡'},
                    {id:'p6', name:'🔴'},
                    {id:'p7', name:'❓'},
                    {id:'p8', name:'😐'},
                    {id:'p9', name:'📜'},
                    {id:'p10', name:'💀'},
                  ].map(p => {
                    const isSelected = characterConfig.decalColor === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => updateCharacterConfig({ decalColor: p.id })}
                        className={`shrink-0 w-10 h-10 rounded-[12px] border-[2px] border-black flex items-center justify-center text-lg relative transition-transform ${isSelected ? 'scale-110 shadow-[0_2px_0_0_#000] z-10 box-border' : 'hover:scale-105'}`}
                      >
                        <DummyPart id={p.id} w="w-full" h="h-full" rounded="rounded-[10px]" />
                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-md z-20">
                          {p.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
          </div>
        </div>
        </div>
      )}
    </div>
  );
});


