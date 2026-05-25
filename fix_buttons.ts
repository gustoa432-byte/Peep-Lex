import fs from 'fs';

let content = fs.readFileSync('src/components/ui/AnimationMenu.tsx', 'utf8');

const regexCategory = /const PoseNavCategory = \(\{ icon: Icon, section, label, flip \}: \{ icon: any, section: PoseSection, label: string, flip\?: boolean \}\) => \{\n\s+const isActive = activePoseSection === section;\n\s+const isModified = useSectionModified\(section\);\n\s+return \(\n\s+<button\n\s+onClick=\{\(\) => setActivePoseSection\(isActive \? null : section\)\}\n\s+className=\{`flex flex-col items-center justify-center gap-0.5 shrink-0 w-\[50px\] h-\[46px\] rounded-lg transition-all shadow-lg border \$\{isActive \? 'bg-orange-500\/20 text-orange-400 border-orange-500 shadow-\[0_0_10px_rgba\(249,115,22,0.3\)\]' : isModified \? 'bg-black\/95 text-orange-400 border-orange-500\/50 hover:bg-black hover:text-orange-400' : 'bg-black\/95 text-white\/50 hover:bg-black hover:text-white border-white\/10'\}\`\}\n\s+>\n\s+<Icon size=\{16\} className=\{flip \? "scale-x-\[-1\]" : ""\} \/>\n\s+<span className="text-\[8px\] font-bold text-center leading-tight">\{label\}<\/span>\n\s+<\/button>\n\s+\);\n\s+\};/g;

content = content.replace(regexCategory, `const PoseNavCategory = ({ icon: Icon, section, label, flip }: { icon: any, section: PoseSection, label: string, flip?: boolean }) => {
    const isActive = activePoseSection === section;
    const isModified = useSectionModified(section);
    return (
      <div className={\`shrink-0 w-[50px] h-[46px] p-[0.5px] rounded-[16px] \${isActive ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'bg-gradient-to-t from-orange-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.4)]'}\`}>
        <button
          onClick={() => setActivePoseSection(isActive ? null : section)}
          className={\`w-full h-full flex flex-col items-center justify-center gap-0.5 rounded-[16px] transition-all \${isActive ? 'bg-orange-500 text-white drop-shadow-md' : isModified ? 'bg-gradient-to-t from-purple-500/80 to-black/60 text-orange-400 hover:bg-white/10' : 'bg-gradient-to-t from-purple-500/60 to-black/40 text-white/70 hover:bg-white/10'}\`}
        >
          <Icon size={16} className={flip ? "scale-x-[-1] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" : "drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"} />
          <span className={\`text-[8px] font-bold text-center leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] \${isActive ? '' : '[-webkit-text-stroke:0.25px_#f97316]'}\`}>{label}</span>
        </button>
      </div>
    );
  };`);

fs.writeFileSync('src/components/ui/AnimationMenu.tsx', content);
