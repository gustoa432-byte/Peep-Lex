import React from 'react';
import { useStore } from '../../store/useStore';
import { X, Sun, Moon, Cloud, Box } from 'lucide-react';

export const EnvironmentSettings = ({ onClose }: { onClose: () => void }) => {
  const envTime = useStore(state => state.environmentTime);
  const setEnvTime = useStore(state => state.setEnvironmentTime);
  
  const envTerrain = useStore(state => state.environmentTerrain);
  const setEnvTerrain = useStore(state => state.setEnvironmentTerrain);

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/95 pointer-events-auto">
      <div className="w-[90%] max-w-sm bg-[#111] rounded-[24px] border-[3px] border-black shadow-[0_8px_0_0_rgba(0,0,0,1)] p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-[12px] bg-[#222] border-2 border-black flex items-center justify-center text-white active:translate-y-1 active:shadow-none transition-all"
        >
          <X size={20} strokeWidth={3} />
        </button>

        <h2 className="text-white text-xl font-black mb-6 uppercase tracking-wider">Макро Настройки</h2>

        {/* Time of Day */}
        <div className="mb-6">
          <h3 className="text-white/60 text-sm font-bold mb-3 uppercase">Небо</h3>
          <div className="flex gap-2">
            {[
              { id: 'day', icon: Sun, label: 'День' },
              { id: 'dusk', icon: Cloud, label: 'Сумерки' },
              { id: 'night', icon: Moon, label: 'Ночь' },
            ].map(opt => {
              const isActive = envTime === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={() => setEnvTime(opt.id as any)}
                  className={`flex-1 flex flex-col items-center justify-center p-3 rounded-[16px] border-[3px] border-black transition-all active:translate-y-1 active:shadow-none ${
                    isActive 
                      ? 'bg-[#ff6b00] text-black shadow-[0_4px_0_0_rgba(0,0,0,1)]' 
                      : 'bg-[#222] text-white/80 hover:bg-[#333] shadow-[0_4px_0_0_rgba(0,0,0,1)]'
                  }`}
                >
                  <Icon size={24} className="mb-1" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-bold uppercase">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Terrain */}
        <div>
          <h3 className="text-white/60 text-sm font-bold mb-3 uppercase">Ландшафт</h3>
          <div className="flex gap-2">
            {[
              { id: 'concrete', icon: Box, label: 'Бетон', color: '#888' },
              { id: 'grass', icon: Box, label: 'Трава', color: '#4ade80' },
              { id: 'dirt', icon: Box, label: 'Земля', color: '#7c2d12' },
            ].map(opt => {
              const isActive = envTerrain === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setEnvTerrain(opt.id as any)}
                  className={`flex-1 flex flex-col items-center justify-center p-3 rounded-[16px] border-[3px] border-black transition-all active:translate-y-1 active:shadow-none ${
                    isActive 
                      ? 'bg-white text-black shadow-[0_4px_0_0_rgba(0,0,0,1)]' 
                      : 'bg-[#222] text-white/80 hover:bg-[#333] shadow-[0_4px_0_0_rgba(0,0,0,1)]'
                  }`}
                >
                  <div className="w-6 h-6 rounded-md border-2 border-black mb-1" style={{ backgroundColor: opt.color }} />
                  <span className="text-[10px] font-bold uppercase">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
};
