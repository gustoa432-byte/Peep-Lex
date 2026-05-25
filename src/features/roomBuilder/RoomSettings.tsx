import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Settings, X } from 'lucide-react';

export const RoomSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const cameraSpeed = useStore((state) => state.cameraSpeed);
  const setCameraSpeed = useStore((state) => state.setCameraSpeed);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-12 h-12 bg-[#111] rounded-[16px] text-white border-[3px] border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:bg-[#222] active:translate-y-1 active:shadow-none transition-all pointer-events-auto"
      >
        <Settings size={24} strokeWidth={3} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto p-4">
          <div className="absolute inset-0 bg-black/95 z-0" onClick={() => setIsOpen(false)} />
          
          <div className="relative z-10 bg-[#1a1a1a] border-4 border-black rounded-3xl p-6 w-full max-w-sm flex flex-col gap-6 shadow-[0_8px_0_0_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-white px-2 uppercase tracking-wide">Room Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 flex items-center justify-center bg-red-500 rounded-xl text-white border-2 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:bg-red-400 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Camera Speed */}
              <div className="flex flex-col gap-2 bg-black/40 p-4 rounded-2xl border-2 border-black/50">
                <div className="flex justify-between items-center">
                  <label className="text-white font-bold text-sm">Camera Speed</label>
                  <span className="text-gray-400 font-mono text-sm">{cameraSpeed.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  value={cameraSpeed}
                  onChange={(e) => setCameraSpeed(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
;
