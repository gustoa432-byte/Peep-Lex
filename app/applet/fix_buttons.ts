import fs from 'fs';

let content = fs.readFileSync('src/components/ui/BodyEditorOverlay.tsx', 'utf8');

// For emotions
const emotionOld = `].map(emo => (
                  <button
                    key={emo.id}
                    onClick={() => useStore.getState().updateDevSettings({ emotion: emo.id as any })}
                    className={\`py-2 px-1 rounded-xl text-xs font-bold transition-all border \${
                      useStore.getState().devSettings.emotion === emo.id 
                        ? 'bg-orange-500/20 border-orange-500 text-white' 
                        : 'bg-black/20 border-white/10 text-white/50 hover:bg-white/10'
                    }\`}
                  >
                    {emo.label}
                  </button>
                ))}`;

const emotionNew = `].map(emo => {
                  const isActive = useStore.getState().devSettings.emotion === emo.id;
                  return (
                    <div key={emo.id} className={\`p-[0.5px] rounded-xl \${isActive ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'bg-gradient-to-t from-orange-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.4)]'}\`}>
                      <button
                        onClick={() => useStore.getState().updateDevSettings({ emotion: emo.id as any })}
                        className={\`w-full h-full py-2 px-1 rounded-xl text-xs font-bold transition-all \${
                          isActive 
                            ? 'bg-orange-500 text-white drop-shadow-md' 
                            : 'bg-gradient-to-t from-purple-500/60 to-black/40 text-white/70 hover:bg-white/20'
                        }\`}
                      >
                        {emo.label}
                      </button>
                    </div>
                  );
                })}`;

// For effects
const effectOld = `return (
                    <button
                      key={effect.id}
                      onClick={() => {
                        state.updateDevSettings({ [effect.id]: !isActive });
                      }}
                      className={\`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all \${
                        isActive 
                          ? 'bg-orange-500/20 border-orange-500 text-white' 
                          : 'bg-black/20 border-white/10 text-white/70 hover:bg-white/10'
                      }\`}
                    >
                      <span className="font-bold text-sm">{effect.label}</span>
                      <div className={\`w-10 h-5 rounded-full transition-colors relative \${isActive ? 'bg-orange-500' : 'bg-white/20'}\`}>
                        <div className={\`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-transform \${isActive ? 'left-5' : 'left-1'}\`} />
                      </div>
                    </button>
                  );`;

const effectNew = `return (
                    <div key={effect.id} className={\`p-[0.5px] rounded-xl \${isActive ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'bg-gradient-to-t from-orange-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.4)]'}\`}>
                      <button
                        onClick={() => {
                          state.updateDevSettings({ [effect.id]: !isActive });
                        }}
                        className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all \${
                          isActive 
                            ? 'bg-orange-500 text-white drop-shadow-md' 
                            : 'bg-gradient-to-t from-purple-500/60 to-black/40 text-white/70 hover:bg-white/20'
                        }\`}
                      >
                        <span className="font-bold text-sm">{effect.label}</span>
                        <div className={\`w-10 h-5 rounded-full transition-colors relative \${isActive ? 'bg-white/40' : 'bg-white/20'}\`}>
                          <div className={\`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-transform \${isActive ? 'left-5' : 'left-1'}\`} />
                        </div>
                      </button>
                    </div>
                  );`;

content = content.replace(emotionOld, emotionNew);
content = content.replace(effectOld, effectNew);

fs.writeFileSync('src/components/ui/BodyEditorOverlay.tsx', content);
console.log("Updated BodyEditorOverlay.tsx");
