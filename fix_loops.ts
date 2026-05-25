import fs from 'fs';

let content = fs.readFileSync('src/components/ui/AnimationMenu.tsx', 'utf8');

const loopsRegex = /\{loops\.map\(\(loop, idx\) => \(\n\s+<div \n\s+key=\{loop\.id\} \n\s+onClick=\{\(\) => \{\n\s+loadLoopForEditing\(loop\.id\);\n\s+setSaveLoopName\(loop\.name\);\n\s+setActivePoseSection\(null\);\n\s+\}\}\n\s+className="shrink-0 flex flex-col justify-end bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl h-16 min-w-\[90px\] border-2 border-white\/10 hover:border-white\/50 cursor-pointer transition-all relative group overflow-hidden shadow-lg"\n\s+>\n\s+<div className="absolute inset-0 bg-white\/0 group-hover:bg-white\/10 transition-colors"><\/div>\n\s+<div className="px-2 py-1 flex items-end justify-between z-10 w-full h-full">\n\s+<span className="text-white text-xs font-bold leading-tight">\{loop\.name\}<\/span>\n\s+<span className="text-white\/70 text-\[10px\] font-mono ml-2">\{\(loop\.frames\.length \* loop\.speed\)\.toFixed\(1\)\}s<\/span>\n\s+<\/div>/g;

const loopsNew = `{loops.map((loop, idx) => (
                <div key={loop.id} className="p-[0.5px] rounded-[16px] bg-gradient-to-t from-purple-500/60 to-black/40 shadow-[0_0_8px_rgba(168,85,247,0.4)] transform hover:scale-105 transition-all">
                  <div 
                    onClick={() => {
                      loadLoopForEditing(loop.id);
                      setSaveLoopName(loop.name);
                      setActivePoseSection(null);
                    }}
                    className="shrink-0 flex flex-col justify-end bg-gradient-to-t from-purple-500/60 to-black/40 rounded-[16px] h-16 min-w-[90px] cursor-pointer relative group overflow-hidden drop-shadow-md transition-all hover:bg-white/20"
                  >
                    <div className="px-2 py-1 flex items-end justify-between z-10 w-full h-full">
                      <span className="text-white text-xs font-bold leading-tight drop-shadow-[0_0_4px_rgba(168,85,247,0.8)] [-webkit-text-stroke:0.25px_#f97316]">{loop.name}</span>
                      <span className="text-white/70 text-[10px] font-mono ml-2">{(loop.frames.length * loop.speed).toFixed(1)}s</span>
                    </div>`;

content = content.replace(loopsRegex, loopsNew);

// Смотреть всё
content = content.replace(
  /<button\n\s+onClick=\{\(\) => \{\n\s+if \(!isPlayingLoops\) \{\n\s+setIsPlayingLoops\(true\);\n\s+setIsPaused\(false\);\n\s+\} else \{\n\s+setIsPaused\(false\);\n\s+\}\n\s+\}\}\n\s+className=\{`shrink-0 px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg \$\{isPlayingLoops && !isPaused \? 'bg-red-500 text-white shadow-\[0_0_15px_rgba\(239,68,68,0.5\)\]' : 'bg-purple-500 text-white shadow-\[0_0_15px_rgba\(168,85,247,0.5\)\] hover:bg-purple-400'\}`\}\n\s+>\n\s+\{isPlayingLoops && !isPaused \? <><Square size=\{16\} fill="currentColor" \/> Стоп<\/> : <><Play size=\{16\} fill="currentColor" \/> Смотреть всё<\/>\}\n\s+<\/button>/g,
  `<div className="p-[0.5px] rounded-[16px] bg-gradient-to-t from-orange-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                 <button
                    onClick={() => {
                       if (!isPlayingLoops) {
                          setIsPlayingLoops(true);
                          setIsPaused(false);
                       } else {
                          setIsPaused(false);
                       }
                    }}
                    className={\`shrink-0 px-6 py-2 rounded-[16px] font-bold flex items-center gap-2 transition-all \${isPlayingLoops && !isPaused ? 'bg-red-500 text-white drop-shadow-md' : 'bg-gradient-to-t from-purple-500/60 to-black/40 text-white [-webkit-text-stroke:0.25px_#f97316] drop-shadow-[0_0_4px_rgba(168,85,247,0.8)] hover:bg-white/20'}\`}
                 >
                   {isPlayingLoops && !isPaused ? <><Square size={16} fill="currentColor" /> Стоп</> : <><Play size={16} fill="currentColor" /> Смотреть всё</>}
                 </button>
               </div>`
);

// Новый
content = content.replace(
  /<button \n\s+onClick=\{\(\) => \{\n\s+setSavePackName\(`Флекс \$\{\(flexPacks \|\| \[\]\)\.length \+ 1\}`\);\n\s+setSavePackPromptOpen\(true\);\n\s+\}\}\n\s+className="shrink-0 h-16 w-16 rounded-xl border border-orange-500\/50 bg-orange-500\/10 shadow-\[0_0_15px_rgba\(249,115,22,0.2\)\] flex flex-col items-center justify-center text-orange-400 hover:text-orange-300 hover:bg-orange-500\/20 hover:border-orange-400 cursor-pointer transition-all disabled:opacity-50"\n\s+title="Сохранить флекс"\n\s+>\n\s+<Plus size=\{24\} \/>\n\s+<span className="text-\[9px\] font-bold tracking-widest uppercase">Новый<\/span>\n\s+<\/button>/g,
  `<div className="p-[0.5px] rounded-[16px] bg-gradient-to-t from-white/40 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                  <button 
                  onClick={() => {
                     setSavePackName(\`Флекс \${(flexPacks || []).length + 1}\`);
                     setSavePackPromptOpen(true);
                  }}
                  className="shrink-0 h-16 w-16 bg-gradient-to-t from-purple-500/60 to-black/40 rounded-[16px] flex flex-col items-center justify-center text-white/90 hover:text-white hover:bg-white/20 cursor-pointer transition-all disabled:opacity-50"
                  title="Сохранить флекс"
                >
                  <Plus size={24} className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"/>
                  <span className="text-[9px] font-bold tracking-widest uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Новый</span>
                </button>
                </div>`
);

fs.writeFileSync('src/components/ui/AnimationMenu.tsx', content);
