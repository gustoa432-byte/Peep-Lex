import fs from 'fs';

let content = fs.readFileSync('src/components/ui/AnimationMenu.tsx', 'utf8');

// Keyframes rendering
const keyframesRegex = /\{keyframes\.map\(\(kf, i\) => \(\n\s+<div key=\{i\} className="shrink-0 flex flex-col gap-2 relative group cursor-pointer" onClick=\{\(\) => handleLoadPose\(kf, i\)\}>\n\s+<div className=\{`w-\[52px\] sm:w-16 h-10 sm:h-12 bg-black\/95 shadow-md border \$\{selectedKeyframeIndex === i \? 'border-orange-500 text-orange-400' : 'border-white\/20 text-white'\} rounded-xl flex items-center justify-center font-bold hover:border-purple-500 transition-all overflow-hidden relative`\}>\n\s+<span className="z-10">\{i \+ 1\}<\/span>\n\s+<\/div>/g;

const keyframesNew = `{keyframes.map((kf, i) => (
                 <div key={i} className="shrink-0 flex flex-col gap-2 relative group cursor-pointer" onClick={() => handleLoadPose(kf, i)}>
                    <div className={\`p-[0.5px] rounded-xl \${selectedKeyframeIndex === i ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'bg-gradient-to-t from-orange-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.4)]'}\`}>
                      <div className={\`w-[52px] sm:w-16 h-10 sm:h-12 rounded-xl flex items-center justify-center font-bold transition-all relative \${selectedKeyframeIndex === i ? 'bg-orange-500 text-white drop-shadow-md' : 'bg-gradient-to-t from-purple-500/60 to-black/40 text-white [-webkit-text-stroke:0.25px_#f97316] drop-shadow-[0_0_4px_rgba(168,85,247,0.8)] hover:bg-white/20'}\`}>
                          <span className="z-10">{i + 1}</span>
                      </div>
                    </div>`;

content = content.replace(keyframesRegex, keyframesNew);


// Play button keyframes
const playButtonOld = /<button\n\s+onClick=\{\(\) => setIsPlayingAnimation\(!isPlayingAnimation\)\}\n\s+className=\{`shrink-0 w-10 sm:w-12 h-10 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-lg \$\{isPlayingAnimation \? 'bg-red-500 text-white shadow-\[0_0_15px_rgba\(239,68,68,0.5\)\]' : 'bg-black\/50 text-white\/90 hover:bg-black\/70 hover:text-white border border-black\/50'\} \$\{\(keyframes\.length > 0 && !isPlayingAnimation && keyframes\.length < 4\) \? 'animate-pulse ring-2 ring-black\/50' : ''\}`\}\n\s+>\n\s+\{isPlayingAnimation \? <Square size=\{20\} fill="currentColor" className="drop-shadow-\[0_1px_2px_rgba\(0,0,0,0\.8\)\]" \/> : <Play size=\{20\} fill="currentColor" className="ml-1 drop-shadow-\[0_1px_2px_rgba\(0,0,0,0\.8\)\]" \/>\}\n\s+<\/button>/g;

const playButtonNew = `<div className="p-[0.5px] rounded-[22px] bg-gradient-to-t from-orange-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                <button
                  onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
                  className={\`shrink-0 w-10 sm:w-12 h-10 sm:h-12 rounded-[22px] flex items-center justify-center transition-all \${isPlayingAnimation ? 'bg-red-500 text-white drop-shadow-md shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-t from-purple-500/60 to-black/40 text-white [-webkit-text-stroke:0.25px_#f97316] hover:bg-white/20'} \${(keyframes.length > 0 && !isPlayingAnimation && keyframes.length < 4) ? 'animate-pulse' : ''}\`}
                >
                  {isPlayingAnimation ? <Square size={20} fill="currentColor" className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" /> : <Play size={20} fill="currentColor" className="ml-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />}
                </button>
               </div>`;

content = content.replace(playButtonOld, playButtonNew);

// Add keyframe button
const addKeyframeBtn = /<button \n\s+onClick=\{handleAddKeyframeWithFlash\}\n\s+className=\{`shrink-0 w-\[52px\] sm:w-16 h-10 sm:h-12 border border-dashed border-white\/40 bg-black\/95 shadow-md rounded-xl flex items-center justify-center text-white\/70 hover:text-white hover:border-white\/70 transition-all \$\{keyframes\.length === 0 \? 'animate-pulse ring-4 ring-white\/30 text-white border-white\/50' : ''\}`\}\n\s+>\n\s+<Plus size=\{20\} \/>\n\s+<\/button>/g;

const addKeyframeBtnNew = `<div className="p-[0.5px] rounded-xl bg-gradient-to-t from-white/40 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                 <button 
                  onClick={handleAddKeyframeWithFlash}
                  className={\`w-[52px] sm:w-16 h-10 sm:h-12 bg-gradient-to-t from-purple-500/60 to-black/40 rounded-xl flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 transition-all \${keyframes.length === 0 ? 'animate-pulse' : ''}\`}
                 >
                   <Plus size={20} className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                 </button>
               </div>`;

content = content.replace(addKeyframeBtn, addKeyframeBtnNew);

// Overwrite button
const overwriteBtn = /<button \n\s+onClick=\{\(e\) => \{\n\s+e\.stopPropagation\(\);\n\s+setShowOverwriteConfirm\(true\);\n\s+\}\}\n\s+className="shrink-0 w-\[52px\] sm:w-16 h-10 sm:h-12 border border-orange-500 bg-orange-500\/20 shadow-md rounded-xl flex items-center justify-center text-orange-400 hover:text-white hover:bg-orange-500 transition-all"\n\s+title="Пересохранить позу"\n\s+>\n\s+<Save size=\{20\} \/>\n\s+<\/button>/g;

const overwriteBtnNew = `<div className="p-[0.5px] rounded-xl bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]">
                 <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOverwriteConfirm(true);
                  }}
                  className="w-[52px] sm:w-16 h-10 sm:h-12 bg-gradient-to-t from-purple-500/60 to-black/40 rounded-xl flex items-center justify-center text-white hover:bg-orange-500 transition-all"
                  title="Пересохранить позу"
                 >
                   <Save size={20} className="stroke-orange-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                 </button>
               </div>`;

content = content.replace(overwriteBtn, overwriteBtnNew);


fs.writeFileSync('src/components/ui/AnimationMenu.tsx', content);
