import React, { memo } from 'react';
import { useStore } from '../../../store/useStore';
import { Hammer, Eraser, Box } from 'lucide-react';

export const stamps = [
  { id: 'block_grass', label: 'Трава', icon: Box, color: '#4ade80' },
  { id: 'block_dirt', label: 'Земля', icon: Box, color: '#78350f' },
  { id: 'block_stone', label: 'Камень', icon: Box, color: '#94a3b8' },
  { id: 'block_wood', label: 'Дерево', icon: Box, color: '#b45309' },
  { id: 'block_brick', label: 'Кирпич', icon: Box, color: '#dc2626' },
];

export const RadialStampMenu: React.FC<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}> = memo(({ isOpen, setIsOpen }) => {
  const roomSelectedTool = useStore(state => state.roomSelectedTool);
  const setRoomSelectedTool = useStore(state => state.setRoomSelectedTool);
  const roomSelectedStamp = useStore(state => state.roomSelectedStamp);
  const setRoomSelectedStamp = useStore(state => state.setRoomSelectedStamp);

  return (
    <div className="relative w-full flex justify-center h-16">
      {isOpen && (
        <div className="absolute bottom-16 left-1/2 w-0 h-0 pointer-events-none flex items-center justify-center">
          {stamps.map((stamp, i) => {
            const angle = Math.PI + (Math.PI / (stamps.length - 1)) * i; // Semi-circle from Left to Right
            const radius = 95; // Radius of the arc
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <button
                key={stamp.id}
                onClick={() => {
                  setRoomSelectedStamp(stamp.id);
                  setRoomSelectedTool('stamp');
                  setIsOpen(false);
                }}
                className={`absolute pointer-events-auto w-14 h-14 rounded-full flex flex-col items-center justify-center gap-1 transition-transform border ${roomSelectedStamp === stamp.id && roomSelectedTool === 'stamp' ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'border-white/10 scale-100 hover:scale-105'}`}
                style={{ transform: `translate(${x}px, ${y}px)`, backgroundColor: stamp.color }}
              >
                <stamp.icon size={20} className="text-white drop-shadow-md" />
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-4 pointer-events-auto">
         <button 
            onClick={() => {
              if (roomSelectedTool === 'stamp' && !isOpen) {
                setIsOpen(true);
              } else if (roomSelectedTool === 'eraser') {
                setRoomSelectedTool('stamp');
                setIsOpen(true);
              } else {
                setIsOpen(!isOpen);
              }
            }}
            className={`w-16 h-16 rounded-full relative z-10 flex items-center justify-center bg-black/95 border transition-transform ${roomSelectedTool === 'stamp' ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.5)] scale-110' : 'border-white/10 scale-100'}`}
          >
           <Hammer size={28} className="text-white" />
           {/* Mini icon showing current stamp tool */}
           {roomSelectedTool === 'stamp' && (
             <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-black flex items-center justify-center" style={{ backgroundColor: stamps.find(s => s.id === roomSelectedStamp)?.color || '#fff' }}>
                {React.createElement(stamps.find(s => s.id === roomSelectedStamp)?.icon || Hammer, { size: 12, className: 'text-white' })}
             </div>
           )}
         </button>

         <button 
            onClick={() => {
              setRoomSelectedTool('eraser');
              setIsOpen(false);
            }}
            className={`w-16 h-16 rounded-full relative z-10 flex items-center justify-center bg-black/95 border transition-transform ${roomSelectedTool === 'eraser' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-110' : 'border-white/10 scale-100'}`}
          >
           <Eraser size={28} className="text-white" />
         </button>
      </div>
    </div>
  );
});
