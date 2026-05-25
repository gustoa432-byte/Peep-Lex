import fs from 'fs';

let content = fs.readFileSync('src/components/ui/AnimationMenu.tsx', 'utf8');

// Music
content = content.replace(
  /<div className=\{\`p-\[0\.5px\] rounded-full \$\{globalTrackUrl \? 'bg-cyan-500 shadow-\[0_0_8px_rgba\(6,182,212,0\.6\)\]' : 'bg-gradient-to-t from-white\/40 to-transparent shadow-\[0_0_4px_rgba\(168,85,247,0\.4\)\]'\}\`\}>\n\s+<button\n\s+onClick=\{\(\) => \{\n\s+setShowMediaModal\('audio'\);\n\s+\}\}\n\s+className=\{\`p-3 \$\{globalTrackUrl \? 'bg-cyan-500 hover:bg-cyan-400 drop-shadow-md' : 'bg-gradient-to-t from-purple-500\/60 to-black\/40 hover:bg-white\/20'\} text-white rounded-full transition-all\`\}\n\s+title="Музыка"\n\s+>\n\s+<Music size=\{20\} className="drop-shadow-\[0_1px_2px_rgba\(0,0,0,0\.8\)\]" \/>\n\s+<\/button>\n\s+<\/div>/g,
  `<div className={\`p-[0.5px] rounded-full \${globalTrackUrl ? 'bg-cyan-500/70 shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'bg-gradient-to-t from-white/40 to-transparent shadow-[0_0_4px_rgba(168,85,247,0.4)]'}\`}>
                  <button
                      onClick={() => {
                          setShowMediaModal('audio');
                      }}
                      className={\`p-3 \${globalTrackUrl ? 'bg-cyan-500/70 hover:bg-cyan-400/80 drop-shadow-md' : 'bg-gradient-to-t from-purple-500/60 to-black/40 hover:bg-white/20'} text-white rounded-full transition-all\`}
                      title="Музыка"
                  >
                      <Music size={20} className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                  </button>
                </div>`
);

// Video
content = content.replace(
  /<div className=\{\`p-\[0\.5px\] rounded-full \$\{backgroundVideoUrl \? 'bg-purple-500 shadow-\[0_0_8px_rgba\(168,85,247,0\.6\)\]' : 'bg-gradient-to-t from-white\/40 to-transparent shadow-\[0_0_4px_rgba\(168,85,247,0\.4\)\]'\}\`\}>\n\s+<button\n\s+onClick=\{\(\) => \{\n\s+setShowMediaModal\('video'\);\n\s+\}\}\n\s+className=\{\`p-3 \$\{backgroundVideoUrl \? 'bg-purple-500 hover:bg-purple-400 drop-shadow-md' : 'bg-gradient-to-t from-purple-500\/60 to-black\/40 hover:bg-white\/20'\} text-white rounded-full transition-all\`\}\n\s+title="Фоновое видео"\n\s+>\n\s+<Video size=\{20\} className="drop-shadow-\[0_1px_2px_rgba\(0,0,0,0\.8\)\]" \/>\n\s+<\/button>\n\s+<\/div>/g,
  `<div className={\`p-[0.5px] rounded-full \${backgroundVideoUrl ? 'bg-purple-500/70 shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'bg-gradient-to-t from-white/40 to-transparent shadow-[0_0_4px_rgba(168,85,247,0.4)]'}\`}>
                  <button
                      onClick={() => {
                          setShowMediaModal('video');
                      }}
                      className={\`p-3 \${backgroundVideoUrl ? 'bg-purple-500/70 hover:bg-purple-400/80 drop-shadow-md' : 'bg-gradient-to-t from-purple-500/60 to-black/40 hover:bg-white/20'} text-white rounded-full transition-all\`}
                      title="Фоновое видео"
                  >
                      <Video size={20} className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                  </button>
                </div>`
);

// Library
content = content.replace(
  /<div className="p-\[0\.5px\] rounded-full bg-orange-500 shadow-\[0_0_8px_rgba\(249,115,22,0\.6\)\]">\n\s+<button\n\s+onClick=\{\(\) => setShowLibrary\(true\)\}\n\s+className="p-3 bg-gradient-to-t from-purple-500\/60 to-black\/40 hover:bg-orange-500 text-white rounded-full transition-all"\n\s+title="Библиотека флексов"\n\s+>\n\s+<Library size=\{20\} className="stroke-orange-500 drop-shadow-\[0_1px_2px_rgba\(0,0,0,0\.8\)\]" \/>\n\s+<\/button>\n\s+<\/div>/g,
  `<div className="p-[0.5px] rounded-full bg-orange-500/70 shadow-[0_0_8px_rgba(249,115,22,0.6)]">
                  <button
                      onClick={() => setShowLibrary(true)}
                      className="p-3 bg-gradient-to-t from-purple-500/60 to-black/40 hover:bg-orange-500/70 text-white rounded-full transition-all"
                      title="Библиотека флексов"
                  >
                      <Library size={20} className="stroke-orange-500 hover:stroke-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                  </button>
                </div>`
);

// Close editor
content = content.replace(
  /<div className="p-\[0\.5px\] rounded-full bg-red-500 shadow-\[0_0_8px_rgba\(239,68,68,0\.6\)\]">\n\s+<button\n\s+onClick=\{handleCloseEditor\}\n\s+className="p-3 bg-gradient-to-t from-purple-500\/60 to-black\/40 hover:bg-red-500 text-white rounded-full transition-all"\n\s+title="Закрыть редактор"\n\s+>\n\s+<X size=\{20\} strokeWidth=\{3\} className="stroke-red-500 hover:stroke-white drop-shadow-\[0_1px_2px_rgba\(0,0,0,0\.8\)\]" \/>\n\s+<\/button>\n\s+<\/div>/g,
  `<div className="p-[0.5px] rounded-full bg-red-500/70 shadow-[0_0_8px_rgba(239,68,68,0.6)]">
              <button
                onClick={handleCloseEditor}
                className="p-3 bg-gradient-to-t from-purple-500/60 to-black/40 hover:bg-red-500/80 text-white rounded-full transition-all"
                title="Закрыть редактор"
              >
                <X size={20} strokeWidth={3} className="stroke-red-500 hover:stroke-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
              </button>
            </div>`
);

// Play all
content = content.replace(
  /<div className="p-\[0\.5px\] rounded-\[16px\] bg-gradient-to-t from-orange-500 to-transparent shadow-\[0_0_8px_rgba\(168,85,247,0\.4\)\]">\n\s+<button\n\s+onClick=\{\(\) => \{\n\s+if \(!isPlayingLoops\) \{\n\s+setIsPlayingLoops\(true\);\n\s+setIsPaused\(false\);\n\s+\} else \{\n\s+setIsPaused\(false\);\n\s+\}\n\s+\}\}\n\s+className=\{\`shrink-0 px-6 py-2 rounded-\[16px\] font-bold flex items-center gap-2 transition-all \$\{isPlayingLoops && !isPaused \? 'bg-red-500 text-white drop-shadow-md' : 'bg-gradient-to-t from-purple-500\/60 to-black\/40 text-white \\\[-webkit-text-stroke:0\.25px_#f97316\\\] drop-shadow-\[0_0_4px_rgba\(168,85,247,0\.8\)\] hover:bg-white\/20'\}\`\}\n\s+>\n\s+\{isPlayingLoops && !isPaused \? <><Square size=\{16\} fill="currentColor" \/> Стоп<\/> : <><Play size=\{16\} fill="currentColor" \/> Смотреть всё<\/>\}\n\s+<\/button>\n\s+<\/div>/g,
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
                    className={\`shrink-0 px-6 py-2 rounded-[16px] font-bold flex items-center gap-2 transition-all \${isPlayingLoops && !isPaused ? 'bg-red-500/70 hover:bg-red-500/80 text-white drop-shadow-md' : 'bg-purple-500/70 hover:bg-purple-400/80 text-white drop-shadow-md'}\`}
                 >
                   {isPlayingLoops && !isPaused ? <><Square size={16} fill="currentColor" /> Стоп</> : <><Play size={16} fill="currentColor" /> Смотреть всё</>}
                 </button>
               </div>`
);


fs.writeFileSync('src/components/ui/AnimationMenu.tsx', content);
