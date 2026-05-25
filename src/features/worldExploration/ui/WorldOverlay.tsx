import React from 'react';
import { useStore } from '../../../store/useStore';
import { LogOut, Wrench } from 'lucide-react';
import { vibrate } from '../../../lib/haptics';

export const WorldOverlay: React.FC = () => {
  const setAppMode = useStore(state => state.setAppMode);

  return (
    <div className="absolute inset-0 pointer-events-auto z-50 flex flex-col items-center justify-center bg-black/95 text-white">
      <div className="bg-white/10 p-6 rounded-3xl border border-white/20 flex flex-col items-center max-w-sm text-center">
        <Wrench size={48} className="text-orange-500 mb-4 opacity-80" />
        <h2 className="text-2xl font-black uppercase tracking-widest mb-2">Мир в разработке</h2>
        <p className="text-white/60 mb-8 text-sm">
          Локация находится на техническом перерыве. Возвращайтесь позже, мы готовим много интересного!
        </p>
        
        <button 
          onClick={() => {
            vibrate(10);
            setAppMode('editor');
          }}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 rounded-full text-white font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:bg-orange-600 transition-colors"
        >
          <LogOut size={18} />
          <span>Выход в Пип Студию</span>
        </button>
      </div>
    </div>
  );
};
