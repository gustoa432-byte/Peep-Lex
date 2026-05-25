import fs from 'fs';

let content = fs.readFileSync('src/components/ui/BodyEditorOverlay.tsx', 'utf8');

// The active tab and inactive tab styles
const tabRegex = /<button\s+onClick=\{\(\) => setActiveTab\('([^']+)'\)\}\s+className=\{`flex-1 flex flex-col items-center justify-center gap-1 py-2\.5 rounded-\[22px\] font-bold text-\[11px\] transition-colors \[text-shadow:0_1px_4px_rgba\(0,0,0,1\)\] drop-shadow-md \$\{activeTab === '[^']+' \? 'bg-orange-500 text-white' : 'bg-gradient-to-t from-purple-500\/60 to-black\/40 border border-white\/10 text-white\/60 hover:bg-white\/20'\}\`\}\s*>([\s\S]*?)<\/button>/g;

content = content.replace(tabRegex, (match, tabName, innerContent) => {
  return `<div className={\`flex-1 p-[0.5px] rounded-[22px] \${activeTab === '${tabName}' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'bg-gradient-to-t from-orange-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.4)]'}\`}>
              <button 
                onClick={() => setActiveTab('${tabName}')}
                className={\`w-full h-full flex flex-col items-center justify-center gap-1 py-2.5 rounded-[22px] font-bold text-[11px] transition-colors \${activeTab === '${tabName}' ? 'bg-orange-500 text-white drop-shadow-md' : 'bg-gradient-to-t from-purple-500/60 to-black/40 text-white [-webkit-text-stroke:0.25px_#f97316] drop-shadow-[0_0_4px_rgba(168,85,247,0.8)] hover:bg-white/20'}\`}
              >${innerContent}</button>
            </div>`;
});

fs.writeFileSync('src/components/ui/BodyEditorOverlay.tsx', content);
console.log('Done tabs');
