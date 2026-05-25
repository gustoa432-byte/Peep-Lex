import React from 'react';
import { useStore } from '../../../store/useStore';
import { ArrowLeft, Hammer, Eye, Box, Undo2, Redo2 } from 'lucide-react';

export const RoomEditorTopBar: React.FC = () => {
  const setAppMode = useStore(state => state.setAppMode);
  const roomEditorMode = useStore(state => state.roomEditorMode);
  const setRoomEditorMode = useStore(state => state.setRoomEditorMode);
  const brushShape = useStore(state => state.brushShape);
  const setBrushShape = useStore(state => state.setBrushShape);
  
  const undo = useStore(state => state.undoRoomEditorHistory);
  const redo = useStore(state => state.redoRoomEditorHistory);
  const historyIndex = useStore(state => state.roomEditorHistoryIndex);
  const historyLength = useStore(state => state.roomEditorHistory.length);

  return (
    <div className="flex justify-between items-center p-4">
      {/* Left: Back & Modes */}
      <div className="flex items-center gap-4 pointer-events-auto">
        <button 
          onClick={() => setAppMode('room')}
          className="w-12 h-12 rounded-full bg-black/95 flex items-center justify-center text-white active:scale-95 transition-transform border border-white/10"
        >
          <ArrowLeft size={24} />
        </button>
        
        <div className="flex bg-black/95 rounded-full border border-white/10 p-1">
          <button 
            onClick={() => {
              setRoomEditorMode('build');
              if (brushShape === 'point') setBrushShape('line');
              useStore.getState().setIsFirstPerson(false);
            }}
            className={`w-12 h-10 rounded-full flex items-center justify-center transition-colors ${roomEditorMode === 'build' ? 'bg-white text-black' : 'text-white'}`}
          >
            <Hammer size={20} />
          </button>
          <button 
            onClick={() => {
              setRoomEditorMode('voxel');
              setBrushShape('point'); // Force point brush for voxel mode
              useStore.getState().setIsFirstPerson(true);
            }}
            className={`w-12 h-10 rounded-full flex items-center justify-center transition-colors ${(roomEditorMode === 'voxel') ? 'bg-white text-black' : 'text-white'}`}
            title="Первое лицо: точечная стройка"
          >
            <Box size={20} />
          </button>
        </div>
      </div>

      {/* Right: Undo/Redo & Tools */}
      {(roomEditorMode === 'build' || roomEditorMode === 'voxel') && (
        <div className="flex items-center gap-2 pointer-events-auto">
          <button 
            onClick={undo}
            disabled={historyIndex <= 0}
            className="w-12 h-12 rounded-full bg-black/95 flex items-center justify-center disabled:opacity-50 text-white active:scale-95 border border-white/10"
          >
            <Undo2 size={24} />
          </button>
          <button 
            onClick={redo}
            disabled={historyIndex >= historyLength - 1}
            className="w-12 h-12 rounded-full bg-black/95 flex items-center justify-center disabled:opacity-50 text-white active:scale-95 border border-white/10"
          >
            <Redo2 size={24} />
          </button>
        </div>
      )}
    </div>
  );
};
