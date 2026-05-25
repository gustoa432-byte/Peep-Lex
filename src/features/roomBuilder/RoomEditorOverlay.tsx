import React, { useState, memo } from 'react';
import { useStore } from '../../store/useStore';
import { RoomEditorTopBar } from './ui/RoomEditorTopBar';
import { RadialStampMenu, stamps } from './ui/RadialStampMenu';
import { VoxelJoysticks } from './ui/VoxelJoysticks';
import { Eye, Hammer, Trash, Move, ArrowUp, ArrowDown, Layers, MousePointer2, Minus, Square, ChevronUp, ChevronDown, Eraser, Box, TrendingUp, Triangle, Frame } from 'lucide-react';

const LeftTools = memo(() => {
  const roomEditorMode = useStore(state => state.roomEditorMode);
  const roomBlockSize = useStore(state => state.roomBlockSize);
  const setRoomBlockSize = useStore(state => state.setRoomBlockSize);
  const brushShape = useStore(state => state.brushShape);
  const setBrushShape = useStore(state => state.setBrushShape);
  const [isLeftToolsExpanded, setLeftToolsExpanded] = useState(false);

  return (
    <div className="absolute left-4 bottom-8 flex flex-col items-center justify-end gap-2 pointer-events-auto z-50">
      {isLeftToolsExpanded && (
        <>
          <div className="bg-black/80 rounded-full p-2 flex flex-col gap-2 border border-white/10 shadow-lg">
            {[4, 2, 1].map((s) => (
              <button
                key={`bsize_${s}`}
                onClick={() => setRoomBlockSize(s)}
                className={`w-10 h-10 rounded-full flex flex-col items-center justify-center font-bold text-xs active:scale-95 transition-colors ${
                  roomBlockSize === s
                    ? 'bg-white text-black'
                    : 'text-white hover:bg-black/80'
                }`}
                title={`Размер блока: ${s}`}
              >
                <Box size={s === 4 ? 26 : s === 2 ? 18 : 12} strokeWidth={roomBlockSize === s ? 3 : 2} />
              </button>
            ))}
          </div>
          
          <div className="bg-black/80 rounded-full p-2 flex flex-col gap-2 border border-white/10 mt-2 shadow-lg">
            {roomEditorMode === 'voxel' && (
              <button
                onClick={() => setBrushShape('point')}
                className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-colors ${
                  brushShape === 'point' ? 'bg-white text-black' : 'text-white hover:bg-black/80'
                }`}
                title="Точка (по одному)"
              >
                <MousePointer2 size={18} />
              </button>
            )}
            {roomEditorMode === 'build' && (
              <>
                <button
                  onClick={() => setBrushShape('line')}
                  className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-colors ${
                    brushShape === 'line' ? 'bg-white text-black' : 'text-white hover:bg-black/80'
                  }`}
                  title="Стройка: стена"
                >
                  <Minus size={20} strokeWidth={3} />
                </button>
                <button
                  onClick={() => setBrushShape('rect')}
                  className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-colors ${
                    brushShape === 'rect' ? 'bg-white text-black' : 'text-white hover:bg-black/80'
                  }`}
                  title="Стройка: пол"
                >
                  <Square size={18} strokeWidth={3} />
                </button>
                <button
                  onClick={() => setBrushShape('stairs')}
                  className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-colors ${
                    brushShape === 'stairs' ? 'bg-white text-black' : 'text-white hover:bg-black/80'
                  }`}
                  title="Стройка: лестница"
                >
                  <TrendingUp size={18} strokeWidth={3} />
                </button>
                <button
                  onClick={() => setBrushShape('roof')}
                  className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-colors ${
                    brushShape === 'roof' ? 'bg-white text-black' : 'text-white hover:bg-black/80'
                  }`}
                  title="Стройка: крыша"
                >
                  <Triangle size={18} strokeWidth={3} />
                </button>
                <button
                  onClick={() => setBrushShape('box')}
                  className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-colors ${
                    brushShape === 'box' ? 'bg-white text-black' : 'text-white hover:bg-black/80'
                  }`}
                  title="Стройка: коробка"
                >
                  <Frame size={18} strokeWidth={3} />
                </button>
              </>
            )}
          </div>
        </>
      )}
      <button
        onClick={() => setLeftToolsExpanded(!isLeftToolsExpanded)}
        className="w-12 h-12 mt-2 rounded-full flex items-center justify-center bg-black/80 border border-white/10 shadow-lg text-white hover:bg-black/80 active:scale-95 transition-colors"
      >
        {isLeftToolsExpanded ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
      </button>
    </div>
  );
});

