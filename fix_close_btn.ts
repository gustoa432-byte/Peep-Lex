import fs from 'fs';

let content = fs.readFileSync('src/components/ui/BodyEditorOverlay.tsx', 'utf8');

content = content.replace(
  /<button \n\s*onClick=\{\(\) => setIsBodyEditorOpen\(false\)\}\n\s*className="w-14 h-14 bg-gradient-to-t from-purple-500\/60 to-black\/40 border-b border-l border-white\/20 rounded-bl-\[32px\] flex flex-col items-center justify-center text-white hover:bg-orange-500 hover:border-orange-500 transition-all shadow-xl backdrop-blur-none"\n\s*>\n\s*<X size=\{28\} className="ml-2 mb-2" \/>\n\s*<\/button>/g,
  `<div className="p-[0.5px] rounded-bl-[32px] bg-gradient-to-t from-orange-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.4)]">
          <button 
            onClick={() => setIsBodyEditorOpen(false)}
            className="w-14 h-14 bg-gradient-to-t from-purple-500/60 to-black/40 rounded-bl-[32px] flex flex-col items-center justify-center text-white hover:bg-orange-500 transition-all backdrop-blur-none"
          >
            <X size={28} className="ml-2 mb-2 drop-shadow-[0_0_4px_rgba(168,85,247,0.8)] stroke-orange-500" strokeWidth={2.5}/>
          </button>
        </div>`
);

fs.writeFileSync('src/components/ui/BodyEditorOverlay.tsx', content);
console.log('Done close button');
