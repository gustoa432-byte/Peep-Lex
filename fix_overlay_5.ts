import fs from 'fs';

let content = fs.readFileSync('src/components/ui/BodyEditorOverlay.tsx', 'utf8');

// Update text headers
content = content.replace(/text-white\/70 drop-shadow/g, 'text-white [-webkit-text-stroke:0.25px_#f97316] drop-shadow-[0_0_4px_rgba(168,85,247,0.8)]');

// Update bg-gradient-to-t from-purple-500/60 to-black/40 rounded-[16px] border border-white/10 to have wrappers
const containerRegex = /<div className="flex gap-1\.5 p-1\.5 bg-gradient-to-t from-purple-500\/60 to-black\/40 rounded-\[16px\] border border-white\/10 overflow-x-auto min-w-0 \[\&::\-webkit\-scrollbar\]:hidden \[\-ms\-overflow\-style:none\] \[scrollbar\-width:none\]">/g;

const replacementWrapper = `<div className="p-[0.5px] rounded-[16px] bg-gradient-to-t from-orange-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                <div className="flex gap-1.5 p-1.5 bg-gradient-to-t from-purple-500/60 to-black/40 rounded-[16px] overflow-x-auto min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">`;

// We also need to close the extra div.
// For Gradients
content = content.replace(
  /<div className="flex flex-col gap-0\.5">([\s\S]*?)<div className="flex gap-1\.5 p-1\.5 bg-gradient-to-t from-purple-500\/60 to-black\/40 rounded-\[16px\] border border-white\/10 overflow-x-auto min-w-0 \[\&::\-webkit\-scrollbar\]:hidden \[\-ms\-overflow\-style:none\] \[scrollbar\-width:none\]">([\s\S]*?)<\/div>\n\s*<\/div>/g,
  `<div className="flex flex-col gap-0.5">$1<div className="p-[0.5px] rounded-[16px] bg-gradient-to-t from-orange-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                <div className="flex gap-1.5 p-1.5 bg-gradient-to-t from-purple-500/60 to-black/40 rounded-[16px] overflow-x-auto min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">$2</div>
              </div>
            </div>`
);

fs.writeFileSync('src/components/ui/BodyEditorOverlay.tsx', content);
console.log('Done replacement');
