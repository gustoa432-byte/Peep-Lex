import fs from 'fs';

let content = fs.readFileSync('src/components/ui/AnimationMenu.tsx', 'utf8');

// For all p-[0.5px] wrappers, change `bg-gradient-to-t` to `bg-gradient-to-b`
content = content.replace(
  /<div className="p-\[0\.5px\] (.*?)bg-gradient-to-t (.*?)to-transparent(.*?)">/g,
  '<div className="p-[0.5px] $1bg-gradient-to-b $2to-transparent$3">'
);

content = content.replace(
  /<div className=\{\`shrink-0 w-\[50px\] h-\[46px\] p-\[0\.5px\] rounded-\[16px\] \$\{isActive \? 'bg-orange-500\/70 shadow-\[0_0_8px_rgba\(249,115,22,0\.6\)\]' : 'bg-gradient-to-t from-orange-500 to-transparent shadow-\[0_0_8px_rgba\(168,85,247,0\.4\)\]'\}\`\}>/g,
  `<div className={\`shrink-0 w-[50px] h-[46px] p-[0.5px] rounded-[16px] \${isActive ? 'bg-orange-500/70 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'bg-gradient-to-b from-orange-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.4)]'}\`}>`
);

content = content.replace(
  /<div className=\{\`p-\[0\.5px\] rounded-xl \$\{selectedKeyframeIndex === i \? 'bg-orange-500\/70 shadow-\[0_0_8px_rgba\(249,115,22,0\.6\)\]' : 'bg-gradient-to-t from-orange-500 to-transparent shadow-\[0_0_8px_rgba\(168,85,247,0\.4\)\]'\}\`\}>/g,
  `<div className={\`p-[0.5px] rounded-xl \${selectedKeyframeIndex === i ? 'bg-orange-500/70 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'bg-gradient-to-b from-orange-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.4)]'}\`}>`
);

// We had some from-purple-500/60 to-black/40 on the wrapper as well (line 735), let's change it.
content = content.replace(
  /<div key=\{loop\.id\} className="p-\[0\.5px\] rounded-\[16px\] bg-gradient-to-t from-purple-500\/60 to-black\/40 shadow-\[0_0_8px_rgba\(168,85,247,0\.4\)\] transform hover:scale-105 transition-all">/g,
  `<div key={loop.id} className="p-[0.5px] rounded-[16px] bg-gradient-to-b from-purple-500/60 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.4)] transform hover:scale-105 transition-all">`
);

fs.writeFileSync('src/components/ui/AnimationMenu.tsx', content);
