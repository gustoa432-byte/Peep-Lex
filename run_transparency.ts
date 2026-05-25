import fs from 'fs';

let content = fs.readFileSync('src/components/ui/AnimationMenu.tsx', 'utf8');

// Music
content = content.replace(
  /globalTrackUrl \? 'bg-cyan-500 hover:bg-cyan-400 drop-shadow-md'/g,
  `globalTrackUrl ? 'bg-cyan-500/70 hover:bg-cyan-400/80 drop-shadow-md'`
);
content = content.replace(
  /globalTrackUrl \? 'bg-cyan-500 shadow-\[0_0_8px_rgba\(6,182,212,0\.6\)\]'/g,
  `globalTrackUrl ? 'bg-cyan-500/70 shadow-[0_0_8px_rgba(6,182,212,0.6)]'`
);

// Video
content = content.replace(
  /backgroundVideoUrl \? 'bg-purple-500 hover:bg-purple-400 drop-shadow-md'/g,
  `backgroundVideoUrl ? 'bg-purple-500/70 hover:bg-purple-400/80 drop-shadow-md'`
);
content = content.replace(
  /backgroundVideoUrl \? 'bg-purple-500 shadow-\[0_0_8px_rgba\(168,85,247,0\.6\)\]'/g,
  `backgroundVideoUrl ? 'bg-purple-500/70 shadow-[0_0_8px_rgba(168,85,247,0.6)]'`
);

// Library
content = content.replace(
  /from-purple-500\/60 to-black\/40 hover:bg-orange-500 text-white/g,
  `from-purple-500/60 to-black/40 hover:bg-orange-500/70 text-white`
);
content = content.replace(
  /bg-orange-500 shadow-\[0_0_8px_rgba\(249,115,22,0\.6\)\]/g,
  `bg-orange-500/70 shadow-[0_0_8px_rgba(249,115,22,0.6)]`
);

// Close
content = content.replace(
  /from-purple-500\/60 to-black\/40 hover:bg-red-500 text-white/g,
  `from-purple-500/60 to-black/40 hover:bg-red-500/70 text-white`
);
content = content.replace(
  /bg-red-500 shadow-\[0_0_8px_rgba\(239,68,68,0\.6\)\]/g,
  `bg-red-500/70 shadow-[0_0_8px_rgba(239,68,68,0.6)]`
);

// Смотреть всё
content = content.replace(
  /'bg-red-500 text-white shadow-\[0_0_15px_rgba\(239,68,68,0\.5\)\]' : 'bg-purple-500 text-white shadow-\[0_0_15px_rgba\(168,85,247,0\.5\)\] hover:bg-purple-400'/g,
  `'bg-red-500/70 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-purple-500/70 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:bg-purple-500/80'`
);

content = content.replace(
  /'bg-red-500 text-white drop-shadow-md' : 'bg-gradient-to-t from-purple-500\/60 to-black\/40 text-white \[-webkit-text-stroke:0.25px_#f97316\]/g,
  `'bg-red-500/70 text-white drop-shadow-md' : 'bg-gradient-to-t from-purple-500/60 to-black/40 text-white [-webkit-text-stroke:0.25px_#f97316]`
);

fs.writeFileSync('src/components/ui/AnimationMenu.tsx', content);