const RightTools = memo(({ onClearClick }: { onClearClick: () => void }) => {
  const buildLayer = useStore(state => state.buildLayer);
  const setBuildLayer = useStore(state => state.setBuildLayer);
  const brushHeight = useStore(state => state.brushHeight);
  const setBrushHeight = useStore(state => state.setBrushHeight);
  const [isRightToolsExpanded, setRightToolsExpanded] = useState(false);

  return (
    <div className="absolute right-4 bottom-8 flex flex-col items-center justify-end gap-2 pointer-events-auto z-50">
      {isRightToolsExpanded && (
        <>
          <div className="bg-black/80 rounded-full p-2 flex flex-col items-center gap-2 border border-white/10 shadow-lg">
            <button 
              onClick={onClearClick}
              className="w-10 h-10 rounded-full flex items-center justify-center text-red-500 active:scale-95 hover:bg-black/80 transition-colors"
              title="Очистить всё"
            >
              <Trash size={18} />
            </button>
          </div>

          <div className="bg-black/80 rounded-full p-2 flex flex-col items-center gap-2 border border-white/10 mt-2 shadow-lg">
            <button 
              onClick={() => setBuildLayer(buildLayer + 1)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-95 hover:bg-black/80 transition-colors"
            >
              <ArrowUp size={20} />
            </button>
            
            <div className="w-10 h-10 rounded-full bg-white text-black flex flex-col items-center justify-center font-bold">
              <Layers size={14} strokeWidth={3} className="-mb-0.5" />
              <span className="text-sm leading-none">{buildLayer}</span>
            </div>

            <button 
              onClick={() => setBuildLayer(Math.max(0, buildLayer - 1))}
              disabled={buildLayer <= 0}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-95 disabled:opacity-50 hover:bg-black/80 transition-colors"
            >
              <ArrowDown size={20} />
            </button>
          </div>

          <div className="bg-black/80 rounded-[20px] p-2 flex flex-col items-center gap-2 border border-white/10 mt-2 shadow-lg">
            <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider text-center leading-tight">Высота<br/>кисти</div>
            <button 
              onClick={() => setBrushHeight(brushHeight + 1)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-95 hover:bg-black/80 transition-colors"
            >
              <ArrowUp size={16} />
            </button>
            
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex flex-col items-center justify-center font-bold">
              <span className="text-base leading-none">x{brushHeight}</span>
            </div>

            <button 
              onClick={() => setBrushHeight(Math.max(1, brushHeight - 1))}
              disabled={brushHeight <= 1}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-95 disabled:opacity-50 hover:bg-black/80 transition-colors"
            >
              <ArrowDown size={16} />
            </button>
          </div>
        </>
      )}
      <button
        onClick={() => setRightToolsExpanded(!isRightToolsExpanded)}
        className="w-12 h-12 mt-2 rounded-full flex items-center justify-center bg-black/80 border border-white/10 shadow-lg text-white hover:bg-black/80 active:scale-95 transition-colors"
      >
        {isRightToolsExpanded ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
      </button>
    </div>
  );
});

const BottomBuildTools = memo(() => {
  const roomSelectedTool = useStore(state => state.roomSelectedTool);
  const brushShape = useStore(state => state.brushShape);
  const [isRadialMenuOpen, setRadialMenuOpen] = useState(false);

  return (
    <div className="p-4 pb-8 flex flex-col items-center gap-4 pointer-events-none relative z-40 w-full">
      <div className="relative w-full flex justify-center h-16">
        <RadialStampMenu isOpen={isRadialMenuOpen} setIsOpen={setRadialMenuOpen} />
      </div>
      <p className="text-white/80 font-medium text-sm bg-black/95 border border-white/10 px-4 py-2 rounded-full absolute -top-10">
        {roomSelectedTool === 'stamp' ? (brushShape === 'line' ? 'Ставим стену' : brushShape === 'rect' ? 'Ставим пол' : brushShape === 'stairs' ? 'Ставим лестницу' : brushShape === 'roof' ? 'Ставим крышу' : brushShape === 'box' ? 'Ставим коробку' : 'Ставим кубики') : 'Режим ластика - удаление'}
      </p>
    </div>
  );
});

const VoxelToolsGroup = memo(() => {
  const roomSelectedTool = useStore(state => state.roomSelectedTool);
  const setRoomSelectedTool = useStore(state => state.setRoomSelectedTool);
  const roomSelectedStamp = useStore(state => state.roomSelectedStamp);
  const setRoomSelectedStamp = useStore(state => state.setRoomSelectedStamp);
  const [isRadialMenuOpen, setRadialMenuOpen] = useState(false);

  return (
    <div className="absolute bottom-48 right-12 flex flex-col gap-4 pointer-events-auto">
       <button
          onClick={() => setRoomSelectedTool('eraser')}
          className={`w-14 h-14 rounded-full flex items-center justify-center bg-black/95 ${roomSelectedTool === 'eraser' ? 'border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border border-white/10'}`}
       >
          <Eraser size={24} className="text-white" />
       </button>

       <button
          onClick={() => {
             if (roomSelectedTool === 'stamp') {
                setRadialMenuOpen(!isRadialMenuOpen);
             } else {
                setRoomSelectedTool('stamp');
             }
          }}
          className={`w-14 h-14 rounded-full flex items-center justify-center bg-black/95 relative ${roomSelectedTool === 'stamp' ? 'border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'border border-white/10'}`}
       >
          <Box size={24} className="text-white" />
          {roomSelectedTool === 'stamp' && (
            <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full border-2 border-black flex items-center justify-center" style={{ backgroundColor: stamps.find(s => s.id === roomSelectedStamp)?.color || '#fff' }}>
               {React.createElement(stamps.find(s => s.id === roomSelectedStamp)?.icon || Box, { size: 10, className: 'text-white' })}
            </div>
          )}
       </button>
       
       {isRadialMenuOpen && roomSelectedTool === 'stamp' && (
         <div className="absolute right-16 bottom-0 flex flex-row gap-2 bg-black/95 p-2 rounded-full border border-white/10 shadow-lg">
           {stamps.map((stamp) => (
              <button
                key={stamp.id}
                onClick={() => {
                  setRoomSelectedStamp(stamp.id);
                  setRadialMenuOpen(false);
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${roomSelectedStamp === stamp.id ? 'border-2 border-white scale-110' : 'border border-white/10 scale-100 hover:scale-105'}`}
                style={{ backgroundColor: stamp.color }}
              >
                <stamp.icon size={16} className="text-white drop-shadow-md" />
              </button>
           ))}
         </div>
       )}
    </div>
  );
});

export const RoomEditorOverlay: React.FC = memo(() => {
  const roomEditorMode = useStore(state => state.roomEditorMode);
  const setRoomEditorMode = useStore(state => state.setRoomEditorMode);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex flex-col">
      <RoomEditorTopBar />
      <div className="flex-1" />

      {(roomEditorMode === 'build' || roomEditorMode === 'voxel') && (
        <>
          <LeftTools />
          <RightTools onClearClick={() => setShowClearConfirm(true)} />
        </>
      )}

      {(roomEditorMode === 'build' || roomEditorMode === 'view' || roomEditorMode === 'move') && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto z-50">
          <button 
            onClick={() => {
              if (roomEditorMode === 'view' || roomEditorMode === 'move') {
                setRoomEditorMode('build');
              } else {
                setRoomEditorMode('view');
              }
            }}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all bg-black/95 border ${
              roomEditorMode === 'view' || roomEditorMode === 'move' ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.5)] scale-110' : 'text-white border-white/10'
            }`}
            title="Парящий обзор"
          >
            <Eye size={24} />
          </button>
        </div>
      )}

      {roomEditorMode === 'build' && <BottomBuildTools />}

      {(roomEditorMode === 'view' || roomEditorMode === 'move') && (
        <div className="p-4 pb-8 flex justify-center gap-4 pointer-events-auto w-full">
          <div className="flex bg-black/95 rounded-full border border-white/10 p-1">
            <button 
              onClick={() => setRoomEditorMode('view')}
              className={`w-16 h-12 rounded-full flex items-center justify-center transition-colors ${roomEditorMode === 'view' ? 'bg-white text-black' : 'text-white'}`}
              title="Просмотр"
            >
              <Eye size={24} />
            </button>
            <button 
              onClick={() => setRoomEditorMode('move')}
              className={`w-16 h-12 rounded-full flex items-center justify-center transition-colors ${roomEditorMode === 'move' ? 'bg-white text-black' : 'text-white'}`}
              title="Перемещение"
            >
              <Move size={24} />
            </button>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/95 z-[1000] flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-[#111216] rounded-2xl p-6 border border-white/10 w-full max-w-sm">
            <h3 className="text-white text-lg font-medium mb-6 text-center">Точно очистить всю стройку?</h3>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-black/80 text-white font-medium active:scale-95 transition-transform"
              >
                Отмена
              </button>
              <button 
                onClick={() => {
                  useStore.getState().pushRoomEditorHistory([]);
                  setShowClearConfirm(false);
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-medium active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Trash size={18} />
                Очистить
              </button>
            </div>
          </div>
        </div>
      )}

      {roomEditorMode === 'voxel' && (
        <>
          <VoxelJoysticks 
            onJump={() => useStore.getState().triggerJump()}
            onCrouch={() => useStore.getState().toggleCrouch()}
          />
          <VoxelToolsGroup />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
             <div className="w-1.5 h-1.5 bg-white rounded-full opacity-80 shadow-[0_0_2px_rgba(0,0,0,1)] mix-blend-difference" />
          </div>
        </>
      )}
    </div>
  );
});

