import fs from 'fs';

let content = fs.readFileSync('src/components/ui/AnimationMenu.tsx', 'utf8');

const lines = content.split('\n');
let newLines = [];

for (let i = 0; i < 718; i++) {
  newLines.push(lines[i]);
}

newLines.push(`            <div className={\`flex overflow-x-auto items-center px-4 gap-3 py-2 min-h-[90px] overflow-y-hidden custom-scrollbar transition-all duration-300 \${isAnimating ? 'h-0 opacity-0 min-h-0 py-0 border-none scale-y-0' : ''}\`}>`);
newLines.push(`              {loops.map((loop, idx) => (`);
newLines.push(`                <div key={loop.id} className="p-[0.5px] rounded-[16px] bg-gradient-to-t from-purple-500/60 to-black/40 shadow-[0_0_8px_rgba(168,85,247,0.4)] transform hover:scale-105 transition-all">`);
newLines.push(`                  <div `);
newLines.push(`                    onClick={() => {`);
newLines.push(`                      loadLoopForEditing(loop.id);`);
newLines.push(`                      setSaveLoopName(loop.name);`);
newLines.push(`                      setActivePoseSection(null);`);
newLines.push(`                    }}`);
newLines.push(`                    className="shrink-0 flex flex-col justify-end bg-gradient-to-t from-purple-500/60 to-black/40 rounded-[16px] h-16 min-w-[90px] cursor-pointer relative group overflow-hidden drop-shadow-md transition-all hover:bg-white/20"`);
newLines.push(`                  >`);
newLines.push(`                    <div className="px-2 py-1 flex items-end justify-between z-10 w-full h-full">`);
newLines.push(`                      <span className="text-white text-xs font-bold leading-tight drop-shadow-[0_0_4px_rgba(168,85,247,0.8)] [-webkit-text-stroke:0.25px_#f97316]">{loop.name}</span>`);
newLines.push(`                      <span className="text-white/70 text-[10px] font-mono ml-2">{(loop.frames.length * loop.speed).toFixed(1)}s</span>`);
newLines.push(`                    </div>`);
newLines.push(`                    <button `);
newLines.push(`                      onClick={(e) => { e.stopPropagation(); removeLoop(loop.id); }} `);
newLines.push(`                      className="absolute top-1 right-1 bg-black/95 text-white rounded-[16px] p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-red-500 transition-all z-20"`);
newLines.push(`                    >`);
newLines.push(`                      <Trash2 size={10} />`);
newLines.push(`                    </button>`);
newLines.push(`                  </div>`);
newLines.push(`                </div>`);
newLines.push(`              ))}`);
newLines.push(``);
newLines.push(`              <div className="p-[0.5px] rounded-[16px] bg-gradient-to-t from-white/40 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.4)]">`);
newLines.push(`                <button `);
newLines.push(`                  onClick={() => {`);
newLines.push(`                    let realTotalDurationMs = 0;`);
newLines.push(`                    loops.forEach(l => {`);
newLines.push(`                       realTotalDurationMs += (l.frames.length * l.speed) + (l.delayAfter || 0);`);
newLines.push(`                    });`);
newLines.push(`                    if (loops.length >= 20) {`);
newLines.push(`                       alert("Достигнут лимит в 20 кусочков!");`);
newLines.push(`                       return;`);
newLines.push(`                    }`);
newLines.push(`                    if (realTotalDurationMs >= 29900) {`);
newLines.push(`                       alert("Достигнут лимит длительности в 29.9 секунд!");`);
newLines.push(`                       return;`);
newLines.push(`                    }`);
newLines.push(`                    `);
newLines.push(`                    let initialPose: any = {};`);
newLines.push(`                    if (loops.length > 0) {`);
newLines.push(`                       const lastLoop = loops[loops.length - 1];`);
newLines.push(`                       if (lastLoop.frames.length > 0) {`);
newLines.push(`                          initialPose = lastLoop.frames[lastLoop.frames.length - 1];`);
newLines.push(`                       }`);
newLines.push(`                    }`);
newLines.push(`                    clearKeyframes(initialPose);`);
newLines.push(`                    setEditingLoopId('draft');`);
newLines.push(`                    setSaveLoopName(\`Кусочек \${loops.length + 1}\`);`);
newLines.push(`                    setActivePoseSection(null);`);
newLines.push(`                  }}`);
newLines.push(`                  className="shrink-0 h-16 w-16 bg-gradient-to-t from-purple-500/60 to-black/40 rounded-[16px] flex flex-col items-center justify-center text-white/90 hover:text-white hover:bg-white/20 cursor-pointer transition-all disabled:opacity-50"`);
newLines.push(`                >`);
newLines.push(`                  <Plus size={24} className="mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />`);
newLines.push(`                  <span className="text-[9px] font-bold tracking-widest uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Новый</span>`);
newLines.push(`                </button>`);
newLines.push(`              </div>`);
newLines.push(``);
newLines.push(`              {loops.length > 0 && (`);
newLines.push(`                <div className="p-[0.5px] rounded-[16px] bg-gradient-to-t from-orange-500 to-transparent shadow-[0_0_8px_rgba(249,115,22,0.4)]">`);
newLines.push(`                  <button `);
newLines.push(`                    onClick={() => {`);
newLines.push(`                       setSavePackName(\`Флекс \${(flexPacks || []).length + 1}\`);`);
newLines.push(`                       setSavePackPromptOpen(true);`);
newLines.push(`                    }}`);
newLines.push(`                    className="shrink-0 h-16 w-16 bg-gradient-to-t from-purple-500/60 to-black/40 rounded-[16px] flex flex-col items-center justify-center text-orange-400 hover:text-orange-300 hover:bg-white/20 border hover:border-orange-400 border-transparent cursor-pointer transition-all disabled:opacity-50"`);
newLines.push(`                    title="Сохранить флекс"`);
newLines.push(`                    disabled={isSavingPack}`);
newLines.push(`                  >`);
newLines.push(`                    <Save size={20} className="mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />`);
newLines.push(`                    <span className="text-[9px] font-bold tracking-widest uppercase truncate w-full flex justify-center drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">{isSavingPack ? 'СОХР...' : 'В ПАК'}</span>`);
newLines.push(`                  </button>`);
newLines.push(`                </div>`);
newLines.push(`              )}`);

for (let i = 790; i < lines.length; i++) {
  newLines.push(lines[i]);
}

fs.writeFileSync('src/components/ui/AnimationMenu.tsx', newLines.join('\n'));
